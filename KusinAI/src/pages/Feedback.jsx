 import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
import PageTransition from "../components/PageTransition";
import MainLayout from "../components/MainLayout";

function Feedback() {
  // Get logged-in user info from token
  let loggedUser = null;
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      loggedUser = { name: decoded.name, email: decoded.email };
    } catch {}
  }
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = "Invalid email address.";
    }
    if (!form.message.trim()) errs.message = "Feedback is required.";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    // Check if logged-in user matches form input
    if (loggedUser) {
      if (form.name.trim() !== loggedUser.name || form.email.trim() !== loggedUser.email) {
        setErrors({ submit: "Name and email must match your logged-in account." });
        return;
      }
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/feedback`, form);
      setSuccess("Thank you for your feedback! We appreciate your input.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setSuccess("");
      setErrors({ submit: "Failed to send feedback. Please try again later." });
    }
    setLoading(false);
  };

  return (
    <PageTransition>
      <MainLayout>
        <main className="flex-grow flex items-center justify-center bg-background/0 text-text text-center px-6 py-8">
          <form
            className="bg-surface/90 p-6 rounded-lg max-w-xl w-full text-left space-y-4 shadow-xl"
            onSubmit={handleSubmit}
            noValidate
          >
            <h2 className="text-2xl font-bold text-primary mb-4 text-center">Feedback Form</h2>
            {success && (
              <div className="bg-primary text-white p-2 rounded text-center mb-2">{success}</div>
            )}
            {errors.submit && (
              <div className="bg-accent text-white p-2 rounded text-center mb-2">{errors.submit}</div>
            )}
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className={`w-full px-4 py-2 rounded bg-background text-text focus:outline-none border border-leaf/40 focus:border-leaf ${errors.name ? "border-accent" : ""}`}
            />
            {errors.name && <div className="text-accent text-sm">{errors.name}</div>}
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              className={`w-full px-4 py-2 rounded bg-background text-text focus:outline-none border border-leaf/40 focus:border-leaf ${errors.email ? "border-accent" : ""}`}
            />
            {errors.email && <div className="text-accent text-sm">{errors.email}</div>}
            <textarea
              rows="4"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Write your feedback..."
              className={`w-full px-4 py-2 rounded bg-background text-text focus:outline-none border border-leaf/40 focus:border-leaf ${errors.message ? "border-accent" : ""}`}
            ></textarea>
            {errors.message && <div className="text-accent text-sm">{errors.message}</div>}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-leaf text-white py-2 rounded transition-colors"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </main>
      </MainLayout>
    </PageTransition>
  );
}

export default Feedback;
