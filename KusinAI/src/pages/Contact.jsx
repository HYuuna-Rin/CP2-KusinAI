import React from "react";
import PageTransition from "../components/PageTransition";
import MainLayout from "../components/MainLayout";

function Contact() {
  return (
    <PageTransition>
      <MainLayout>
        <main className="flex-grow flex items-center justify-center text-white text-center px-6 py-8">
          <div className="bg-black/60 p-6 rounded-lg max-w-xl w-full shadow-lg text-left space-y-4">
            <h2 className="text-2xl font-bold text-white text-center">Contact Us</h2>
            <p><span className="font-semibold">Email:</span> support@kusinai.ph</p>
            <p><span className="font-semibold">Phone:</span> +63 912 345 6789</p>
            <p><span className="font-semibold">Address:</span> 3rd Floor, IT Building, Pamantasan ng Lungsod ng Maynila</p>
            <p>We're open to feedback, partnerships, or feature requests. Feel free to contact us for any concerns.</p>
          </div>
        </main>
      </MainLayout>
    </PageTransition>
  );
}

export default Contact;
