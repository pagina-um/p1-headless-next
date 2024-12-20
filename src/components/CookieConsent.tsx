"use client";
import React, { useEffect, useState } from "react";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = localStorage.getItem("cookieConsent");
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
    // Here you would initialize your analytics/tracking scripts
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setIsVisible(false);
    // Here you would ensure no tracking cookies are set
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-gray-700">
              We use cookies to enhance your browsing experience, serve
              personalized content, and analyze our traffic. Please choose to
              accept or reject cookies. Read our{" "}
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Privacy Policy
              </a>{" "}
              for more information.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
            >
              Reject All
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
