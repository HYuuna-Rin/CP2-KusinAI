import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit, FiTrash2 } from "react-icons/fi";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import PageTransition from "../components/PageTransition";
import MainLayout from "../components/MainLayout";
import FloatingChatBot from "../components/FloatingChatBot";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
import { jwtDecode } from "jwt-decode";

const RecipeDetail = () => {
  const { title } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fromQuery = location.state?.fromQuery || "";

  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
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

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/recipes/title/${title}`);
        setRecipe(res.data);
        fetchComments(res.data._id);
      } catch (err) {
        setError("Recipe not found.");
      }
    };

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
  }, [title]);

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
    } catch (err) {
      console.error("❌ Error posting comment:", err);
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
    } catch (err) {
      console.error("❌ Error sending reply:", err);
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
    } catch (err) {
      console.error("❌ Error liking comment:", err);
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
    } catch (err) {
      console.error("❌ Error liking reply:", err);
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
    } catch (err) {
      console.error("❌ Error editing comment:", err);
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
    } catch (err) {
      console.error("❌ Error editing reply:", err);
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
    });
    setEditRecipeModal(true);
  };

  const saveRecipeChanges = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const updatedRecipe = {
        ...editForm,
        ingredients: editForm.ingredients.split("\n").map((i) => i.trim()).filter(Boolean),
        steps: editForm.steps.split("\n").map((s) => s.trim()).filter(Boolean),
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
    } catch (err) {
      console.error("❌ Error deleting recipe:", err);
    }
  };

  const formatTime = (timestamp) => new Date(timestamp).toLocaleString();

  if (error) return <div>{error}</div>;
  if (!recipe) return <div>Loading...</div>;

  return (
    <PageTransition>
      <MainLayout>
        <div className="max-w-4xl mx-auto bg-surface/90 shadow-md rounded-lg p-6 space-y-6 relative mt-6 text-text">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg">
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
        )}

        {/* RECIPE DELETE CONFIRM MODAL */}
        {deleteRecipeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center w-80">
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
        )}

        {/* COMMENT DELETE CONFIRM MODAL (same as before) */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center w-80">
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
        )}

        {/* Chatbot */}
        <FloatingChatBot recipe={recipe} />
      </MainLayout>
    </PageTransition>
  );
};

export default RecipeDetail;
