export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12 px-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-orange-100 bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Resources</h1>
        <p className="mb-6 text-sm text-gray-600">
          Guides, tips, and career resources are coming soon. Check back for interview prep
          articles tailored to Western job markets.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="/" className="text-orange-600 hover:underline">
            Home
          </a>
          <a href="/privacy" className="text-orange-600 hover:underline">
            Privacy Policy
          </a>
          <a href="/terms" className="text-orange-600 hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </main>
  );
}
