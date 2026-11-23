import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
