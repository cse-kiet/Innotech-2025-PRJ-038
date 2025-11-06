import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Feed from "./pages/Feed";
import AIDigest from "./pages/AIDigest";
import Profile from "./pages/Profile";
import About from "./pages/About";
import AIAssistant from "./pages/AIAssistant";
import PaperDetail from "./pages/PaperDetail";
import HobbyistMode from "./pages/HobbyistMode";
import ArticleDetail from "./pages/ArticleDetail";

const App = () => {
  return (
    <Routes>
      {/* === Public Pages === */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      {/* Redirect /register to /login */}
      <Route path="/register" element={<Navigate to="/login" replace />} />

      <Route path="/onboarding" element={<Onboarding />} />

      {/* === Protected Light Theme Pages === */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <div className="bg-[#F5EFE6] text-[#352414] min-h-screen font-sans">
              <Navbar theme="light" />
              <Home />
              <Footer theme="light" />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/discover"
        element={
          <ProtectedRoute>
            <div className="bg-[#F5EFE6] text-[#352414] min-h-screen font-sans">
              <Navbar theme="light" />
              <Discover />
              <Footer theme="light" />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/aidigest"
        element={
          <ProtectedRoute>
            <div className="bg-[#F5EFE6] text-[#352414] min-h-screen font-sans">
              <Navbar theme="light" />
              <AIDigest />
              <Footer theme="light" />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <div className="bg-[#F5EFE6] text-[#352414] min-h-screen font-sans">
              <Navbar theme="light" />
              <Profile />
              <Footer theme="light" />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <div className="bg-[#F5EFE6] text-[#352414] min-h-screen font-sans">
              <Navbar theme="light" />
              <About />
              <Footer theme="light" />
            </div>
          </ProtectedRoute>
        }
      />

      {/* === Paper Detail Page (Light Theme) === */}
      <Route
        path="/paper/:id"
        element={
          <ProtectedRoute>
            <div className="bg-[#F5EFE6] text-[#352414] min-h-screen font-sans">
              <Navbar theme="light" />
              <PaperDetail />
              <Footer theme="light" />
            </div>
          </ProtectedRoute>
        }
      />

      {/* === Protected Dark Theme Pages === */}
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <div className="bg-[#0E0D0B] text-[#F5EFE6] min-h-screen font-sans">
              <Navbar theme="light" />
              <Feed />
              <Footer theme="light" />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/aiassistant"
        element={
          <ProtectedRoute>
            <div className="bg-[#0E0D0B] text-[#F5EFE6] min-h-screen font-sans">
              <Navbar theme="light" />
              <AIAssistant />
              <Footer theme="light" />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hobbyist"
        element={
          <ProtectedRoute>
            <div className="bg-[#F5EFE6] text-[#352414] min-h-screen font-sans">
              <Navbar theme="light" />
              <HobbyistMode />
              <Footer theme="light" />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/article/:id"
        element={
          <ProtectedRoute>
            <div className="bg-[#F5EFE6] text-[#352414] min-h-screen font-sans">
              <Navbar theme="light" />
              <ArticleDetail />
              <Footer theme="light" />
            </div>
          </ProtectedRoute>
        }
      />

      {/* === Catch All - 404 === */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
