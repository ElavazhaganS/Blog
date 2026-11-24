import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import BrandLogo from "../components/BrandLogo";
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (trimmedName.length < 3) {
      setError("Full Name / Username must be at least 3 characters.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    setLoading(true);
    try {
      await register(trimmedName, trimmedEmail, password);
      navigate("/login", {
        replace: true,
        state: {
          registeredSuccess: true,
          registeredEmail: trimmedEmail
        }
      });
    } catch (err) {
      setError(err.message || "Could not complete registration.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {
    /* Header Branding */
  }
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4">
            <BrandLogo size="md" subText="Blog" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#202124] sm:text-3xl">
            Create your account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#6B7280]">
            Join the DevLog community to read, bookmark, and publish tech articles.
          </p>
        </div>

        {
    /* Card */
  }
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-7 sm:p-9 shadow-xs">
          {
    /* Error Alert */
  }
          {error && <div
    role="alert"
    className="mb-5 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700"
  >
              <svg
    className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium leading-relaxed">{error}</span>
            </div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {
    /* Full Name */
  }
            <div>
              <label
    htmlFor="name"
    className="block text-xs font-semibold text-[#202124] mb-1"
  >
                Full Name / Username <span className="text-rose-500">*</span>
              </label>
              <input
    id="name"
    type="text"
    autoComplete="name"
    required
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="e.g. Alex Morgan"
    className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-xs sm:text-sm text-[#202124] placeholder-[#9CA3AF] outline-none transition focus:border-[#1473E6] focus:ring-2 focus:ring-[#1473E6]/15"
  />
            </div>

            {
    /* Email Address */
  }
            <div>
              <label
    htmlFor="email"
    className="block text-xs font-semibold text-[#202124] mb-1"
  >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
    id="email"
    type="email"
    autoComplete="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="you@company.com"
    className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-xs sm:text-sm text-[#202124] placeholder-[#9CA3AF] outline-none transition focus:border-[#1473E6] focus:ring-2 focus:ring-[#1473E6]/15"
  />
            </div>

            {
    /* Password */
  }
            <div>
              <label
    htmlFor="password"
    className="block text-xs font-semibold text-[#202124] mb-1"
  >
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
    id="password"
    type={showPassword ? "text" : "password"}
    autoComplete="new-password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="At least 6 characters"
    className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-[#202124] placeholder-[#9CA3AF] outline-none transition focus:border-[#1473E6] focus:ring-2 focus:ring-[#1473E6]/15"
  />
                <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    tabIndex={-1}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] transition"
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
                  {showPassword ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg> : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>}
                </button>
              </div>
            </div>

            {
    /* Confirm Password */
  }
            <div>
              <label
    htmlFor="confirmPassword"
    className="block text-xs font-semibold text-[#202124] mb-1"
  >
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
    id="confirmPassword"
    type={showConfirmPassword ? "text" : "password"}
    autoComplete="new-password"
    required
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    placeholder="Re-enter password"
    className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-[#202124] placeholder-[#9CA3AF] outline-none transition focus:border-[#1473E6] focus:ring-2 focus:ring-[#1473E6]/15"
  />
                <button
    type="button"
    onClick={() => setShowConfirmPassword((prev) => !prev)}
    tabIndex={-1}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] transition"
    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
  >
                  {showConfirmPassword ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg> : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>}
                </button>
              </div>
            </div>

            {
    /* Terms note */
  }
            <p className="text-[11px] text-[#6B7280] leading-relaxed pt-1">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>

            {
    /* Submit Button */
  }
            <button
    type="submit"
    disabled={loading}
    className="w-full rounded-lg bg-[#1473E6] py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#0d62c9] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
  >
              {loading ? <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  Creating Account...
                </span> : "Create Account"}
            </button>
          </form>

          {
    /* Sign In Footer */
  }
          <div className="mt-6 border-t border-[#E5E7EB] pt-5 text-center">
            <p className="text-xs text-[#6B7280]">
              Already have an account?{" "}
              <Link
    to="/login"
    className="font-semibold text-[#1473E6] hover:underline"
  >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>;
}
