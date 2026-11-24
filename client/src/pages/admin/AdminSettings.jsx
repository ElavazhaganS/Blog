export default function AdminSettings() {
  const sitemapUrl = `${window.location.origin}/sitemap.xml`;
  const robotsUrl = `${window.location.origin}/robots.txt`;
  const sections = [
    {
      title: "Site Identity",
      items: [
        { label: "Blog Name", value: "DevLog", description: "Your blog's display name." },
        { label: "Blog Tagline", value: "Engineering insights, cloud architecture, and technology deep-dives.", description: "Shown in SEO metadata." },
        { label: "Blog URL", value: window.location.origin, description: "The public URL of your blog." }
      ]
    },
    {
      title: "SEO & Indexing",
      items: [
        { label: "XML Sitemap", value: sitemapUrl, link: sitemapUrl, description: "Submit this to Google Search Console and Bing Webmaster Tools." },
        { label: "Robots.txt", value: robotsUrl, link: robotsUrl, description: "Controls which pages search engines can crawl." }
      ]
    },
    {
      title: "Content Management",
      items: [
        { label: "Article Scheduler", value: "Active \xE2\u20AC\u201D checks every 60 seconds", description: "Automatically publishes scheduled posts when their publish date arrives." },
        { label: "Media Storage", value: "public/uploads/ (local disk)", description: "Uploaded images are stored on the server's local filesystem." },
        { label: "Demo Mode Fallback", value: "Active when API is unreachable", description: "Blog operates in demo mode using localStorage when the backend is offline." }
      ]
    },
    {
      title: "Database",
      items: [
        { label: "Categories Pre-seeded", value: "7 categories (Software Development, AI & ML, Web & Mobile, Technology & Innovation, Cybersecurity, Cloud Computing, Industry Insights)", description: "These are automatically created on first server start." },
        { label: "Article Status Types", value: "published, draft, scheduled", description: "Draft and scheduled posts are never shown publicly." }
      ]
    }
  ];
  return <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#202124]">Settings</h1>
        <p className="mt-0.5 text-xs text-[#6B7280]">Blog configuration, SEO, and system information.</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => <div key={section.title} className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
            <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-5 py-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">{section.title}</h2>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {section.items.map((item) => <div key={item.label} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#202124]">{item.label}</p>
                      <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{item.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {item.link ? <a
    href={item.link}
    target="_blank"
    rel="noreferrer"
    className="text-xs font-medium text-[#1473E6] hover:underline break-all"
  >
                          {item.value}
                        </a> : <span className="text-xs text-[#4B5563] max-w-[280px] text-right block">{item.value}</span>}
                    </div>
                  </div>
                </div>)}
            </div>
          </div>)}

        {
    /* Quick Links */
  }
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B7280]">Quick Links</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
    { label: "View Blog", href: "/" },
    { label: "XML Sitemap", href: "/sitemap.xml" },
    { label: "Robots.txt", href: "/robots.txt" },
    { label: "API Health", href: "/api/health" },
    { label: "All Articles", href: "/admin/articles" },
    { label: "Categories", href: "/admin/categories" }
  ].map((link) => <a
    key={link.href}
    href={link.href}
    target="_blank"
    rel="noreferrer"
    className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-[#6B7280] transition hover:border-[#1473E6] hover:text-[#1473E6] text-center"
  >
                {link.label} â†—
              </a>)}
          </div>
        </div>
      </div>
    </div>;
}
