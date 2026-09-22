import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import HomePage from "./pages/HomePage.jsx";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";
import CarDetailsPage from "./pages/CarDetailsPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ConfirmationPage from "./pages/ConfirmationPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import MyBookingsPage from "./pages/MyBookingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminFleetPage from "./pages/admin/AdminFleetPage.jsx";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage.jsx";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage.jsx";

import HostLayout from "./pages/host/HostLayout.jsx";
import HostListingsPage from "./pages/host/HostListingsPage.jsx";
import HostBookingsPage from "./pages/host/HostBookingsPage.jsx";

export default function App() {
  return (
    <div className="shell">
      <Navbar />
      <div className="shell-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/cars/:id" element={<CarDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/checkout/:id" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/confirmation/:id" element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />
          <Route path="/account/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/account/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="fleet" element={<AdminFleetPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>

          <Route path="/host" element={<ProtectedRoute><HostLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="listings" replace />} />
            <Route path="listings" element={<HostListingsPage />} />
            <Route path="bookings" element={<HostBookingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
