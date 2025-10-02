import React, { useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
import PageTransition from "../components/PageTransition";
import MainLayout from "../components/MainLayout";

function Contact() {
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
    if (!form.message.trim()) errs.message = "Message is required.";
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
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/feedback`, form);
      setSuccess("Thank you for contacting us! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setSuccess("");
      setErrors({ submit: "Failed to send message. Please try again later." });
    }
    setLoading(false);
  };

  return (
    <PageTransition>
      <MainLayout>
        <main className="flex-grow flex items-center justify-center text-white text-center px-6 py-8">
          <div className="bg-black/50 p-6 rounded-lg max-w-xl w-full shadow-lg text-left space-y-4">
            <h2 className="text-2xl font-bold text-white text-center mb-2">Contact Us</h2>
            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-4">
              <a href="https://facebook.com/kusinai" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                <span role="img" aria-label="Facebook">📘</span> Facebook
              </a>
              <a href="https://linkedin.com/company/kusinai" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                <span role="img" aria-label="LinkedIn">💼</span> LinkedIn
              </a>
            </div>
            <p><span className="font-semibold">Email:</span> <a href="mailto:support@kusinai.ph" className="underline">support@kusinai.ph</a></p>
            <p><span className="font-semibold">Phone:</span> <a href="tel:+639123456789" className="underline">+63 912 345 6789</a></p>
            <p><span className="font-semibold">Address:</span> 3rd Floor, IT Building, Pamantasan ng Lungsod ng Maynila</p>
            <p><span className="font-semibold">Office Hours:</span> Mon-Fri, 9am-5pm</p>
            <p>We're open to feedback, partnerships, or feature requests. Feel free to contact us for any concerns.</p>
          </div>
        </main>
      </MainLayout>
    </PageTransition>
  );
}

export default Contact;
