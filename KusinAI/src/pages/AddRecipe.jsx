/*
  File: src/pages/AddRecipe.jsx
  Purpose: Form page for creating new recipes.
*/
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

const AddRecipe = () => {
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        "/api/admin/recipes",
        { title, region, ingredients: ingredients.split(","), instructions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/admin/recipes");
    } catch (err) {
      console.error("❌ Failed to add recipe:", err);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 mt-6">
        <h1 className="text-2xl font-bold mb-4">➕ Add New Recipe</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Recipe Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <textarea
            placeholder="Ingredients (comma separated)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <textarea
            placeholder="Instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Recipe
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default AddRecipe;
