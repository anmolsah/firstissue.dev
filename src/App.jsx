import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import BookmarksPage from "./pages/BookmarksPage";
import StatusPage from "./pages/StatusPage";
import ProfilePage from "./pages/ProfilePage";
import SupportPage from "./pages/SupportPage";
import ExplorePage from "./pages/ExplorePage";
import GettingStartedPage from "./pages/GettingStartedPage";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#222831]">
        <Navbar />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#393E46",
              color: "#EEEEEE",
              border: "1px solid rgba(238, 238, 238, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#00ADB5",
                secondary: "#222831",
              },
            },
          }}
        />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/getting-started" element={<GettingStartedPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/explore" element={<ExplorePage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
