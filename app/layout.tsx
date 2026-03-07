import type { Metadata } from "next";
import React, { Suspense } from "react";
import "./globals.css";
import { AppProvider } from "@/lib/context";

export const metadata: Metadata = {
  title: "时间小火车 TimeTrain",
  description: "用火车的方式管理你的一天",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProvider>
          <Suspense>
            {children}
          </Suspense>
        </AppProvider>
      </body>
    </html>
  );
}