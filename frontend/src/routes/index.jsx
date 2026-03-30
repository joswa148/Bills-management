import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import Dashboard from "../features/analytics/pages/Dashboard";
import SubscriptionsList from "../features/subscriptions/pages/SubscriptionsList";
import Analytics from "../features/analytics/pages/Analytics";
import Settings from "../features/settings/pages/Settings";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ProtectedRoute from "../components/common/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <App />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "subscriptions",
            element: <SubscriptionsList />,
          },
          {
            path: "analytics",
            element: <Analytics />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);
