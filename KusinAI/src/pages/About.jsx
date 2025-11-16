/*
  File: src/pages/About.jsx
  Purpose: About page describing KusinAI and its mission.
*/
import React from "react";
import PageTransition from "../components/PageTransition";
import MainLayout from "../components/MainLayout";

function About() {
  return (
    <PageTransition>
      <MainLayout>
        <main className="flex-grow flex items-center justify-center text-text px-4 py-8">
          <div className="bg-surface/90 backdrop-blur-sm rounded-lg p-6 max-w-4xl w-full text-sm sm:text-base leading-relaxed shadow-lg">
            <h1 className="text-3xl font-bold mb-4 text-primary text-center">About Us</h1>
            <p className="mb-4">
              KusinAI is a personalized cooking assistant that helps Filipino households, health‑conscious individuals, and students make the most of the ingredients they already have. Our mission is to reduce food waste and promote healthier eating by providing culturally relevant recipe suggestions.
            </p>
            <p className="mb-4">
              Beyond recipe suggestions, KusinAI offers real‑time ingredient scanning, nutrition breakdowns, and dietary modifications. With a chatbot assistant and reliable food data sources like USDA FoodData Central, plus manually curated ingredient substitutions, users can quickly tailor dishes to their needs.
            </p>
            <p className="mb-6">
              This platform was developed as a capstone project by Information Technology students from Tarlac State University, powered by modern tools such as OpenAI, MongoDB, React, Node.js, and Google Cloud APIs.
            </p>

            <h2 className="text-xl font-semibold mb-2 text-leaf">Project Milestones</h2>
            <ul className="list-disc ml-6 mb-2 text-left">
              <li>Idea & Planning — Aug 2024 to Dec 2024</li>
              <li>Research & Prototyping — Aug 2024 to Jun 2025</li>
              <li>Development — Jul to Nov 2025</li>
              <li>Testing & Feedback — Nov 2025</li>
              <li>Initial Release — Nov 2025</li>
            </ul>
          </div>
        </main>
      </MainLayout>
    </PageTransition>
  );
}

export default About;
