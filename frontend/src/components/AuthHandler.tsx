import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const AuthHandler = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const id = params.get("id");
    const error = params.get("error");

    // Handle errors from OAuth flow
    if (error) {
      if (error === "email_exists") {
        navigate(`/login?error=email_exists`);
      } else if (error === "google_auth_failed") {
        navigate(`/register?error=google_auth_failed`);
      } else {
        navigate(`/register?error=${encodeURIComponent(error)}`);
      }
      return;
    }

    // Handle successful OAuth
    if (token && name && email && id) {
      const role = params.get("role");
      const user = {
        id: Number(id),
        name: decodeURIComponent(name),
        email: decodeURIComponent(email),
        role: (role || "tenant") as "tenant" | "landlord" | "admin",
      };
      setAuth(user, token);
      // Remove query params from URL without refreshing
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [setAuth, navigate]);

  return null;
};

export default AuthHandler;
