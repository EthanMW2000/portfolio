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
        {children}
      </body>
    </html>
  );
}
