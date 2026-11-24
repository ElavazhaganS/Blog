import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useAuth } from "../../AuthContext.jsx";
export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterTab, setFilterTab] = useState("all");
  const [roleUpdating, setRoleUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.listUsers();
      setUsers(data);
    } catch (err) {
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const filteredUsers = users.filter((u) => {
    if (filterTab === "admin") return u.role === "admin";
    if (filterTab === "user") return u.role === "user" || u.role === "author";
    return true;
  });
  const handleRoleChange = async (id, newRole) => {
    setRoleUpdating(id);
    setError(null);
    try {
      const updated = await api.updateUserRole(id, newRole);
      setUsers(
        (prev) => prev.map((u) => u.id === id ? { ...u, role: updated.role } : u)
      );
      setSuccess("User role updated successfully.");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(err.message || "Could not update role.");
    } finally {
      setRoleUpdating(null);
    }
  };
  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`))
      return;
    setDeleting(id);
    setError(null);
    try {
      await api.deleteUserAdmin(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSuccess(`User "${username}" deleted.`);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(err.message || "Could not delete user.");
    } finally {
      setDeleting(null);
    }
  };
  const roleBadge = (role) => {
    if (role === "admin")
      return <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
          Admin
        </span>;
    if (role === "author")
      return <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
          Author
        </span>;
    return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        User
      </span>;
  };
  const TABS = [
    { key: "all", label: "All Users" },
    { key: "admin", label: "Admins" },
    { key: "user", label: "Regular Users" }
  ];
  return <div className="p-6 max-w-5xl mx-auto">
      {
    /* Header */
  }
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#202124]">User Management</h1>
        <p className="mt-0.5 text-xs text-[#6B7280]">
          View, manage roles, and remove registered users.
        </p>
      </div>

      {
    /* Alerts */
  }
      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {error}
        </div>}
      {success && <div className="mb-4 rounded-lg border border-[#A7F3D0] bg-[#F0FDF4] px-4 py-3 text-xs font-medium text-[#059669]">
          âœ“ {success}
        </div>}

      {
    /* Filter Tabs */
  }
      <div className="mb-4 flex gap-1 border-b border-[#E5E7EB]">
        {TABS.map((tab) => <button
    key={tab.key}
    onClick={() => setFilterTab(tab.key)}
    className={`px-4 py-2 text-xs font-medium transition border-b-2 -mb-px ${filterTab === tab.key ? "border-[#1473E6] text-[#1473E6]" : "border-transparent text-[#6B7280] hover:text-[#202124]"}`}
  >
            {tab.label}
            <span className="ml-1.5 rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] text-[#6B7280]">
              {tab.key === "all" ? users.length : users.filter(
    (u) => tab.key === "admin" ? u.role === "admin" : u.role === "user" || u.role === "author"
  ).length}
            </span>
          </button>)}
      </div>

      {
    /* Users Table */
  }
      {loading ? <div className="flex items-center justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
        </div> : filteredUsers.length === 0 ? <div className="rounded-xl border border-[#E5E7EB] bg-white py-16 text-center">
          <p className="text-sm text-[#9CA3AF]">No users found.</p>
        </div> : <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F7F8FA]">
                <th className="px-4 py-3 font-semibold text-[#6B7280] uppercase tracking-wider">
                  Name / Email
                </th>
                <th className="px-4 py-3 font-semibold text-[#6B7280] uppercase tracking-wider">
                  Role
                </th>
                <th className="hidden md:table-cell px-4 py-3 font-semibold text-[#6B7280] uppercase tracking-wider">
                  Admin ID
                </th>
                <th className="hidden sm:table-cell px-4 py-3 font-semibold text-[#6B7280] uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 font-semibold text-[#6B7280] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredUsers.map((u) => {
    const isSelf = u.id === currentUser?.id;
    return <tr key={u.id} className="hover:bg-[#F7F8FA] transition">
                    {
      /* Name / Email */
    }
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-[#1473E6] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold uppercase">
                          {u.username?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-[#202124]">
                            {u.username}
                            {isSelf && <span className="ml-1.5 text-[10px] text-[#9CA3AF]">
                                (you)
                              </span>}
                          </p>
                          <p className="text-[11px] text-[#9CA3AF]">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {
      /* Role Badge */
    }
                    <td className="px-4 py-3">{roleBadge(u.role)}</td>

                    {
      /* Admin ID */
    }
                    <td className="hidden md:table-cell px-4 py-3 text-[#9CA3AF]">
                      {u.adminId || "\xE2\u20AC\u201D"}
                    </td>

                    {
      /* Joined */
    }
                    <td className="hidden sm:table-cell px-4 py-3 text-[#9CA3AF]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString(
      "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    ) : "\xE2\u20AC\u201D"}
                    </td>

                    {
      /* Actions */
    }
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {
      /* Change Role Select */
    }
                        {!isSelf && <select
      value={u.role}
      disabled={roleUpdating === u.id}
      onChange={(e) => handleRoleChange(u.id, e.target.value)}
      className="rounded border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] text-[#374151] outline-none focus:border-[#1473E6] disabled:opacity-60 cursor-pointer"
      title="Change role"
    >
                            <option value="user">User</option>
                            <option value="author">Author</option>
                            <option value="admin">Admin</option>
                          </select>}
                        {roleUpdating === u.id && <div className="h-3.5 w-3.5 animate-spin rounded-full border border-[#E5E7EB] border-t-[#1473E6]" />}

                        {
      /* Delete Button */
    }
                        {!isSelf && <button
      onClick={() => handleDelete(u.id, u.username)}
      disabled={deleting === u.id}
      className="flex h-6 w-6 items-center justify-center rounded text-[#9CA3AF] transition hover:bg-rose-100 hover:text-rose-600 disabled:opacity-60"
      title="Delete user"
    >
                            {deleting === u.id ? <div className="h-3 w-3 animate-spin rounded-full border border-rose-300 border-t-rose-600" /> : <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>}
                          </button>}
                      </div>
                    </td>
                  </tr>;
  })}
            </tbody>
          </table>
        </div>}

      {
    /* Summary */
  }
      {!loading && <p className="mt-3 text-[11px] text-[#9CA3AF]">
          Showing {filteredUsers.length} of {users.length} total user
          {users.length !== 1 ? "s" : ""}
        </p>}
    </div>;
}
