import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

function DashboardLayout() {
    return (
        <div className="flex flex-col h-dvh overflow-hidden md:flex-row">
            <Sidebar />

            <main className="flex flex-col flex-1 p-8 gap-3 h-full overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}

export default DashboardLayout