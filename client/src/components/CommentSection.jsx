import { useState } from "react";
import Avatar from "./Avatar";
export default function CommentSection({ postSlug }) {
  const storageKey = `devlog_comments_${postSlug}`;
  const [comments, setComments] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch {
    }
    return [
      {
        id: "c1",
        name: "Alex Rivera",
        email: "alex@example.com",
        content: "Outstanding explanation. The breakdown of microtasks and the call stack cleared up a long-standing concurrency mystery in our service.",
        createdAt: new Date(Date.now() - 36e5 * 24).toISOString()
      }
    ];
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) return;
    const newComment = {
      id: `c_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      content: content.trim(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
    }
    setName("");
    setEmail("");
    setContent("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3e3);
  };
  return <div className="mt-14 border-t border-[#E5E7EB] pt-12">
      {
    /* Existing Comments */
  }
      {comments.length > 0 && <div className="mb-12">
          <h3 className="text-lg font-bold tracking-tight text-[#202124]">
            Comments ({comments.length})
          </h3>

          <div className="mt-6 space-y-4">
            {comments.map((comment) => <div
    key={comment.id}
    className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-4 sm:p-5"
  >
                <div className="flex items-center gap-3">
                  <Avatar name={comment.name} size="sm" />
                  <div>
                    <h4 className="text-xs font-bold text-[#202124]">
                      {comment.name}
                    </h4>
                    <p className="text-[11px] text-[#9CA3AF]">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#4B5563]">
                  {comment.content}
                </p>
              </div>)}
          </div>
        </div>}

      {
    /* Leave a Reply Form (Reference: Zoho Blog) */
  }
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
        <h3 className="text-xl font-bold tracking-tight text-[#202124]">
          Leave a Reply
        </h3>
        <p className="mt-1 text-xs text-[#6B7280]">
          Required fields are marked <span className="text-rose-500">*</span>
        </p>

        {submitted && <div className="mt-4 rounded-lg bg-[#ECFDF5] p-3 text-xs font-medium text-[#059669]">
            âœ“ Your comment has been published!
          </div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
    htmlFor="comment"
    className="block text-xs font-semibold text-[#202124]"
  >
              Comment <span className="text-rose-500">*</span>
            </label>
            <textarea
    id="comment"
    required
    rows={4}
    value={content}
    onChange={(e) => setContent(e.target.value)}
    placeholder="Write your thoughts or questions here..."
    className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] p-3 text-xs text-[#202124] placeholder-[#9CA3AF] outline-none transition focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
  />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
    htmlFor="name"
    className="block text-xs font-semibold text-[#202124]"
  >
                Name <span className="text-rose-500">*</span>
              </label>
              <input
    id="name"
    type="text"
    required
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Your full name"
    className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-xs text-[#202124] placeholder-[#9CA3AF] outline-none transition focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
  />
            </div>

            <div>
              <label
    htmlFor="email"
    className="block text-xs font-semibold text-[#202124]"
  >
                Email <span className="text-rose-500">*</span>
              </label>
              <input
    id="email"
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="your.email@example.com"
    className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-xs text-[#202124] placeholder-[#9CA3AF] outline-none transition focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
  />
            </div>
          </div>

          <p className="text-[11px] text-[#9CA3AF]">
            By submitting this form, you agree to the processing of personal data according to our{" "}
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-[#1473E6] underline">
              Privacy Policy
            </a>
            .
          </p>

          <button
    type="submit"
    className="rounded-lg bg-[#1473E6] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#0d62c9]"
  >
            Post Comment
          </button>
        </form>
      </div>
    </div>;
}
