"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

export const CookieConsent = ({ gaId }: { gaId: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = localStorage.getItem("cookieConsent");
    if (!hasConsent) {
      setIsVisible(true);
    } else if (hasConsent === "accepted") {
      setAnalyticsEnabled(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
    setAnalyticsEnabled(true);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setIsVisible(false);
    setAnalyticsEnabled(false);
  };

  return (
    <>
      <GoogleAnalytics gaId={gaId} />
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-gray-700">
                  Este site utiliza cookies para melhorar a sua experiência.
                  Leia a nossa{" "}
                  <Link
                    href="/politica-de-privacidade"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Política de Privacidade
                  </Link>{" "}
                  para mais informações.
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                >
                  Rejeitar
                </button>
                <button
                  onClick={handleAccept}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Aceitar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
