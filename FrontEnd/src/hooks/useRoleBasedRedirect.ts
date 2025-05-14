
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const useRoleBasedRedirect = (userRole: string | null) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userRole) return;

    const path = location.pathname;
    console.log("Checking role-based routing. Path:", path, "Role:", userRole);

    // Redirect admins to their specific routes
    if (userRole === "admin") {
      if (path === "/bookings" || path === "/agent/bookings") {
        console.log("Redirecting admin from:", path);
        navigate("/confirmed-bookings", { replace: true });
        return;
      }
    }

    // Redirect agents to their specific routes
    if (userRole === "agent") {
      if (path === "/bookings" || path === "/confirmed-bookings" || path === "/option-bookings") {
        console.log("Redirecting agent from:", path);
        navigate("/agent/bookings", { replace: true });
        return;
      }
    }

    // Redirect customers to their specific routes
    if (userRole === "customer") {
      if (path === "/agent/bookings" || path === "/confirmed-bookings" || path === "/option-bookings") {
        console.log("Redirecting customer from:", path);
        navigate("/bookings", { replace: true });
        return;
      }
    }
  }, [userRole, location.pathname, navigate]);
};
