import { NavBar } from "@/components/NavBar";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Ethan Wells",
  description: "Ethan Wells' Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <Analytics />
      <head />
      <body>
        <div className="flex w-full fixed top-0 z-10">
          <NavBar />
        </div>
        {children}
      </body>
    </html>
  );
}
