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
        <div className="flex items-center justify-center h-full text-black text-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to KusinAI</h1>
            <p className="max-w-xl mx-auto mb-6">
              An intelligent Filipino cooking assistant that provides you recipes based on the ingredients you already have.
            </p>
            {!isLoggedIn() && (
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
                Register / Log-in
              </Link>
            )}
          </div>
        </div>
      </MainLayout>
    </PageTransition>
  );
}

export default Landing;
