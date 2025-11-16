/*
  File: src/App.jsx
  Purpose: Client app root for routing and global layout handling.
  Responsibilities:
  - Define React Router routes and wrap pages with shared layout.
  - Provide top-level providers (contexts) when needed.
  Notes: Keep this focused on routing structure; page logic lives in pages/components.
*/
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Landing from './pages/Landing';
import About from './pages/About';
import Feedback from './pages/Feedback';
import Contact from './pages/Contact';
import Register from "./pages/Register";
import Login from "./pages/Login";
import SearchResults from './pages/SearchResults';
import RecipeDetail from './pages/RecipeDetail';
import Profile from './pages/Profile';
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageRecipes from "./pages/ManageRecipes";
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyEmail from './pages/VerifyEmail';
import OpenAppRedirect from './pages/OpenAppRedirect';

function App() {
  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/openapp" element={<OpenAppRedirect />} />
        {/* Forgot password temporarily removed */}


        {/* User Protected Routes */}
        <Route path="/feedback" element={<PrivateRoute><Feedback /></PrivateRoute>} />
        <Route path="/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchResults /></PrivateRoute>} />
        <Route path="/recipes/:id" element={<PrivateRoute><RecipeDetail /></PrivateRoute>} />
        <Route path="/recipes/title/:title" element={<PrivateRoute><RecipeDetail /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Admin-only */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/recipes" element={<ProtectedRoute role="admin"><ManageRecipes /></ProtectedRoute>} />
        <Route path="/admin/recipes/new" element={<ProtectedRoute role="admin"><AddRecipe /></ProtectedRoute>} />
        <Route path="/admin/recipes/edit/:id" element={<ProtectedRoute role="admin"><EditRecipe /></ProtectedRoute>} />
      </Routes>
  );
}

export default App;
