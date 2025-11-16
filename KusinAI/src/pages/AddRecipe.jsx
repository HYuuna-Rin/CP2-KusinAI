/*
  File: src/pages/AddRecipe.jsx
  Purpose: Form page for creating new recipes.
*/
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import Input from "../components/ui/input";
import Textarea from "../components/ui/textarea";
import Button from "../components/ui/button";

const AddRecipe = () => {
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [substitutions, setSubstitutions] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/recipes`,
        {
          title,
          region,
          ingredients: ingredients.split(",").map(i => i.trim()).filter(Boolean),
          steps: instructions.split("\n").map(s => s.trim()).filter(Boolean),
          substitutions: substitutions.split(",").map(s => s.trim()).filter(Boolean)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/admin/recipes");
    } catch (err) {
      console.error("❌ Failed to add recipe:", err);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto bg-surface rounded-lg shadow p-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <img src="/assets/KusinAILogo.png" alt="logo" className="h-10 w-10 rounded-full object-contain" />
          <h1 className="text-2xl font-bold text-primary">Add New Recipe</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Recipe Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
          />
          <Textarea
            placeholder="Ingredients (comma separated)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />
          <Textarea
            placeholder="Instructions (one per line)"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
          />
          <Textarea
            placeholder="Ingredient Substitutions (comma separated)"
            value={substitutions}
            onChange={(e) => setSubstitutions(e.target.value)}
          />
          <Button type="submit" className="w-full">Save Recipe</Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default AddRecipe;
