import React, { useState, useEffect } from "react";
import { FiCamera } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import MainLayout from "../components/MainLayout";

const Profile = () => {
  const [searchInput, setSearchInput] = useState("");
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [notes, setNotes] = useState("");
  const [comments, setComments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Support both localStorage and sessionStorage for token
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUsername(decoded.name || "Unknown User");
      setEmail(decoded.email || "N/A");
      setUserId(decoded.id);

      const savedImage = localStorage.getItem(`image_${decoded.name}`);
      if (savedImage) setProfileImage(savedImage);

      fetch("/api/auth/notes", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.notes) setNotes(data.notes);
        })
        .catch((err) => console.error("❌ Failed to fetch notes:", err));

      fetch("/api/recipes")
        .then((res) => res.json())
        .then((recipes) => {
          const userComments = [];
          recipes.forEach((recipe) => {
            recipe.comments?.forEach((c) => {
              if (c.userId === decoded.id) {
                userComments.push({
                  recipeTitle: recipe.title,
                  comment: c.comment,
                });
              }
            });
          });
          setComments(userComments);
        })
        .catch((err) => console.error("❌ Failed to fetch comments:", err));

      axios
        .get("/api/auth/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const validRecipes = (res.data.favorites || []).filter((r) => r && r._id && r.title);
          setFavorites(validRecipes);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch favorites:", err);
        });
    } catch (err) {
      console.error("❌ Failed to decode JWT:", err);
    }
  }, []);

  const handleSaveNotes = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    fetch("/api/auth/notes", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Notes saved:", data);
        setShowSaveButton(false);
      })
      .catch((err) => {
        console.error("❌ Failed to save notes:", err);
      });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem(`image_${username}`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFavorite = async (recipeIdToRemove) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const updatedFavorites = favorites.filter((r) => r._id !== recipeIdToRemove);
      await axios.put(
        "/api/auth/favorites",
        { favorites: updatedFavorites.map((r) => r._id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites(updatedFavorites);
    } catch (err) {
      console.error("❌ Failed to remove favorite:", err);
    }
  };

  return (
    <PageTransition>
      <MainLayout>
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-black bg-opacity-60 rounded-xl text-white p-6 w-full max-w-3xl mx-auto mt-8">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden mr-4 relative">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-black">No Photo</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  title="Change profile picture"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{username}</h2>
                <p className="text-sm text-gray-300">{email}</p>
              </div>
            </div>

            <div className="mb-6">
              <textarea
                className="w-full p-3 text-black rounded-md focus:outline-none"
                placeholder="Add personal notes..."
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onClick={() => setShowSaveButton(true)}
              />
            </div>

            {showSaveButton && (
              <button
                onClick={handleSaveNotes}
                className="mt-2 px-4 py-2 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-600 transition duration-200"
              >
                Save
              </button>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Favorites</h3>
                <ul className="list-disc list-inside space-y-2">
                  {favorites.length === 0 ? (
                    <li className="italic text-gray-300">No favorites yet</li>
                  ) : (
                    favorites.map((recipe) =>
                      recipe && recipe._id && recipe.title ? (
                        <li key={recipe._id} className="flex justify-between items-center">
                          <Link to={`/recipes/title/${encodeURIComponent(recipe.title)}`} className="text-yellow-200 hover:underline">
                            {recipe.title}
                          </Link>
                          <button
                            onClick={() => handleRemoveFavorite(recipe._id)}
                            className="ml-2 text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                          >
                            Remove
                          </button>
                        </li>
                      ) : null
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">My Comments</h3>
                <ul className="list-disc list-inside">
                  {comments.length === 0 ? (
                    <li className="italic text-gray-300">No comments yet</li>
                  ) : (
                    comments.map((c, i) => (
                      <li key={i}><strong>{c.recipeTitle}:</strong> {c.comment}</li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </MainLayout>
    </PageTransition>
  );
};

export default Profile;
