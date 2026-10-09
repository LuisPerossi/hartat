import { createBrowserRouter } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import NotFoundPage from "../pages/NotFoundPage";
import HomePage from "../pages/HomePage";
import ImagesPage from "../pages/ImagesPage";

export const router = createBrowserRouter([
    { 
        path: "/",
        element: <DashboardLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: '/images', element: <ImagesPage /> },
            { path: "*", element: <NotFoundPage /> }
        ],
    }
])