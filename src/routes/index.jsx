import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Dashboard from "../features/analytics/pages/Dashboard";
import BillsList from "../features/bills/pages/BillsList";
import Reports from "../features/analytics/pages/Reports";

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
        path: "bills",
        element: <BillsList />,
      },
      {
        path: "invoices",
        element: <div>Invoices Page Placeholder</div>,
      },
      {
        path: "reports",
        element: <Reports />,
      },
    ],
  },
]);
