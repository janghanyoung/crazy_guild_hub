import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import AuthGate from "@/components/auth/AuthGate";

export const metadata: Metadata = {
  title: "Crazy Guild Hub",
  description: "로스트아크 길드 관리 홈페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AuthGate>
          <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Sidebar />

            <div className="min-h-screen lg:pl-64">
              <Header />
              <main>{children}</main>
            </div>
          </div>
        </AuthGate>
      </body>
    </html>
  );
}