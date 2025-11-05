import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const API_URL = import.meta.env.VITE_API_URL;
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

const ManageRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();
  const { showToast, showConfirm } = useToast();

  const fetchRecipes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/recipes`);
      setRecipes(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch recipes:", err);
      showToast({ message: 'Failed to fetch recipes', type: 'error' });
    }
  };

  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteRecipe = async (id) => {
    const ok = await showConfirm({ title: 'Delete recipe', message: 'Are you sure you want to delete this recipe?', confirmText: 'Delete', cancelText: 'Cancel' });
    if (!ok) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast({ message: 'Recipe deleted', type: 'success' });
      fetchRecipes();
    } catch (err) {
      console.error("❌ Failed to delete recipe:", err);
      showToast({ message: 'Failed to delete recipe', type: 'error' });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto bg-surface/90 rounded-lg shadow p-6 mt-6 text-text transition-all">
        <h1 className="text-3xl font-bold mb-6">📖 Manage Recipes</h1>
        <button
          onClick={() => navigate("/admin/recipes/new")}
          className="mb-4 px-4 py-2 bg-primary text-white rounded hover:bg-leaf transition-transform hover:scale-105"
        >
          ➕ Add New Recipe
        </button>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="bg-surface/60">
                <th className="p-3 border text-left">Title</th>
                <th className="p-3 border text-left">Region</th>
                <th className="p-3 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr key={r._id} className="hover:shadow-md transition-shadow">
                  <td className="p-3 border">{r.title}</td>
                  <td className="p-3 border">{r.region}</td>
                  <td className="p-3 border flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/recipes/edit/${r._id}`)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded transition-transform hover:scale-105"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRecipe(r._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded transition-transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManageRecipes;
