import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
import MainLayout from "../components/MainLayout";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBan = async (id) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  await axios.put(`${API_URL}/api/admin/users/${id}/toggle-ban`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("❌ Failed to toggle ban:", err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  await axios.delete(`${API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("❌ Failed to delete user:", err);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6 mt-6">
        <h1 className="text-3xl font-bold mb-6">👥 Manage Users</h1>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border">{u.isBanned ? "🚫 Banned" : "✅ Active"}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => toggleBan(u._id)}
                    className={`px-3 py-1 ${u.isBanned ? "bg-green-500" : "bg-yellow-500"} text-white rounded`}
                  >
                    {u.isBanned ? "Unban" : "Ban"}
                  </button>
                  <button
                    onClick={() => deleteUser(u._id)}
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

export default ManageUsers;
