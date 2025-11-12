import React from "react";
import PageTransition from "../components/PageTransition";
import MainLayout from "../components/MainLayout";

function About() {
  return (
    <PageTransition>
      <MainLayout>
        <main className="flex-grow flex items-center justify-center bg-background/0 text-text text-center px-4 py-8">
          <div className="bg-surface/90 rounded-lg p-6 max-w-4xl w-full text-sm sm:text-base leading-relaxed shadow-lg">
            <h1 className="text-3xl font-bold mb-4 text-primary flex items-center justify-center gap-2">
              <span>ABOUT US</span>
              <span role="img" aria-label="chef">👨‍🍳</span>
            </h1>
            <p className="mb-4 flex items-center gap-2">
              <span role="img" aria-label="lightbulb">💡</span>
              KusinAI is a personalized web-based cooking assistant developed to help Filipino households, health-conscious individuals, and food educators make the most of their available ingredients. Our goal is to reduce food waste and promote healthier eating habits by providing culturally relevant recipe suggestions based on what users already have at home.
            </p>
            <p className="mb-4 flex items-center gap-2">
              <span role="img" aria-label="bowl">🥣</span>
              KusinAI does more than just suggest meals — it empowers users to explore Filipino recipes with features like real-time ingredient scanning, nutrition breakdowns, dietary modifications, and voice-guided cooking support. With an integrated chatbot powered by GPT-3.5/4 and enhanced by trusted food databases such as Spoonacular and USDA FoodData Central, users can get instant answers about nutrition, substitutions, and how to tailor dishes to specific dietary needs.
            </p>
            <p className="mb-6 flex items-center gap-2">
              <span role="img" aria-label="rocket">🚀</span>
              This platform was developed as a capstone project by Information Technology students with a passion for solving practical problems using modern tools like OpenAI, MongoDB, ReactJS, Node.js, and Google Cloud APIs. KusinAI aims to be an intelligent kitchen companion — making cooking easier, healthier, and more sustainable for every Filipino home.
            </p>

            {/* Timeline / Milestones */}
            <h2 className="text-xl font-bold mb-4 text-leaf">Project Milestones</h2>
            <ul className="list-disc ml-6 mb-6 text-left text-text">
              <li>📝 Idea & Planning - Aug 2024 to Dec 2024</li>
              <li>🔬 Research & Prototyping - Aug 2024 to June 2025</li>
              <li>💻 Development - Jul to Nov 2025</li>
              <li>🧪 Testing & Feedback - Nov 2025</li>
              <li>🚀 Launch - Nov 2025</li>
            </ul>
          </div>
        </main>
      </MainLayout>
    </PageTransition>
  );
}

export default About;
