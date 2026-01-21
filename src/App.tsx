import React, { Suspense, useEffect, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { SkeletonLoader } from "./components/SkeletonLoader";

// Lazy Load Pages for Progressive Upload / Performance
// This splits the code into separate chunks, so the user only downloads what they need.
const HomePage = lazy(() => import("./pages/HomePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));

function App() {
  useEffect(() => {
    // Ensure voices are loaded (global handler)
    const loadVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Initial call
    
    return () => {
       window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<SkeletonLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat/:topic/:level/:sessionId" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
