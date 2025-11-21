import { Header } from "@/components/layout/Header";
import "@/styles/globals.css";
import CookieConsent from "@/components/CookieConsent";
import NextTopLoader from "nextjs-toploader";
import { twMerge } from "tailwind-merge";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={twMerge("h-full min-h-screen bg-gray-100")}>
      <NextTopLoader color="#e10012" shadow={false} showSpinner={false} />
      {children}
      {process.env.GOOGLE_ANALYTICS_ID && (
        <CookieConsent gaId={process.env.GOOGLE_ANALYTICS_ID} />
      )}
    </div>
  );
}
