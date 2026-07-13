import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import PropertyDetail from "./pages/PropertyDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AddProperty from "./pages/AddProperty";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import { useEffect } from "react";
import api from "./lib/api";
import { useAuthStore } from "./store/authStore";
import { useFavouriteStore } from "./store/favouriteStore";
import Favourites from "./pages/Favourites";
import { useThemeStore } from "./store/themeStore";
import NotFound from "./pages/NotFound";
import { Toaster } from "react-hot-toast";
import AuthHandler from "./components/AuthHandler";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/About";
import TermsOfService from "./pages/TermsOfService";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import AdminTickets from "./pages/AdminTickets";
import Profile from "./pages/Profile";
import HelpCenter from "./pages/HelpCenter";
import Messages from "./pages/Messages";

function App() {
  const { user } = useAuthStore();
  const { set } = useFavouriteStore();
  const { dark } = useThemeStore();

  // Refresh user data on mount + when tab regains focus
  useEffect(() => {
    const token = useAuthStore.getState().token;
    const user = useAuthStore.getState().user;
    if (!user || !token) return;

    const syncUser = async () => {
      try {
        const currentToken = useAuthStore.getState().token;
        if (!currentToken) return;
        const res = await api.get('/auth/me');
        const freshUser = res.data;
        useAuthStore.getState().setAuth(freshUser, currentToken);
      } catch {
        // interceptor handles ACCOUNT_DELETED
      }
    };

    syncUser();

    const handleFocus = () => syncUser();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (user) {
      api
        .get("/properties/favourites")
        .then((res) => set((res.data as { id: number }[]).map((p) => p.id)))
        .catch(() => {});
    }
  }, [user]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(30, 30, 46, 0.9)",
            color: "#fff",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "14px",
          },
        }}
      />
      <AuthHandler />
      <MainLayout />
    </BrowserRouter>
  );
}

function MainLayout() {
  const location = useLocation();
  const hideNavbar = ["/login", "/register", "/reset-password"].includes(
    location.pathname,
  );

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:conversationId" element={<Messages />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
    </>
  );
}

export default App;
