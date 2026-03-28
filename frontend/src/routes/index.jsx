import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Dashboard from "../features/analytics/pages/Dashboard";
import SubscriptionsList from "../features/subscriptions/pages/SubscriptionsList";
import Analytics from "../features/analytics/pages/Analytics";
import Settings from "../features/settings/pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
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
]);
