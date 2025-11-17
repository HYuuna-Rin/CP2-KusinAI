/*
  File: src/pages/RecipeDetail.jsx
  Purpose: Display full details of a single recipe.
*/
import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit, FiTrash2 } from "react-icons/fi";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import PageTransition from "../components/PageTransition";
import ModalPortal from "../components/ModalPortal";
import MainLayout from "../components/MainLayout";
import FloatingChatBot from "../components/FloatingChatBot";
import axios from "axios";
import LoadingOverlay from "../components/ui/loading";
import { useToast } from "../context/ToastContext";

const API_URL = import.meta.env.VITE_API_URL;
import { jwtDecode } from "jwt-decode";

const RecipeDetail = () => {
  const { title, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fromQuery = location.state?.fromQuery || "";

  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [user, setUser] = useState(null);

  // comment/reply states
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReply, setEditingReply] = useState({});
  const [originalCommentTexts, setOriginalCommentTexts] = useState({});
  const [originalReplyTexts, setOriginalReplyTexts] = useState({});

  // delete modal (comment/reply)
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: "", commentId: null, replyId: null });

  // admin recipe edit modal
  const [editRecipeModal, setEditRecipeModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", region: "", image: "", ingredients: "", steps: "" });

  // admin recipe delete modal
  const [deleteRecipeModal, setDeleteRecipeModal] = useState(false);

  // prevent duplicate nutrition recalculation requests
  const [nutritionRequested, setNutritionRequested] = useState(false);
  // local editable servings state (mirrors recipe.nutrition.servings)
  const [localServings, setLocalServings] = useState(null);
  // pull-to-refresh state
  const pullStart = useRef(null);
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Ask the server to (re)calculate nutrition for this recipe and update local state.
  // This calls the backend POST /api/recipes/:id/nutrition which persists the values
  // and should return either the updated recipe or at least a nutrition object.
  const fetchNutrition = async (recipeId, options = {}) => {
    if (!recipeId) return;
    if (nutritionRequested) return; // already requested
    try {
      setNutritionRequested(true);
      const body = {};
      if (options.servings) body.servings = Number(options.servings);
      const res = await axios.post(`${API_URL}/api/recipes/${recipeId}/nutrition`, body);
      // Server might return the full updated recipe or only the nutrition blob.
      const data = res.data || {};
      if (data._id && data._id === recipeId) {
        setRecipe(data);
        setLocalServings(data.nutrition?.servings ?? data.servings ?? null);
      } else if (data.nutrition) {
        setRecipe((prev) => ({ ...prev, nutrition: data.nutrition }));
        setLocalServings(data.nutrition?.servings ?? null);
      } else {
        // fallback: attempt to merge any fields we can
        setRecipe((prev) => ({ ...prev, nutrition: data }));
        setLocalServings(data.servings ?? data.nutrition?.servings ?? null);
      }
      console.info("ℹ️ nutrition recalculation completed for recipe", recipeId);
    } catch (err) {
      console.error("❌ Error recalculating nutrition:", err?.response?.data || err.message || err);
    } finally {
      // leave a short cooldown before allowing another request
      setTimeout(() => setNutritionRequested(false), 5000);
    }
  };


  // Update recipe fetch into its own function to allow refresh/pull-to-refresh
  const fetchRecipe = async () => {
    try {
      const res = id
        ? await axios.get(`${API_URL}/api/recipes/id/${id}`)
        : await axios.get(`${API_URL}/api/recipes/title/${title}`);
      setRecipe(res.data);
      setLocalServings(res.data?.nutrition?.servings ?? null);
      fetchComments(res.data._id);
      // If the recipe has no per-serving nutrition (or all zeros), trigger server-side calculation
      const nutr = res.data.nutrition;
      const needsCalc = !nutr || !nutr.perServing || (
        Number(nutr.perServing.calories) === 0 &&
        Number(nutr.perServing.protein) === 0 &&
        Number(nutr.perServing.fat) === 0 &&
        Number(nutr.perServing.carbs) === 0
      );
      if (needsCalc) {
        window.requestIdleCallback ? window.requestIdleCallback(() => fetchNutrition(res.data._id)) : setTimeout(() => fetchNutrition(res.data._id), 50);
      }
      // substitutions now static/manual; no auto-fetch
    } catch (err) {
      setError("Recipe not found.");
      showToast({ message: "Recipe not found", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // init fetch
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, name: decoded.name, role: decoded.role });
      } catch (err) {
        console.error("Invalid token:", err);
        setUser(null);
      }
    }

    fetchRecipe();

    // pull-to-refresh touch handling
    let startY = 0;
    const onTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        pullStart.current = startY;
      } else {
        pullStart.current = null;
      }
    };
    const onTouchMove = (e) => {
      if (pullStart.current == null) return;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const delta = Math.max(0, y - pullStart.current);
      setPullDistance(delta);
      setPulling(delta > 10);
    };
    const onTouchEnd = async () => {
      if (pullStart.current == null) return;
      if (pullDistance > 80) {
        // trigger refresh
        setPulling(false);
        setPullDistance(0);
        await fetchRecipe();
        if (recipe && recipe._id) await fetchNutrition(recipe._id);
      } else {
        setPulling(false);
        setPullDistance(0);
      }
      pullStart.current = null;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [title, id]);



  // helper to normalize possible userId shapes (object or string)
  const idOf = (val) => {
    if (!val) return null;
    if (typeof val === "object") return String(val._id || val.id || "");
    return String(val);
  };

  const fetchComments = async (recipeId) => {
    try {
      const res = await axios.get(`${API_URL}/api/recipes/${recipeId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  // allow user to update servings and re-run nutrition calculation
  const updateServingsAndRecalc = async (newServings) => {
    if (!recipe || !recipe._id) return;
    setLocalServings(newServings);
    await fetchNutrition(recipe._id, { servings: newServings });
  };

  // === COMMENT & REPLY LOGIC ===
  const handlePostComment = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/recipes/${recipe._id}/comments`,
        { comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText("");
      setComments(res.data);
      showToast({ message: "Comment posted", type: "success" });
    } catch (err) {
      console.error("❌ Error posting comment:", err);
      showToast({ message: "Failed to post comment", type: "error" });
    }
  };

  const handleReply = async (commentId) => {
    try {
      if (!replyText[commentId]?.trim()) return;
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/recipes/${recipe._id}/comments/${commentId}/replies`,
        { comment: replyText[commentId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments(recipe._id);
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      showToast({ message: "Reply sent", type: "success" });
    } catch (err) {
      console.error("❌ Error sending reply:", err);
      showToast({ message: "Failed to send reply", type: "error" });
    }
  };

  const handleLike = async (commentId) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/recipes/${recipe._id}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments(recipe._id);
      // optional toast suppressed to avoid spam
    } catch (err) {
      console.error("❌ Error liking comment:", err);
      showToast({ message: "Failed to like", type: "error" });
    }
  };

  const handleLikeReply = async (commentId, replyId) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/recipes/${recipe._id}/comments/${commentId}/replies/${replyId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments(recipe._id);
      // suppressed toast
    } catch (err) {
      console.error("❌ Error liking reply:", err);
      showToast({ message: "Failed to like reply", type: "error" });
    }
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/recipes/${recipe._id}/comments/${commentId}`,
        { comment: newText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCommentId(null);
      setEditingReply({});
      fetchComments(recipe._id);
      showToast({ message: "Comment updated", type: "success" });
    } catch (err) {
      console.error("❌ Error editing comment:", err);
      showToast({ message: "Failed to update comment", type: "error" });
    }
  };

  const handleCancelEditComment = (commentId) => {
    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId ? { ...c, comment: originalCommentTexts[commentId] || c.comment } : c
      )
    );
    setEditingCommentId(null);
  };

  const handleDeleteComment = (commentId) => {
    setDeleteTarget({ type: "comment", commentId });
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const { type, commentId, replyId } = deleteTarget;
      if (type === "comment") {
        await axios.delete(`${API_URL}/api/recipes/${recipe._id}/comments/${commentId}`,
          { headers: { Authorization: `Bearer ${token}` } });
      } else if (type === "reply") {
        await axios.delete(
          `${API_URL}/api/recipes/${recipe._id}/comments/${commentId}/replies/${replyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setModalOpen(false);
      setDeleteTarget({ type: "", commentId: null, replyId: null });
      setEditingCommentId(null);
      setEditingReply({});
      fetchComments(recipe._id);
    } catch (err) {
      console.error("❌ Error deleting:", err);
    }
  };

  const handleEditReply = async (commentId, replyId, newText) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/recipes/${recipe._id}/comments/${commentId}/replies/${replyId}`,
        { comment: newText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingReply((prev) => ({ ...prev, [replyId]: false }));
      setEditingCommentId(null);
      fetchComments(recipe._id);
      showToast({ message: "Reply updated", type: "success" });
    } catch (err) {
      console.error("❌ Error editing reply:", err);
      showToast({ message: "Failed to update reply", type: "error" });
    }
  };

  const handleCancelEditReply = (commentId, replyId) => {
    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? {
            ...c,
            replies: c.replies.map((r) =>
              r._id === replyId
                ? { ...r, comment: originalReplyTexts[replyId] || r.comment }
                : r
            ),
          }
          : c
      )
    );
    setEditingReply((prev) => ({ ...prev, [replyId]: false }));
  };

  const handleDeleteReply = (commentId, replyId) => {
    setDeleteTarget({ type: "reply", commentId, replyId });
    setModalOpen(true);
  };

  // === ADMIN RECIPE EDIT ===
  const openEditRecipe = () => {
    setEditForm({
      title: recipe.title,
      region: recipe.region,
      image: recipe.image,
      ingredients: recipe.ingredients.join("\n"),
      steps: recipe.steps.join("\n"),
      substitutions: (recipe.substitutions || []).join("\n"),
    });
    setEditRecipeModal(true);
  };

  const saveRecipeChanges = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const updatedRecipe = {
        title: editForm.title,
        region: editForm.region,
        image: editForm.image,
        ingredients: editForm.ingredients.split("\n").map((i) => i.trim()).filter(Boolean),
        steps: editForm.steps.split("\n").map((s) => s.trim()).filter(Boolean),
        substitutions: (editForm.substitutions || "").split("\n").map((s) => s.trim()).filter(Boolean),
      };

      await axios.put(`${API_URL}/api/recipes/${recipe._id}`, updatedRecipe, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRecipe(updatedRecipe);
      setEditRecipeModal(false);
    } catch (err) {
      console.error("❌ Error updating recipe:", err);
    }
  };

  // === ADMIN RECIPE DELETE ===
  const confirmDeleteRecipe = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/api/recipes/${recipe._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteRecipeModal(false);
      navigate("/search"); // redirect after delete
      showToast({ message: "Recipe deleted", type: "success" });
    } catch (err) {
      console.error("❌ Error deleting recipe:", err);
      showToast({ message: "Failed to delete recipe", type: "error" });
    }
  };

  const formatTime = (timestamp) => new Date(timestamp).toLocaleString();

  if (error) return (
    <PageTransition>
      <MainLayout>
        <div className="max-w-3xl mx-auto bg-surface/90 backdrop-blur-sm rounded-lg p-6 mt-6 text-text">{error}</div>
      </MainLayout>
    </PageTransition>
  );
  if (!recipe) return (
    <PageTransition>
      <MainLayout>
        <div className="max-w-3xl mx-auto bg-surface/90 backdrop-blur-sm rounded-lg p-6 mt-6 text-text">Loading...</div>
        {loading && <LoadingOverlay text="Loading recipe..." />}
      </MainLayout>
    </PageTransition>
  );

  return (
    <PageTransition>
      <MainLayout>
        <div className="max-w-4xl mx-auto bg-surface/90 backdrop-blur-sm shadow-md rounded-lg p-6 space-y-6 relative mt-6 text-text px-3 sm:px-6">
          <Link
            to={`/search?query=${encodeURIComponent(fromQuery)}`}
            className="absolute top-4 left-4 text-leaf hover:text-accent"
          >
            <FiArrowLeft size={20} />
          </Link>

          {recipe.image && (
            <img src={recipe.image} alt={recipe.title} className="w-full h-64 object-cover rounded-md" />
          )}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">{recipe.title}</h1>
            {user?.role === "admin" && (
              <div className="flex gap-2">
                <button
                  onClick={openEditRecipe}
                  className="px-3 py-1 bg-primary hover:bg-leaf text-white rounded flex items-center gap-2"
                >
                  <FiEdit /> Edit
                </button>
                <button
                  onClick={() => setDeleteRecipeModal(true)}
                  className="px-3 py-1 bg-accent hover:bg-tamarind text-white rounded flex items-center gap-2"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            )}
          </div>
          <p className="text-leaf italic">{recipe.region}</p>

          <div>
            <h2 className="text-xl font-semibold text-leaf">Ingredients</h2>
            <ul className="list-disc ml-6">{recipe.ingredients.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-leaf">Instructions</h2>
            <ol className="list-decimal ml-6">{recipe.steps.map((step, idx) => <li key={idx}>{step}</li>)}</ol>
          </div>

          {recipe.nutrition && (
            <div className="mt-6 text-text">
              <h2 className="text-xl font-semibold text-leaf">Nutrition Information</h2>
              <p>Calories: {recipe.nutrition.calories} kcal</p>
              <p>Protein: {recipe.nutrition.protein} g</p>
              <p>Fat: {recipe.nutrition.fat} g</p>
              <p>Carbs: {recipe.nutrition.carbs} g</p>
              {recipe.nutrition.perServing && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-leaf">Per Serving</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateServingsAndRecalc(Math.max(1, (localServings ?? recipe.nutrition.servings) - 1))}
                        className="px-2 py-1 bg-surface rounded disabled:opacity-50"
                        disabled={nutritionRequested}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={localServings ?? recipe.nutrition.servings}
                        onChange={(e) => setLocalServings(Number(e.target.value))}
                        onBlur={(e) => updateServingsAndRecalc(Math.max(1, Number(e.target.value) || 1))}
                        className="w-20 text-center p-1 border rounded bg-background text-text"
                        disabled={nutritionRequested}
                      />
                      <button
                        onClick={() => updateServingsAndRecalc((localServings ?? recipe.nutrition.servings) + 1)}
                        className="px-2 py-1 bg-surface rounded disabled:opacity-50"
                        disabled={nutritionRequested}
                      >
                        +
                      </button>
                    </div>
                    <div>
                      {recipe.nutrition.estimatedServings ? (
                        <span className="text-sm text-tamarind">(estimated)</span>
                      ) : null}
                    </div>
                    {nutritionRequested && (
                      <div className="ml-auto flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-muted">Calculating…</span>
                      </div>
                    )}
                  </div>

                  {!nutritionRequested && (
                    <div className="mt-3">
                      <p>Calories: {recipe.nutrition.perServing.calories} kcal</p>
                      <p>Protein: {recipe.nutrition.perServing.protein} g</p>
                      <p>Fat: {recipe.nutrition.perServing.fat} g</p>
                      <p>Carbs: {recipe.nutrition.perServing.carbs} g</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Substitutions Section */}
          {recipe.substitutions && recipe.substitutions.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-leaf">Substitutions</h2>
              <ul className="list-disc ml-6 pr-2">
                {recipe.substitutions.map((sub, idx) => (
                  <li key={idx} className="break-words">{sub}</li>
                ))}
              </ul>
            </div>
          )}


          {/* COMMENT SECTION */}
          <div className="pt-6 border-t border-leaf/40">
            <h2 className="text-xl font-semibold mb-2 text-leaf">💬 Comments</h2>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={1}
              placeholder="Write a comment..."
              className="w-full p-2 border border-leaf/40 rounded mb-2 resize-none overflow-hidden bg-background text-text focus:border-leaf"
              style={{ minHeight: '48px', maxHeight: '200px' }}
              onInput={e => {
                e.target.style.height = '48px';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
            />
            <button
              onClick={() => {
                if (commentText.trim()) handlePostComment();
              }}
              disabled={!commentText.trim()}
              className={`px-4 py-2 font-semibold rounded transition-colors ${commentText.trim() ? 'bg-primary hover:bg-leaf text-white' : 'bg-surface text-tamarind cursor-not-allowed'}`}
            >
              Post Comment
            </button>

            <div className="mt-6 space-y-4">
              {comments.map((com) => (
                <div key={com._id} className="border border-leaf/30 p-3 rounded bg-background/80">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={com.profileImage || "/default-profile.png"}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover border border-leaf cursor-pointer"
                      onClick={() => navigate(
                        user && idOf(com.userId) === user.id ? "/profile" : `/profile/${idOf(com.userId)}`
                      )}
                    />
                    <span
                      className="font-semibold ml-2 hover:underline cursor-pointer text-leaf"
                      onClick={() => navigate(
                        user && idOf(com.userId) === user.id ? "/profile" : `/profile/${idOf(com.userId)}`
                      )}
                    >
                      {com.username}
                    </span>
                    <span className="text-xs text-tamarind ml-auto">{formatTime(com.createdAt)}</span>
                  </div>

                  {editingCommentId === com._id ? (
                    <>
                      <textarea
                        value={com.comment}
                        onFocus={() =>
                          setOriginalCommentTexts((prev) => ({
                            ...prev,
                            [com._id]: com.comment,
                          }))
                        }
                        onChange={(e) => {
                          const updated = comments.map((c) =>
                            c._id === com._id ? { ...c, comment: e.target.value } : c
                          );
                          setComments(updated);
                        }}
                        className="w-full p-2 border border-leaf/40 rounded bg-background text-text"
                      />
                      <button
                        onClick={() => handleEditComment(com._id, com.comment)}
                        className="text-sm text-primary mt-1 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleCancelEditComment(com._id)}
                        className="text-sm text-tamarind mt-1"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <p className="mb-2">{com.comment}</p>
                  )}

                  <div className="flex flex-col gap-1 text-sm text-leaf mt-2">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(com._id)}
                        className={`flex items-center gap-1 ${(com.likes && user && com.likes.map(String).includes(user.id)) ? 'text-accent' : 'hover:text-accent'}`}
                        aria-label={(com.likes && user && com.likes.map(String).includes(user.id)) ? 'Unlike' : 'Like'}
                      >
                        {(com.likes && user && com.likes.map(String).includes(user.id)) ? <FaHeart /> : <FaRegHeart />}
                        {com.likes?.length || 0}
                      </button>
                      <button onClick={() => setReplyText((prev) => ({ ...prev, [com._id]: "" }))} className="hover:text-primary">Reply</button>
                      {user && (idOf(com.userId) === user.id || user.role === "admin") && (
                        <>
                          <button onClick={() => setEditingCommentId(com._id)} className="hover:text-primary"><FiEdit /></button>
                          <button onClick={() => handleDeleteComment(com._id)} className="hover:text-accent"><FiTrash2 /></button>
                        </>
                      )}
                    </div>
                  </div>

                  {replyText[com._id] !== undefined && (
                    <div className="mt-2 ml-4">
                      <textarea
                        value={replyText[com._id]}
                        onChange={(e) =>
                          setReplyText((prev) => ({
                            ...prev,
                            [com._id]: e.target.value,
                          }))
                        }
                        rows="2"
                        placeholder="Write a reply..."
                        className="w-full p-2 border border-leaf/40 rounded bg-background text-text"
                      />
                      <div className="mt-1 flex gap-2">
                        <button
                          onClick={() => handleReply(com._id)}
                          className="px-3 py-1 bg-primary hover:bg-leaf text-white rounded"
                        >
                          Send Reply
                        </button>
                        <button
                          onClick={() => {
                            setReplyText((prev) => {
                              const updated = { ...prev };
                              delete updated[com._id];
                              return updated;
                            });
                          }}
                          className="px-3 py-1 bg-surface hover:bg-tamarind text-tamarind rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* REPLIES SECTION */}
                  {com.replies?.length > 0 && (
                    <div className="mt-3 ml-6 space-y-2 text-sm text-leaf">
                      {com.replies.map((reply) => (
                        <div key={reply._id} className="border-l-2 border-leaf/40 pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            <img
                              src={reply.profileImage || "/default-profile.png"}
                              alt="Profile"
                              className="w-5 h-5 rounded-full object-cover border border-leaf cursor-pointer"
                              onClick={() => navigate(
                                user && idOf(reply.userId) === user.id ? "/profile" : `/profile/${idOf(reply.userId)}`
                              )}
                            />
                            <span
                              className="font-semibold hover:underline cursor-pointer text-leaf"
                              onClick={() => navigate(
                                user && idOf(reply.userId) === user.id ? "/profile" : `/profile/${idOf(reply.userId)}`
                              )}
                            >
                              {reply.username}
                            </span>
                            <span className="text-xs text-tamarind ml-auto">
                              {formatTime(reply.createdAt)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 mt-1">
                            {editingReply[reply._id] ? (
                              <>
                                <textarea
                                  value={reply.comment}
                                  onFocus={() =>
                                    setOriginalReplyTexts((prev) => ({
                                      ...prev,
                                      [reply._id]: reply.comment,
                                    }))
                                  }
                                  onChange={(e) => {
                                    const updated = comments.map((c) => {
                                      if (c._id === com._id) {
                                        return {
                                          ...c,
                                          replies: c.replies.map((r) =>
                                            r._id === reply._id
                                              ? { ...r, comment: e.target.value }
                                              : r
                                          ),
                                        };
                                      }
                                      return c;
                                    });
                                    setComments(updated);
                                  }}
                                  className="w-full p-1 border border-leaf/40 rounded bg-background text-text"
                                />
                                <button
                                  onClick={() =>
                                    handleEditReply(com._id, reply._id, reply.comment)
                                  }
                                  className="text-sm text-primary mt-1 mr-2"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() =>
                                    handleCancelEditReply(com._id, reply._id)
                                  }
                                  className="text-sm text-tamarind mt-1"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <p className="mb-1">{reply.comment}</p>
                                <div className="flex items-center gap-4 text-xs text-leaf">
                                  <button
                                    onClick={() => handleLikeReply(com._id, reply._id)}
                                    className={`flex items-center gap-1 ${(reply.likes && user && reply.likes.map(String).includes(user.id)) ? 'text-accent' : 'hover:text-accent'}`}
                                    aria-label={(reply.likes && user && reply.likes.map(String).includes(user.id)) ? 'Unlike' : 'Like'}
                                  >
                                    {(reply.likes && user && reply.likes.map(String).includes(user.id)) ? <FaHeart /> : <FaRegHeart />}
                                    {reply.likes?.length || 0}
                                  </button>
                                  <button onClick={() => setReplyText((prev) => ({ ...prev, [com._id]: `@${reply.username} ` }))} className="hover:text-primary">
                                    Reply
                                  </button>
                                  {user && (idOf(reply.userId) === user.id || user.role === "admin") && (
                                    <>
                                      <button onClick={() => setEditingReply((prev) => ({ ...prev, [reply._id]: true }))} className="text-primary ml-2">Edit</button>
                                      <button onClick={() => handleDeleteReply(com._id, reply._id)} className="text-accent ml-2">Delete</button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* RECIPE EDIT MODAL */}
        {editRecipeModal && (
          <ModalPortal>
            <div className="fixed inset-0 z-[2000] pointer-events-auto">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditRecipeModal(false)} />
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
              <h2 className="text-lg font-bold mb-4">Edit Recipe</h2>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full p-2 border rounded mb-2"
                placeholder="Title"
              />
              <input
                type="text"
                value={editForm.region}
                onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                className="w-full p-2 border rounded mb-2"
                placeholder="Region"
              />
              <input
                type="text"
                value={editForm.image}
                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                className="w-full p-2 border rounded mb-2"
                placeholder="Image URL"
              />
              <textarea
                value={editForm.ingredients}
                onChange={(e) => setEditForm({ ...editForm, ingredients: e.target.value })}
                className="w-full p-2 border rounded mb-2"
                rows="5"
                placeholder="Ingredients (one per line)"
              />
              <textarea
                value={editForm.steps}
                onChange={(e) => setEditForm({ ...editForm, steps: e.target.value })}
                className="w-full p-2 border rounded mb-2"
                rows="5"
                placeholder="Steps (one per line)"
              />
              <textarea
                value={editForm.substitutions}
                onChange={(e) => setEditForm({ ...editForm, substitutions: e.target.value })}
                className="w-full p-2 border rounded mb-2"
                rows="4"
                placeholder="Substitutions (one per line)"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={saveRecipeChanges}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditRecipeModal(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
              </div>
            </div>
          </ModalPortal>
        )}

        {/* RECIPE DELETE CONFIRM MODAL */}
        {deleteRecipeModal && (
          <ModalPortal>
            <div className="fixed inset-0 z-[2000] pointer-events-auto">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteRecipeModal(false)} />
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-md text-center w-80">
              <h2 className="text-lg font-bold mb-4">Delete Recipe</h2>
              <p>Are you sure you want to delete this recipe? This action cannot be undone.</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={confirmDeleteRecipe}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteRecipeModal(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
              </div>
            </div>
          </ModalPortal>
        )}

        {/* COMMENT DELETE CONFIRM MODAL (same as before) */}
        {modalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[2000] pointer-events-auto">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-md text-center w-80">
              <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
              <p>Are you sure you want to delete this {deleteTarget.type}?</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={confirmDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
              </div>
            </div>
          </ModalPortal>
        )}

        {/* Chatbot */}
        <FloatingChatBot recipe={recipe} />
        {loading && <LoadingOverlay text="Loading..." />}
      </MainLayout>
    </PageTransition>
  );
};

export default RecipeDetail;
