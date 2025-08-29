import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaRegStar, FaStar, FaComments } from "react-icons/fa";
import axios from "axios";
import PageTransition from "../components/PageTransition";
import MainLayout from "../components/MainLayout";

const SearchResults = () => {
  const [searchInput, setSearchInput] = useState("");
  const [allRecipes, setAllRecipes] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logs for troubleshooting
  useEffect(() => {
    console.log("[DEBUG] allRecipes:", allRecipes);
  }, [allRecipes]);
  useEffect(() => {
    console.log("[DEBUG] inputIngredients:", inputIngredients);
  }, [location.search]);

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query")?.toLowerCase() || "";
  const inputIngredients = searchQuery.split(",").map((str) => str.trim());

  useEffect(() => {
    const fetchRecipesAndFavorites = async () => {
      try {
        const recipeRes = await axios.get("/api/recipes");
    const recipes = Array.isArray(recipeRes.data) ? recipeRes.data : recipeRes.data.recipes || [];
    setAllRecipes(recipes);
        setAllRecipes(recipes);

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
          const favoritesRes = await axios.get("/api/auth/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const validFavorites = (favoritesRes.data.favorites || []).filter(r => r && r._id);
          setFavoriteIds(validFavorites.map((r) => r._id));
        }
      } catch (err) {
        console.error("❌ Failed to fetch data:", err);
      }
    };

    fetchRecipesAndFavorites();
  }, []);

  const toggleFavorite = async (recipeId) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      let updatedFavorites;
      if (favoriteIds.includes(recipeId)) {
        updatedFavorites = favoriteIds.filter((id) => id !== recipeId);
      } else {
        updatedFavorites = [...favoriteIds, recipeId];
      }

      setFavoriteIds(updatedFavorites);
      await axios.put(
    `${BASE_URL}/auth/favorites`,
        { favorites: updatedFavorites },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("❌ Failed to update favorites:", err);
    }
  };

  const filteredRecipes = Array.isArray(allRecipes)
    ? allRecipes.filter((recipe) =>
        Array.isArray(recipe.ingredients) &&
        inputIngredients.every((input) =>
          recipe.ingredients.some((ingredientInRecipe) =>
            (ingredientInRecipe || "").toLowerCase().includes(input)
          )
        )
      )
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput("");
    }
  };

  return (
    <PageTransition>
      <MainLayout>
        <main className="flex-grow overflow-y-auto p-6">
          <div className="bg-white bg-opacity-80 p-6 rounded-xl max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold text-black mb-4">
              Showing results for: <span className="italic">{searchQuery}</span>
            </h2>

            {filteredRecipes.length === 0 ? (
              <p className="text-gray-800">No matching recipes found.</p>
            ) : (
              filteredRecipes.map((recipe, index) => (
                <div
                  key={index}
                  className="border-b border-gray-400 py-4 flex justify-between items-center"
                >
                  <div>
                    <Link
                      to={`/recipes/title/${encodeURIComponent(recipe.title)}?query=${searchQuery}`}
                      state={{ fromQuery: searchQuery }}
                    >
                      <h3 className="text-lg font-bold text-black hover:underline">
                        {recipe.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-700">{recipe.region}</p>
                  </div>
                  {favoriteIds.includes(recipe._id) ? (
                    <FaStar
                      className="text-xl text-yellow-500 cursor-pointer"
                      onClick={() => toggleFavorite(recipe._id)}
                    />
                  ) : (
                    <FaRegStar
                      className="text-xl text-gray-900 cursor-pointer"
                      onClick={() => toggleFavorite(recipe._id)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </MainLayout>
    </PageTransition>
  );
};

export default SearchResults;
