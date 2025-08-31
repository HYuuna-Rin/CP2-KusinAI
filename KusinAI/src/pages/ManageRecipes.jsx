import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

const ManageRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();

  const fetchRecipes = async () => {
    try {
  const res = await axios.get(`${API_URL}/api/recipes`);
      setRecipes(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch recipes:", err);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const deleteRecipe = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  await axios.delete(`${API_URL}/api/admin/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRecipes();
    } catch (err) {
      console.error("❌ Failed to delete recipe:", err);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6 mt-6">
        <h1 className="text-3xl font-bold mb-6">📖 Manage Recipes</h1>
        <button
          onClick={() => navigate("/admin/recipes/new")}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ➕ Add New Recipe
        </button>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Region</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((r) => (
              <tr key={r._id}>
                <td className="p-2 border">{r.title}</td>
                <td className="p-2 border">{r.region}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/recipes/edit/${r._id}`)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRecipe(r._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
};

export default ManageRecipes;
