import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LithoPilot · 真空互联光刻产线智能工作台",
  description: "面向真空互联全自动光刻流程的批次编排、异常诊断、审批验证与交付追溯工作台。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
