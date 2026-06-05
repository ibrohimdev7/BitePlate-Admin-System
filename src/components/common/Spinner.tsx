export function Spinner() {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-forest-700" aria-label="Loading" />
    </div>
  );
}
