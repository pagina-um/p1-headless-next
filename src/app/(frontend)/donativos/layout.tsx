import Script from "next/script";

export default function ContribuirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Load Easypay Checkout SDK */}
      <Script
        src="https://cdn.easypay.pt/checkout/2.6.1/"
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}
