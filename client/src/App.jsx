import { Link, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import PostDetails from "./pages/PostDetails.jsx";
import Profile from "./pages/Profile.jsx";
import Category from "./pages/Category.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminArticlesList from "./pages/admin/AdminArticlesList.jsx";
import AdminArticleEditor from "./pages/admin/AdminArticleEditor.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminTags from "./pages/admin/AdminTags.jsx";
import AdminAuthors from "./pages/admin/AdminAuthors.jsx";
import AdminMediaLibrary from "./pages/admin/AdminMediaLibrary.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
function NotFound() {
  return <div className="mx-auto max-w-xl px-4 py-28 text-center">
      <p className="text-6xl font-black text-[#1473E6]">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#202124]">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-[#6B7280]">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
    to="/"
    className="mt-6 inline-block rounded-lg bg-[#1473E6] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0d62c9]"
  >
        Back to the blog
      </Link>
    </div>;
}
function PublicLayout() {
  return <div className="flex min-h-screen flex-col bg-white text-[#202124]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>;
}
export default function App() {
  return <Routes>
      {
    /* admin login */
  }
      <Route path="/admin/login" element={<Login />} />

      {
    /* admin panel */
  }
      <Route
    path="/admin"
    element={<AdminRoute>
            <AdminLayout />
          </AdminRoute>}
  >
        <Route index element={<AdminDashboard />} />
        <Route path="articles" element={<AdminArticlesList />} />
        <Route path="create" element={<AdminArticleEditor />} />
        <Route path="edit/:slug" element={<AdminArticleEditor />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="tags" element={<AdminTags />} />
        <Route path="authors" element={<AdminAuthors />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="media" element={<AdminMediaLibrary />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {
    /* public pages */
  }
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blog/:slug" element={<PostDetails />} />
        <Route path="/post/:slug" element={<PostDetails />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route
    path="/dashboard"
    element={<ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>}
  />
        <Route
    path="/write"
    element={<ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>}
  />
        <Route
    path="/create"
    element={<ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>}
  />
        <Route
    path="/edit/:slug"
    element={<ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>}
  />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>;
}
