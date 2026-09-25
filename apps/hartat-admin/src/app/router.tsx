import { createBrowserRouter } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import NotFoundPage from "../pages/NotFoundPage";
import HomePage from "../pages/HomePage";

export const router = createBrowserRouter([
    { 
        path: "/",
        element: <DashboardLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "*", element: <NotFoundPage /> }
        ],
    }
])