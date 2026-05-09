import Link from "next/link";

const menus = [
  { href: "/", label: "메인" },
  { href: "/members", label: "길드원" },
  { href: "/raids", label: "레이드" },
  { href: "/achievements", label: "업적" },
  { href: "/guides", label: "공략집" },
  { href: "/admin/members", label: "길드원 관리" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-zinc-800 bg-zinc-950 p-6 lg:block">
      <div className="mb-10">
        <h1 className="text-2xl font-black tracking-tight">대환장 길드</h1>
        <p className="mt-2 text-sm text-zinc-500">Crazy Guild Hub</p>
      </div>

      <nav className="space-y-2">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className="block rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
          >
            {menu.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}