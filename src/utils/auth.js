// Check if token exists in either localStorage or sessionStorage
export function isLoggedIn() {
  return !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
}

// Logout function clears both storages and redirects to login
export const logout = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.href = "/login";
};
