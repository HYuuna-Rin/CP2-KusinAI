/*
  File: src/pages/Contact.jsx
  Purpose: Contact page for user inquiries/support.
*/
import React, { useState } from "react";
import axios from "axios";
import LoadingOverlay from "../components/ui/loading";
import { useToast } from "../context/ToastContext";
const API_URL = import.meta.env.VITE_API_URL;
import PageTransition from "../components/PageTransition";
import MainLayout from "../components/MainLayout";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

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
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/feedback`, form);
      showToast({ message: "Thanks! We’ll get back to you soon.", type: "success" });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setErrors({ submit: "Failed to send message. Please try again later." });
      showToast({ message: "Failed to send message", type: "error" });
    }
    setLoading(false);
  };

  return (
    <PageTransition>
      <MainLayout>
        <main className="flex-grow flex items-center justify-center text-text px-4 py-8">
          <div className="bg-surface/90 backdrop-blur-sm p-6 rounded-lg max-w-xl w-full shadow-lg text-left space-y-4">
            <h2 className="text-2xl font-bold text-primary text-center mb-2">Contact Us</h2>
            {/* Social Links */}
            <p><span className="font-semibold text-leaf">Email:</span> <a href="mailto:kusinai27@gmail.com" className="underline text-primary">kusinai27@gmail.com</a></p>
            <p><span className="font-semibold text-leaf">Address:</span> Tarlac City, Tarlac</p>
            <p><span className="font-semibold text-leaf">Office Hours:</span> Mon-Fri, 9am-5pm</p>
            <p>We're open to <span className="text-leaf">feedback</span>, <span className="text-leaf">partnerships</span>, or <span className="text-leaf">feature requests</span>. Feel free to contact us for any concerns.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-leaf">Meet the Team</h2>
            <div className="flex flex-wrap gap-6 justify-center mb-2">
              <div className="bg-background/80 rounded-lg p-4 w-48 flex flex-col items-center">
                <img src="assets/Ramos.jpg" alt="Team Member" className="w-20 h-20 rounded-full mb-2 object-cover border-2 border-accent" />
                <div className="font-semibold text-text">Catherine T. Ramos</div>
                <div className="text-xs text-leaf">Project Lead</div>
                <div className="text-xs mt-2 text-tamarind"><a href="mailto:ramoscath12@gmail.com" className="underline text-primary">ramoscath12@gmail.com</a></div>
              </div>
              <div className="bg-background/80 rounded-lg p-4 w-48 flex flex-col items-center">
                <img src="assets/Jhowne_Profile.jpg" alt="Team Member" className="w-20 h-20 rounded-full mb-2 object-cover border-2 border-accent" />
                <div className="font-semibold text-text">Joeshua Jhowne P. Del Rosario</div>
                <div className="text-xs text-leaf">Developer</div>
                <div className="text-xs mt-2 text-tamarind"><a href="mailto:jhowne.delrosario@gmail.com" className="underline text-primary">jhowne.delrosario@gmail.com</a></div>
              </div>
              <div className="bg-background/80 rounded-lg p-4 w-48 flex flex-col items-center">
                <img src="assets/Edra.jpeg" alt="Team Member" className="w-20 h-20 rounded-full mb-2 object-cover border-2 border-accent" />
                <div className="font-semibold text-text">Edralyn T. Gardanozo</div>
                <div className="text-xs text-leaf">Developer</div>
                <div className="text-xs mt-2 text-tamarind"><a href="mailto:edralyngardanozo999@gmail.com" className="underline text-primary">edralyngardanozo999@gmail.com</a></div>
              </div>
              <div className="bg-background/80 rounded-lg p-4 w-48 flex flex-col items-center">
                <img src="assets/Sablan.jpg" alt="Team Member" className="w-20 h-20 rounded-full mb-2 object-cover border-2 border-accent" />
                <div className="font-semibold text-text">Myles A. Sablan</div>
                <div className="text-xs text-leaf">Developer</div>
                <div className="text-xs mt-2 text-tamarind"><a href="mailto:sablanmyles@gmail.com" className="underline text-primary">sablanmyles@gmail.com</a></div>
              </div>
            </div>
          </div>
          {loading && <LoadingOverlay text="Sending..." />}
        </main>
      </MainLayout>
    </PageTransition>
  );
}

export default Contact;
