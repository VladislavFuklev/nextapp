export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm">
        <span className="inline-flex items-center gap-2 text-slate-400">
          <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text font-semibold text-transparent">
            Made by
          </span>
          <span className="font-medium text-slate-200">Vladislav Fyklev</span>
          <span aria-hidden className="text-slate-600">•</span>
          <span className="text-slate-500">with ❤️</span>
        </span>
      </div>
    </footer>
  );
}
