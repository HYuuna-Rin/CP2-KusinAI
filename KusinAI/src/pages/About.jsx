import React from "react";
import PageTransition from "../components/PageTransition";
import MainLayout from "../components/MainLayout";

function About() {
  return (
    <PageTransition>
      <MainLayout>
        <main className="flex-grow flex items-center justify-center bg-black/50 text-white text-center px-4 py-8">
          <div className="bg-black/60 rounded-lg p-6 max-w-4xl w-full text-sm sm:text-base leading-relaxed shadow-lg">
            <h1 className="text-3xl font-bold mb-4 text-white">ABOUT US</h1>
            <p className="mb-4">
              KusinAI is a personalized web-based cooking assistant developed to help Filipino households, health-conscious individuals, and food educators make the most of their available ingredients. Our goal is to reduce food waste and promote healthier eating habits by providing culturally relevant recipe suggestions based on what users already have at home.
            </p>
            <p className="mb-4">
              KusinAI does more than just suggest meals — it empowers users to explore Filipino recipes with features like real-time ingredient scanning, nutrition breakdowns, dietary modifications, and voice-guided cooking support. With an integrated chatbot powered by GPT-3.5/4 and enhanced by trusted food databases such as Spoonacular and USDA FoodData Central, users can get instant answers about nutrition, substitutions, and how to tailor dishes to specific dietary needs.
            </p>
            <p>
              This platform was developed as a capstone project by Information Technology students with a passion for solving practical problems using modern tools like OpenAI, MongoDB, ReactJS, Node.js, and Google Cloud APIs. KusinAI aims to be an intelligent kitchen companion — making cooking easier, healthier, and more sustainable for every Filipino home.
            </p>
          </div>
        </main>
      </MainLayout>
    </PageTransition>
  );
}

export default About;
