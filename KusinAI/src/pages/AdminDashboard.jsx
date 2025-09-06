import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
import MainLayout from "../components/MainLayout";
import PageTransition from "../components/PageTransition";
import { FiTrash2, FiEdit, FiPlus } from "react-icons/fi";

const AdminDashboard = () => {

  const [recipes, setRecipes] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalRecipes: 0, totalComments: 0, totalReplies: 0 });

  const [newRecipe, setNewRecipe] = useState({
    title: "",
    region: "",
    image: "",
    ingredients: "",
    steps: "",
  });

  const navigate = useNavigate();

  // Fetch all recipes
  const fetchRecipes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/recipes`);
      setRecipes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error fetching recipes:", err);
      setRecipes([]);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats({
        totalUsers: res.data?.totalUsers || 0,
        totalRecipes: res.data?.totalRecipes || 0,
        totalComments: res.data?.totalComments || 0,
        totalReplies: res.data?.totalReplies || 0,
      });
    } catch (err) {
      console.error("❌ Error fetching stats:", err);
      setStats({ totalUsers: 0, totalRecipes: 0, totalComments: 0, totalReplies: 0 });
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchStats();
  }, []);

  // Handle Add Recipe
  const handleAddRecipe = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const formattedRecipe = {
        ...newRecipe,
        ingredients: newRecipe.ingredients.split("\n").map((i) => i.trim()).filter(Boolean),
        steps: newRecipe.steps.split("\n").map((s) => s.trim()).filter(Boolean),
      };

      await axios.post("/api/recipes", formattedRecipe, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAddModal(false);
      setNewRecipe({ title: "", region: "", image: "", ingredients: "", steps: "" });
      fetchRecipes();
    } catch (err) {
      console.error("❌ Error adding recipe:", err);
    }
  };

  // Handle Delete Recipe
  const confirmDeleteRecipe = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`/api/recipes/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteModal(false);
      setDeleteId(null);
      fetchRecipes();
    } catch (err) {
      console.error("❌ Error deleting recipe:", err);
    }
  };

  return (
    <PageTransition>
      <MainLayout>
        <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button
              onClick={() => setAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              <FiPlus /> Add Recipe
            </button>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-100 rounded p-4 text-center">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-gray-600">Users</div>
            </div>
            <div className="bg-gray-100 rounded p-4 text-center">
              <div className="text-2xl font-bold">{stats.totalRecipes}</div>
              <div className="text-gray-600">Recipes</div>
            </div>
            <div className="bg-gray-100 rounded p-4 text-center">
              <div className="text-2xl font-bold">{stats.totalComments}</div>
              <div className="text-gray-600">Comments</div>
            </div>
            <div className="bg-gray-100 rounded p-4 text-center">
              <div className="text-2xl font-bold">{stats.totalReplies}</div>
              <div className="text-gray-600">Replies</div>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Manage Users
            </button>
          </div>

          {/* Recipes Table */}
          <table className="w-full border-collapse border border-gray-300 text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-gray-300">Title</th>
                <th className="p-2 border border-gray-300">Region</th>
                <th className="p-2 border border-gray-300 w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(recipes) && recipes.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="p-2 border border-gray-300">
                    <span
                      className="text-blue-700 hover:underline cursor-pointer"
                      onClick={() => navigate(`/recipes/title/${encodeURIComponent(r.title)}`)}
                    >
                      {r.title}
                    </span>
                  </td>
                  <td className="p-2 border border-gray-300">{r.region}</td>
                  <td className="p-2 border border-gray-300 flex gap-2">
                    <button
                      onClick={() => navigate(`/recipes/title/${encodeURIComponent(r.title)}`)}
                      className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1"
                    >
                      <FiEdit /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(r._id);
                        setDeleteModal(true);
                      }}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded flex items-center gap-1"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {Array.isArray(recipes) && recipes.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center p-4 text-gray-500">
                    No recipes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ADD RECIPE MODAL */}
        {addModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
              <h2 className="text-lg font-bold mb-4">Add New Recipe</h2>
              <input
                type="text"
                placeholder="Title"
                value={newRecipe.title}
                onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="text"
                placeholder="Region"
                value={newRecipe.region}
                onChange={(e) => setNewRecipe({ ...newRecipe, region: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={newRecipe.image}
                onChange={(e) => setNewRecipe({ ...newRecipe, image: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
              <textarea
                placeholder="Ingredients (one per line)"
                value={newRecipe.ingredients}
                onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                className="w-full p-2 border rounded mb-2"
                rows="5"
              />
              <textarea
                placeholder="Steps (one per line)"
                value={newRecipe.steps}
                onChange={(e) => setNewRecipe({ ...newRecipe, steps: e.target.value })}
                className="w-full p-2 border rounded mb-2"
                rows="5"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleAddRecipe}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setAddModal(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center w-80">
              <h2 className="text-lg font-bold mb-4">Delete Recipe</h2>
              <p>Are you sure you want to delete this recipe?</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={confirmDeleteRecipe}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteModal(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    </PageTransition>
  );
};

export default AdminDashboard;
