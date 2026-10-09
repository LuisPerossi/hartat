import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

function DashboardLayout() {
    return (
        <div className="flex flex-col h-dvh md:flex-row">
            <Sidebar />

            <main className="flex flex-1 flex-col p-8 gap-3 overflow-y-auto">  
                <Outlet />
            </main>
        </div>
    )
}

export default DashboardLayout