
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BoatStatusUpdater } from "@/components/BoatStatusUpdater";
import Boats from "@/pages/Boats";
import AddBoat from "@/pages/AddBoat";
import EditBoat from "@/pages/EditBoat";
import Trips from "@/pages/Trips";
import Auth from "@/pages/Auth";
import Booking from "@/pages/Booking";
import ConfirmedBookings from "@/pages/ConfirmedBookings";
import OptionBookings from "@/pages/OptionBookings";
import ManageBookings from "@/pages/ManageBookings";
import Dashboard from "@/pages/Dashboard";
import AgentBookings from "@/pages/agent/AgentBookings";
import CustomerBookings from "@/pages/customer/CustomerBookings";

export const AppRoutes = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <BoatStatusUpdater />
      <Routes>
        <Route 
          path="/auth" 
          element={
            <ErrorBoundary>
              <Auth />
            </ErrorBoundary>
          } 
        />
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <Trips />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/boats"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <Boats />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/add-boat"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <AddBoat />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/edit-boat/:boatId"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <EditBoat />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/trips"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <Trips />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/booking/:tripId"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/bookings"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <CustomerBookings />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/agent/bookings"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <AgentBookings />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/confirmed-bookings"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <ConfirmedBookings />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/option-bookings"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <OptionBookings />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/manage-bookings/:tripId"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <ManageBookings />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
);
