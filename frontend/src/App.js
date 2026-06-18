import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Register from './pages/Register';
import SplashScreen from './components/SplashScreen';
import ScrollToTop from './components/ScrollToTop';

const isLoggedIn = () => localStorage.getItem('token') !== null;

const ProtectedRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/login" />;
}

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/dashboard" element={
          <ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>
        } />
        <Route path="/services" element={
          <ProtectedRoute><PageWrapper><Services /></PageWrapper></ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute><PageWrapper><Alerts /></PageWrapper></ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute><PageWrapper><Analytics /></PageWrapper></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <SplashScreen onComplete={() => setSplashDone(true)} />;
  }

  return (
    <Router>
      <ScrollToTop />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;