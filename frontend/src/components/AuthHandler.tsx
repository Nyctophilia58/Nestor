import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

const AuthHandler = () => {
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const id = params.get("id");

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
  }, [setAuth]);

  return null;
};

export default AuthHandler;
