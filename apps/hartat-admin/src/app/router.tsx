import { createBrowserRouter } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import NotFoundPage from "../pages/NotFoundPage";
import HomePage from "../pages/HomePage";
import ImagesPage from "../pages/ImagesPage";
import CategoriesPage from "../pages/CategoriesPage";
import PostsPage from "../pages/PostsPage";
import PostEditorPage from "../pages/PostEditorPage";
import PostPreviewPage from "../pages/PostPreviewPage";

export const router = createBrowserRouter([
    { 
        path: "/",
        element: <DashboardLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: '/images', element: <ImagesPage /> },
            { path: '/categories', element: <CategoriesPage /> },
            { path: '/posts', element: <PostsPage /> },
            { path: '/posts/new', element: <PostEditorPage /> },
            { path: '/posts/edit', element: <PostEditorPage /> },
            { path: '/posts/edit/:id', element: <PostEditorPage /> },
            { path: '/posts/preview/:id', element: <PostPreviewPage /> },
            { path: "*", element: <NotFoundPage /> }
        ],
    }
])