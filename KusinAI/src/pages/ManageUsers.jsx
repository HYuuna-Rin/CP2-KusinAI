/*
  File: src/pages/ManageUsers.jsx
  Purpose: Admin page to view and manage user accounts/roles.
*/
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const API_URL = import.meta.env.VITE_API_URL;
import MainLayout from "../components/MainLayout";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const { showToast, showConfirm } = useToast();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
      showToast({ message: 'Failed to fetch users', type: 'error' });
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleBan = async (id) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(`${API_URL}/api/admin/users/${id}/toggle-ban`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast({ message: 'User status updated', type: 'success' });
      fetchUsers();
    } catch (err) {
      console.error("❌ Failed to toggle ban:", err);
      showToast({ message: 'Failed to toggle ban', type: 'error' });
    }
  };

  const deleteUser = async (id) => {
    const ok = await showConfirm({ title: 'Delete user', message: 'Are you sure you want to delete this user?', confirmText: 'Delete', cancelText: 'Cancel' });
    if (!ok) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast({ message: 'User deleted', type: 'success' });
      fetchUsers();
    } catch (err) {
      console.error("❌ Failed to delete user:", err);
      showToast({ message: 'Failed to delete user', type: 'error' });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto bg-surface/90 rounded-lg shadow p-6 mt-6 text-text transition-all">
        <h1 className="text-3xl font-bold mb-6">👥 Manage Users</h1>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="bg-surface/60">
                <th className="p-3 border text-left">Name</th>
                <th className="p-3 border text-left">Email</th>
                <th className="p-3 border text-left">Role</th>
                <th className="p-3 border text-left">Status</th>
                <th className="p-3 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="hover:shadow-md transition-shadow">
                  <td className="p-3 border">{u.name}</td>
                  <td className="p-3 border">{u.email}</td>
                  <td className="p-3 border">{u.role}</td>
                  <td className="p-3 border">{u.isBanned ? "🚫 Banned" : "✅ Active"}</td>
                  <td className="p-3 border flex gap-2">
                    <button
                      onClick={() => toggleBan(u._id)}
                      className={`px-3 py-1 ${u.isBanned ? "bg-green-500" : "bg-yellow-500"} text-white rounded transition-transform hover:scale-105`}
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
                    <button
                      onClick={() => deleteUser(u._id)}
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

export default ManageUsers;
