import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import PropertyDetail from "./pages/PropertyDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
import HelpCenter from "./pages/HelpCenter";

function App() {
  const { user } = useAuthStore();
  const { set } = useFavouriteStore();
  const { dark } = useThemeStore();

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
      <Navbar />
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
