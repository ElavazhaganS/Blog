import { useState } from "react";
export default function SubscribeModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
        onClose();
      }, 2e3);
    }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {
    /* Backdrop */
  }
      <div
    className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
    onClick={onClose}
  />

      {
    /* Modal */
  }
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl sm:p-8">
        <button
    type="button"
    onClick={onClose}
    className="absolute top-4 right-4 rounded-lg p-1 text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#202124]"
    aria-label="Close"
  >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {subscribed ? <div className="py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669]">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#202124]">
              You're subscribed!
            </h3>
            <p className="mt-1 text-sm text-[#6B7280]">
              Thank you for subscribing to DevLog technology updates.
            </p>
          </div> : <div>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#1473E6]/10 px-3 py-1 text-xs font-semibold text-[#1473E6]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1473E6]" />
              Newsletter
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[#202124]">
              Subscribe to DevLog
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">
              Get the latest developer insights, architectural deep dives, and tutorials delivered straight to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div>
                <label htmlFor="subscribe-email" className="sr-only">
                  Email address
                </label>
                <input
    id="subscribe-email"
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your email address"
    className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#202124] placeholder-[#9CA3AF] outline-none transition focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
  />
              </div>
              <button
    type="submit"
    className="w-full rounded-lg bg-[#1473E6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d62c9]"
  >
                Subscribe Now
              </button>
            </form>
            <p className="mt-3 text-center text-[11px] text-[#9CA3AF]">
              Zero spam. Unsubscribe at any time.
            </p>
          </div>}
      </div>
    </div>;
}
