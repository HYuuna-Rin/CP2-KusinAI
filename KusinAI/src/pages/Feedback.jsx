import React from "react";
import PageTransition from "../components/PageTransition";
import MainLayout from "../components/MainLayout";

function Feedback() {
  return (
    <PageTransition>
      <MainLayout>
        <main className="flex-grow flex items-center justify-center text-white text-center px-6 py-8">
          <form className="bg-black/60 p-6 rounded-lg max-w-xl w-full text-left space-y-4 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Feedback Form</h2>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
            />
            <textarea
              rows="4"
              placeholder="Write your feedback..."
              className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
              Submit
            </button>
          </form>
        </main>
      </MainLayout>
    </PageTransition>
  );
}

export default Feedback;
