import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import BookmarksPage from "./pages/BookmarksPage";

const App = () => {
  return (
    <AuthProvider>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
