import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import BrandLogo from "../components/BrandLogo";
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state;
  const explicitRedirect = locationState?.from;
  const initialEmail = locationState?.registeredEmail ?? "";
  const registeredSuccess = locationState?.registeredSuccess ?? false;
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const signedInUser = await login(trimmedEmail, password);
      if (explicitRedirect && explicitRedirect !== "/" && explicitRedirect !== "/login") {
        navigate(explicitRedirect, { replace: true });
        return;
      }
      if (signedInUser.role === "admin" || signedInUser.role === "author") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };
  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSubmitted(true);
    }, 700);
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
            Sign in to your account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#6B7280]">
            Welcome back! Please enter your details to sign in.
          </p>
        </div>

        {
    /* Card */
  }
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-7 sm:p-9 shadow-xs">
          {
    /* Registration Success Banner */
  }
          {registeredSuccess && <div
    role="alert"
    className="mb-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800"
  >
              <svg
    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div className="leading-relaxed">
                <span className="font-semibold">Account created successfully!</span> Please sign in below with your credentials.
              </div>
            </div>}

          {
    /* Error Banner */
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
    /* Email Address */
  }
            <div>
              <label
    htmlFor="email"
    className="block text-xs font-semibold text-[#202124] mb-1"
  >
                Email Address
              </label>
              <input
    id="email"
    type="email"
    autoComplete="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="name@example.com"
    className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-xs sm:text-sm text-[#202124] placeholder-[#9CA3AF] outline-none transition focus:border-[#1473E6] focus:ring-2 focus:ring-[#1473E6]/15"
  />
            </div>

            {
    /* Password with Forgot Link */
  }
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
    htmlFor="password"
    className="block text-xs font-semibold text-[#202124]"
  >
                  Password
                </label>
                <button
    type="button"
    onClick={() => {
      setForgotEmail(email);
      setForgotSubmitted(false);
      setForgotModalOpen(true);
    }}
    className="text-xs font-medium text-[#1473E6] hover:underline"
  >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
    id="password"
    type={showPassword ? "text" : "password"}
    autoComplete="current-password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter your password"
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
    /* Submit Button */
  }
            <button
    type="submit"
    disabled={loading}
    className="w-full rounded-lg bg-[#1473E6] py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#0d62c9] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
  >
              {loading ? <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  Signing in...
                </span> : "Sign In"}
            </button>
          </form>

          {
    /* Registration Footer */
  }
          <div className="mt-6 border-t border-[#E5E7EB] pt-5 text-center">
            <p className="text-xs text-[#6B7280]">
              Don't have an account?{" "}
              <Link
    to="/register"
    className="font-semibold text-[#1473E6] hover:underline"
  >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {
    /* â”€â”€ FORGOT PASSWORD MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
      {forgotModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#202124]">Reset Password</h3>
              <button
    type="button"
    onClick={() => setForgotModalOpen(false)}
    className="text-[#9CA3AF] hover:text-[#4B5563]"
  >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {forgotSubmitted ? <div className="text-center py-4">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-[#202124]">Check your inbox</h4>
                <p className="mt-1 text-xs text-[#6B7280] leading-relaxed">
                  If an account exists for <strong className="text-[#202124]">{forgotEmail}</strong>, password reset instructions have been dispatched.
                </p>
                <button
    type="button"
    onClick={() => setForgotModalOpen(false)}
    className="mt-5 w-full rounded-lg bg-[#1473E6] py-2 text-xs font-semibold text-white hover:bg-[#0d62c9]"
  >
                  Return to Sign In
                </button>
              </div> : <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Enter your registered email address and we'll send you a link to reset your password.
                </p>
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-semibold text-[#202124] mb-1">
                    Email Address
                  </label>
                  <input
    id="forgot-email"
    type="email"
    required
    autoFocus
    value={forgotEmail}
    onChange={(e) => setForgotEmail(e.target.value)}
    placeholder="you@company.com"
    className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-xs text-[#202124] outline-none focus:border-[#1473E6]"
  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
    type="button"
    onClick={() => setForgotModalOpen(false)}
    className="rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-xs font-medium text-[#4B5563] hover:bg-[#F7F8FA]"
  >
                    Cancel
                  </button>
                  <button
    type="submit"
    disabled={forgotLoading}
    className="rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0d62c9] disabled:opacity-50"
  >
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>}
          </div>
        </div>}
    </div>;
}
