/*
  File: src/pages/EditRecipe.jsx
  Purpose: Page for editing an existing recipe.
*/
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";

const EditRecipe = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
  const res = await axios.get(`${API_URL}/api/recipes/${id}`);
        setTitle(res.data.title);
        setRegion(res.data.region);
        setIngredients(res.data.ingredients.join(", "));
        setInstructions(res.data.instructions);
      } catch (err) {
        console.error("❌ Failed to load recipe:", err);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/admin/recipes/${id}`,
        { title, region, ingredients: ingredients.split(","), instructions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/admin/recipes");
    } catch (err) {
      console.error("❌ Failed to update recipe:", err);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 mt-6">
        <h1 className="text-2xl font-bold mb-4">✏️ Edit Recipe</h1>
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
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Update Recipe
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default EditRecipe;
