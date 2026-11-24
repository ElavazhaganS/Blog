import { useState } from "react";
import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";
import BrandLogo from "../../components/BrandLogo";
const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>,
    end: true
  },
  {
    label: "All Articles",
    to: "/admin/articles",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
  },
  {
    label: "Create Article",
    to: "/admin/create",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
  },
  {
    label: "Drafts",
    to: "/admin/articles?status=draft",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
  },
  {
    label: "Scheduled Posts",
    to: "/admin/articles?status=scheduled",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <polyline points="12 14 12 18 14 18" />
      </svg>
  },
  {
    label: "Published Posts",
    to: "/admin/articles?status=published",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
  },
  { type: "divider" },
  {
    label: "Categories",
    to: "/admin/categories",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
  },
  {
    label: "Tags",
    to: "/admin/tags",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
  },
  {
    label: "Authors",
    to: "/admin/authors",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
  },
  {
    label: "Users",
    to: "/admin/users",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
  },
  {
    label: "Media Library",
    to: "/admin/media",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
  },
  { type: "divider" },
  {
    label: "Settings",
    to: "/admin/settings",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
  }
];
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const SidebarContent = () => <div className="flex h-full flex-col">
      {
    /* Logo */
  }
      <div className="flex h-14 items-center border-b border-[#E5E7EB] px-4">
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo size="sm" />
          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Admin</span>
        </Link>
      </div>

      {
    /* Navigation */
  }
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_ITEMS.map((item, i) => {
    if ("type" in item && item.type === "divider") {
      return <div key={i} className="my-2 border-t border-[#F3F4F6]" />;
    }
    const navItem = item;
    const isQueryLink = navItem.to.includes("?");
    if (isQueryLink) {
      return <Link
        key={navItem.to}
        to={navItem.to}
        onClick={() => setSidebarOpen(false)}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#6B7280] transition hover:bg-[#F7F8FA] hover:text-[#202124]"
      >
                <span className="text-[#9CA3AF]">{navItem.icon}</span>
                {navItem.label}
              </Link>;
    }
    return <NavLink
      key={navItem.to}
      to={navItem.to}
      end={navItem.end}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${isActive ? "bg-[#EBF3FD] font-semibold text-[#1473E6]" : "text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#202124]"}`}
    >
              {({ isActive }) => <>
                  <span className={isActive ? "text-[#1473E6]" : "text-[#9CA3AF]"}>{navItem.icon}</span>
                  {navItem.label}
                </>}
            </NavLink>;
  })}
      </nav>

      {
    /* User Info */
  }
      <div className="border-t border-[#E5E7EB] p-3">
        <div className="flex items-center gap-2.5 rounded-lg p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1473E6] text-xs font-bold text-white flex-shrink-0">
            {user?.username?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[#202124]">{user?.username}</p>
            <p className="text-[11px] text-[#9CA3AF] capitalize">{user?.role || "admin"}</p>
          </div>
          <button
    onClick={handleLogout}
    title="Sign out"
    className="flex-shrink-0 rounded p-1 text-[#9CA3AF] transition hover:bg-[#F3F4F6] hover:text-[#E11D48]"
  >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>;
  return <div className="flex min-h-screen bg-[#F7F8FA]">
      {
    /* Desktop Sidebar */
  }
      <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-[#E5E7EB] z-30">
        <SidebarContent />
      </aside>

      {
    /* Mobile Sidebar Overlay */
  }
      {sidebarOpen && <div className="fixed inset-0 z-40 lg:hidden">
          <div
    className="absolute inset-0 bg-black/40"
    onClick={() => setSidebarOpen(false)}
  />
          <aside className="relative z-50 w-56 h-full bg-white border-r border-[#E5E7EB]">
            <SidebarContent />
          </aside>
        </div>}

      {
    /* Main Content Area */
  }
      <div className="flex flex-1 flex-col lg:pl-56">
        {
    /* Mobile Top Bar */
  }
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#E5E7EB] bg-white px-4 lg:hidden">
          <button
    onClick={() => setSidebarOpen(true)}
    className="rounded-lg p-1.5 text-[#6B7280] hover:bg-[#F7F8FA]"
  >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <BrandLogo size="sm" />
          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Admin</span>
        </div>

        {
    /* Page Content */
  }
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>;
}
