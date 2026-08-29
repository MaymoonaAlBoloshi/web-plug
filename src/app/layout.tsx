import type { Metadata } from "next";
import "./globals.css";
import "@/components/chatbot.css";

export const metadata: Metadata = {
  title: "WebPlug — Knowledge that speaks",
  description: "Private, grounded chatbots for every customer website."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
