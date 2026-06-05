import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
        <p className="text-5xl font-bold text-forest-700">404</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">The route does not exist in the admin panel.</p>
        <Link className="focus-ring mt-6 inline-flex h-10 items-center justify-center rounded-md bg-forest-700 px-4 text-sm font-semibold text-white hover:bg-forest-900" to="/dashboard">
          Dashboard
        </Link>
      </section>
    </main>
  );
}
