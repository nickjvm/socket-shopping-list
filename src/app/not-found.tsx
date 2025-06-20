import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      {/* No support for metadata in not-found pages
      https://github.com/vercel/next.js/issues/45620#issuecomment-1827734000
      */}
      <title>Page Not Found | Socket Shopping List</title>
      <h2 className="font-bold text-xl">Not Found</h2>
      <p>The page you are trying to access does not exist.</p>
      <Link
        href="/"
        className="rounded px-4 py-2 bg-white border dark:bg-slate-700 border-slate-800 dark:border-slate-800"
      >
        Return Home
      </Link>
    </div>
  );
}
