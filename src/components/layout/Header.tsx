"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Settings, ArrowLeft, Menu, Bell, BellOff, Loader2 } from "lucide-react";
import { Logo } from "../ui/Logo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import Link from "next/link";
import { SearchButton } from "./SearchButton";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isScrolled } = useScrollHeader();
  const pathname = usePathname();
  const isAdmin = pathname === "/admin";
  
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    requestPermission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const handleNotificationToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      if (permission === "default") {
        const granted = await requestPermission();
        if (granted) {
          await subscribe();
        }
      } else if (permission === "granted") {
        await subscribe();
      }
    }
  };

  const getNotificationIcon = () => {
    if (loading) return Loader2;
    if (!isSupported || permission === "denied") return BellOff;
    return isSubscribed ? Bell : BellOff;
  };

  const getNotificationColor = () => {
    if (!isSupported || permission === "denied") return "text-gray-400";
    if (loading) return "text-blue-600";
    return isSubscribed ? "text-green-600" : "text-gray-600";
  };

  const NotificationIcon = getNotificationIcon();

  return (
    <>
      <header
        className={`
          bg-white border-b border-gray-200 
          fixed top-0 left-0 right-0 z-40
          transition-all duration-300
          ${isScrolled ? "shadow-md" : ""}
        `}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div
            className={`
              flex items-center justify-between gap-8
              transition-all duration-300
              ${isScrolled ? "h-14 md:h-16" : "h-16 md:h-24"}
            `}
          >
            {/* Mobile controls */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Notification button */}
              {!isAdmin && (
                <button
                  onClick={handleNotificationToggle}
                  disabled={!isSupported || permission === "denied" || loading}
                  className={`p-2 rounded-full transition-colors ${
                    !isSupported || permission === "denied"
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-gray-100"
                  }`}
                  title={
                    !isSupported
                      ? "Notificações não suportadas"
                      : permission === "denied"
                      ? "Permissão negada"
                      : isSubscribed
                      ? "Desativar notificações"
                      : "Ativar notificações"
                  }
                >
                  <NotificationIcon 
                    className={`w-5 h-5 ${getNotificationColor()} ${
                      loading ? "animate-spin" : ""
                    }`} 
                  />
                </button>
              )}
              
              {/* Menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center md:items-start">
              <div
                className={`
                  transition-all duration-300
                  ${
                    isScrolled
                      ? "w-[140px] md:w-[200px]"
                      : "w-[160px] md:w-[280px]"
                  }
                `}
              >
                <Link href={"/"}>
                  <Logo />
                </Link>
              </div>
            </div>

            {!isAdmin && (
              <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
                <DesktopNav />
                <SearchButton />
              </div>
            )}

            {/* Admin settings button */}
            {isAdmin && (
              <Link
                prefetch={false}
                href={"/"}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2"
                title={"Back to Site"}
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
                <span className="text-sm font-medium text-gray-600 hidden sm:inline">
                  Back to Site
                </span>
              </Link>
            )}
            {!isAdmin && (
              <div className="md:hidden flex items-center">
                <SearchButton />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spacer div that matches header height */}
      <div
        className={`
          transition-all duration-300
          ${isScrolled ? "h-14 md:h-16" : "h-16 md:h-24"}
        `}
      />

      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
