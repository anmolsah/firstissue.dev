import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import BookmarksPage from "./pages/BookmarksPage";
import StatusPage from "./pages/StatusPageNew";
import ProfilePage from "./pages/ProfilePageNew";
import SupportPage from "./pages/SupportPage";
import ExplorePage from "./pages/ExplorePage";
import GettingStartedPage from "./pages/GettingStartedPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import DocsPage from "./pages/DocsPage";
import DocsSectionPage from "./pages/DocsSectionPage";
import DocsArticlePage from "./pages/DocsArticlePage";
import TestGitHubPage from "./pages/TestGitHubPage";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";

// Layout wrapper that conditionally shows Navbar/Footer
const AppLayout = ({ children }) => {
  const location = useLocation();

  // Pages with their own sidebar layout - hide global Navbar/Footer
  const dashboardPages = [
    "/explore",
    "/profile",
    "/bookmarks",
    "/status",
    "/getting-started",
    "/terms",
    "/privacy",
    "/docs",
  ];
  const hideGlobalLayout = dashboardPages.some((page) =>
    location.pathname.startsWith(page),
  );

  // Also hide on login page
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col bg-[#222831]">
      {!hideGlobalLayout && !isLoginPage && <Navbar />}
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
      <div className="flex-1">{children}</div>
      {!hideGlobalLayout && !isLoginPage && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/getting-started" element={<GettingStartedPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/test-github" element={<TestGitHubPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/docs/:section" element={<DocsSectionPage />} />
            <Route
              path="/docs/:section/:article"
              element={<DocsArticlePage />}
            />
          </Routes>
        </AppLayout>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
