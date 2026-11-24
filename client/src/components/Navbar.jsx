import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import BrandLogo from "./BrandLogo";
import Avatar from "./Avatar";
import SubscribeModal from "./SubscribeModal";
export default function Navbar() {
  const { user, logout, mode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("English");
  const isArticleDetail = location.pathname.startsWith("/blog/");
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileNavOpen(false);
    }
  };
  return <>
      <header className="sticky top-0 z-40 bg-white">
        {
    /* =========================================================================
       TIER 1: MAIN GLOBAL HEADER (Exact match to Zoho Blog Reference)
       ========================================================================= */
  }
        <div className="border-b border-[#E5E7EB]">
          <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
            {
    /* Left: 4-Color Logo + "Blog" */
  }
            <Link to="/" className="flex items-center">
              <BrandLogo size="md" subText="Blog" />
            </Link>

            {
    /* Right: Search, Language, Subscribe, Account */
  }
            <div className="flex items-center gap-4 sm:gap-6">
              {
    /* Search Toggle / Bar */
  }
              <div className="relative">
                {searchOpen ? <form
    onSubmit={handleSearchSubmit}
    className="flex items-center gap-1"
  >
                    <input
    type="search"
    autoFocus
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search blog..."
    className="w-40 sm:w-56 rounded-md border border-[#E5E7EB] bg-[#F7F8FA] px-2.5 py-1 text-xs text-[#202124] outline-none focus:border-[#1473E6] focus:bg-white"
  />
                    <button
    type="submit"
    className="rounded p-1 text-[#1473E6] hover:bg-[#F7F8FA]"
    aria-label="Submit search"
  >
                      <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button
    type="button"
    onClick={() => setSearchOpen(false)}
    className="rounded p-1 text-[#6B7280] hover:bg-[#F7F8FA]"
    aria-label="Close search"
  >
                      <svg
    className="h-3.5 w-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
                        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  </form> : <button
    type="button"
    onClick={() => setSearchOpen(true)}
    className="flex items-center text-[#6B7280] transition hover:text-[#202124]"
    aria-label="Search"
  >
                    <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                    </svg>
                  </button>}
              </div>

              {
    /* Language Selector Dropdown */
  }
              <div className="relative hidden sm:block">
                <button
    type="button"
    onClick={() => setLangOpen(!langOpen)}
    className="flex items-center gap-1 text-xs font-medium text-[#6B7280] transition hover:text-[#202124]"
    aria-expanded={langOpen}
  >
                  <svg
    className="h-3.5 w-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span>{currentLang}</span>
                  <svg
    className="h-3 w-3"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {langOpen && <>
                    <button
    type="button"
    aria-label="Close language menu"
    className="fixed inset-0 z-10 cursor-default"
    onClick={() => setLangOpen(false)}
  />
                    <div className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
                      {["English", "Espa\xC3\xB1ol", "Fran\xC3\xA7ais", "Deutsch", "\xE6\u2014\xA5\xE6\u0153\xAC\xE8\xAA\u017E"].map(
    (lang) => <button
      key={lang}
      type="button"
      onClick={() => {
        setCurrentLang(lang);
        setLangOpen(false);
      }}
      className={`block w-full px-3 py-1.5 text-left text-xs ${currentLang === lang ? "bg-[#F7F8FA] font-semibold text-[#1473E6]" : "text-[#4B5563] hover:bg-[#F7F8FA]"}`}
    >
                            {lang}
                          </button>
  )}
                    </div>
                  </>}
              </div>

              {
    /* Subscribe action */
  }
              <button
    type="button"
    onClick={() => setSubscribeOpen(true)}
    className="hidden sm:inline-block text-xs font-medium text-[#6B7280] transition hover:text-[#202124]"
  >
                Subscribe
              </button>

              {mode === "demo" && <span
    title="Demo mode: data is stored in your browser"
    className="hidden rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 lg:inline"
  >
                  Demo
                </span>}

              {
    /* User Account / Sign In */
  }
              {user ? <div className="relative">
                  <button
    type="button"
    onClick={() => setMenuOpen(!menuOpen)}
    className="flex items-center gap-1.5 rounded-full p-0.5 hover:ring-2 hover:ring-[#1473E6]/20"
    aria-expanded={menuOpen}
  >
                    <Avatar name={user.username} src={user.avatar} size="sm" />
                  </button>

                  {menuOpen && <>
                      <button
    type="button"
    aria-label="Close menu"
    className="fixed inset-0 z-10 cursor-default"
    onClick={() => setMenuOpen(false)}
  />
                      <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
                        <div className="border-b border-[#E5E7EB] px-3 py-2 bg-[#F7F8FA]">
                          <p className="truncate text-xs font-semibold text-[#202124]">
                            {user.username}
                          </p>
                          <p className="truncate text-[10px] text-[#6B7280]">
                            {user.email ?? "User"} â€¢ <span className="capitalize">{user.role ?? "user"}</span>
                          </p>
                        </div>
                        <Link
    to="/dashboard"
    onClick={() => setMenuOpen(false)}
    className="block px-3 py-1.5 text-xs font-medium text-[#202124] hover:bg-[#F7F8FA]"
  >
                          My Dashboard
                        </Link>
                        <Link
    to={`/profile/${user.username}`}
    onClick={() => setMenuOpen(false)}
    className="block px-3 py-1.5 text-xs text-[#4B5563] hover:bg-[#F7F8FA]"
  >
                          Public Profile
                        </Link>
                        <Link
    to="/write"
    onClick={() => setMenuOpen(false)}
    className="block px-3 py-1.5 text-xs text-[#4B5563] hover:bg-[#F7F8FA]"
  >
                          Write Article
                        </Link>
                        {(user?.role === "admin" || user?.role === "author") && <>
                            <div className="border-t border-[#E5E7EB] my-1" />
                            <Link
    to="/admin"
    onClick={() => setMenuOpen(false)}
    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#1473E6] hover:bg-[#EBF3FD]"
  >
                              <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                              </svg>
                              Admin Panel
                            </Link>
                          </>}
                        <button
    type="button"
    onClick={handleLogout}
    className="block w-full border-t border-[#E5E7EB] px-3 py-1.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50"
  >
                          Sign Out
                        </button>
                      </div>
                    </>}
                </div> : <div className="flex items-center gap-3">
                  <Link
    to="/login"
    className="text-xs font-medium text-[#6B7280] transition hover:text-[#202124]"
  >
                    Sign In
                  </Link>
                  <Link
    to="/register"
    className="rounded border border-[#E5E7EB] px-2.5 py-1 text-xs font-medium text-[#202124] transition hover:bg-[#F7F8FA]"
  >
                    Register
                  </Link>
                </div>}

              {
    /* Mobile Menu Toggle */
  }
              <button
    type="button"
    onClick={() => setMobileNavOpen(!mobileNavOpen)}
    className="flex items-center text-[#6B7280] hover:text-[#202124] sm:hidden"
    aria-label="Toggle navigation"
  >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  {mobileNavOpen ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /> : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {
    /* =========================================================================
       TIER 2: SUB-NAVIGATION (Hidden on article details)
       ========================================================================= */
  }
        {!isArticleDetail && <div className="border-b border-[#E5E7EB] bg-white">
            <div className="mx-auto flex h-11 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
              {
    /* Left Title in Tier 2 */
  }
              <span className="text-sm font-bold text-[#202124] tracking-tight">
                Developer Blog
              </span>

              {
    /* Right: Quick Category / Action Links */
  }
              <div className="flex items-center gap-5 text-xs">
                <Link
    to="/"
    className="font-medium text-[#6B7280] transition hover:text-[#202124]"
  >
                  All Posts
                </Link>
                <Link
    to="/?view=all"
    className="hidden sm:inline-block font-medium text-[#6B7280] transition hover:text-[#202124]"
  >
                  Topics
                </Link>
                <Link
    to="/write"
    className="rounded-full border border-[#E11D48] px-3.5 py-1 text-xs font-semibold text-[#E11D48] transition hover:bg-[#E11D48] hover:text-white"
  >
                  Write Post
                </Link>
              </div>
            </div>
          </div>}

        {
    /* Mobile Navigation Drawer */
  }
        {mobileNavOpen && <div className="border-b border-[#E5E7EB] bg-white px-4 py-4 sm:hidden">
            <nav className="flex flex-col space-y-3 text-xs">
              <Link
    to="/"
    onClick={() => setMobileNavOpen(false)}
    className="font-medium text-[#202124]"
  >
                Blog Home
              </Link>
              {user && <Link
    to="/dashboard"
    onClick={() => setMobileNavOpen(false)}
    className="font-semibold text-[#1473E6]"
  >
                  My Dashboard
                </Link>}
              <Link
    to="/write"
    onClick={() => setMobileNavOpen(false)}
    className="text-[#6B7280]"
  >
                Write Post
              </Link>
              <button
    type="button"
    onClick={() => {
      setMobileNavOpen(false);
      setSubscribeOpen(true);
    }}
    className="text-left font-medium text-[#1473E6]"
  >
                Subscribe to Updates
              </button>
              {(user?.role === "admin" || user?.role === "author") && <Link
    to="/admin"
    onClick={() => setMobileNavOpen(false)}
    className="flex items-center gap-2 font-semibold text-[#1473E6]"
  >
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  Admin Panel
                </Link>}
            </nav>
          </div>}
      </header>

      {
    /* Subscribe Modal */
  }
      <SubscribeModal
    isOpen={subscribeOpen}
    onClose={() => setSubscribeOpen(false)}
  />
    </>;
}
