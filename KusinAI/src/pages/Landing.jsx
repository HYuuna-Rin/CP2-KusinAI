/*
  File: src/pages/Landing.jsx
  Purpose: Public landing/home page introducing KusinAI.
*/
import React from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import MainLayout from "../components/MainLayout";
import { isLoggedIn } from "../utils/auth";

function Landing() {
  return (
    <PageTransition>
      <MainLayout>
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto mt-8 px-4">
          <div className="bg-surface/90 backdrop-blur-sm rounded-xl p-8 shadow">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary text-center">Cook Smarter with KusinAI</h1>
            <p className="text-center mt-3 text-text/90 max-w-2xl mx-auto">
              Get Filipino recipes from the ingredients you already have. Scan, search, and personalize meals with nutrition and substitution insights.
            </p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              {!isLoggedIn() && (
                <Link to="/login" className="bg-primary hover:bg-leaf text-white px-5 py-2 rounded font-semibold">Register / Log in</Link>
              )}
              <Link to="/search" className="bg-background border border-leaf text-leaf px-5 py-2 rounded font-semibold">Search Recipes</Link>
              <a href="#features" className="px-5 py-2 rounded font-semibold text-primary hover:underline">Explore Features</a>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-6xl mx-auto mt-8 px-4 grid md:grid-cols-3 gap-4">
          {[
            { title: "Ingredient Scanner", desc: "Scan labels to auto-fill your ingredient search.", icon: "📷" },
            { title: "Nutrition Insights", desc: "USDA-backed nutrition breakdown per serving.", icon: "🥗" },
          ].map((f, idx) => (
            <div key={idx} className="bg-surface/90 backdrop-blur-sm rounded-xl p-5 shadow text-center">
              <div className="text-3xl mb-2 select-none">{f.icon}</div>
              <h3 className="text-lg font-semibold text-primary">{f.title}</h3>
              <p className="text-sm text-text/90 mt-1">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA Row */}
        <section className="max-w-6xl mx-auto my-10 px-4 grid md:grid-cols-2 gap-4">
          <Link to="/about" className="bg-surface/90 backdrop-blur-sm rounded-xl p-6 shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-leaf">What is KusinAI?</h3>
            <p className="text-sm mt-1">Learn about the project and how we help you reduce food waste.</p>
          </Link>
          <Link to="/feedback" className="bg-surface/90 backdrop-blur-sm rounded-xl p-6 shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-leaf">Share Feedback</h3>
            <p className="text-sm mt-1">Tell us what to improve — we’re listening.</p>
          </Link>
        </section>
      </MainLayout>
    </PageTransition>
  );
}

export default Landing;
