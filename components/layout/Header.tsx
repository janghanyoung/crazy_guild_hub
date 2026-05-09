export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">Lost Ark Guild Platform</p>
          <h2 className="text-xl font-bold">길드 관리 허브</h2>
        </div>

        <div className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-400">
          mock-data mode
        </div>
      </div>
    </header>
  );
}