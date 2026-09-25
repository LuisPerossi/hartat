import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { StrictMode } from "react";

import './index.css'
import { router } from "./router";
const container = document.getElementById("root")!

createRoot(container)
    .render(
        <StrictMode>
            <RouterProvider router={router} />
        </StrictMode>
    )