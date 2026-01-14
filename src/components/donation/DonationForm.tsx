"use client";

import { useState, useEffect, useRef } from "react";
import { createDonationCheckout } from "@/app/donativos/actions";
import { CheckoutInstance, CheckoutManifest } from "@easypaypt/checkout-sdk";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo } from "../ui/Logo";

type DonationType = "single" | "subscription";

interface DonationFormData {
  amount: number;
  type: DonationType;
  name: string;
  email: string;
  phone: string;
  durationYears: number;
}

export function DonationForm() {
  const [formData, setFormData] = useState<DonationFormData>({
    amount: 10,
    type: "single",
    name: "",
    email: "",
    phone: "",
    durationYears: 2,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutManifest, setCheckoutManifest] =
    useState<CheckoutManifest | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  // Use refs to track payment status (to avoid stale closures in callbacks)
  const paymentSuccessRef = useRef(false);
  const paymentInfoRef = useRef<any>(null);

  const predefinedAmounts = [5, 10, 25, 50, 100];
  const { push } = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Reset payment success when starting new payment
    setPaymentInfo(null);
    paymentSuccessRef.current = false;

    try {
      const manifest = await createDonationCheckout(formData);
      setCheckoutManifest(manifest);
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Erro ao iniciar o pagamento. Por favor, tente novamente.");
      setIsLoading(false);
    }
  };

  // Initialize Easypay Checkout when manifest is available
  useEffect(() => {
    if (
      checkoutManifest &&
      typeof window !== "undefined" &&
      window.easypayCheckout
    ) {
      setShowLoader(true);

      // Small delay to ensure DOM element is rendered
      const timer = setTimeout(() => {
        const checkoutElement = document.getElementById("easypay-checkout");
        if (checkoutElement) {
          const checkoutInstance: CheckoutInstance =
            window.easypayCheckout.startCheckout(checkoutManifest, {
              onSuccess: (successInfo: any) => {
                console.log("Payment successful:", successInfo);
                setPaymentInfo(successInfo);
                paymentInfoRef.current = successInfo;
                paymentSuccessRef.current = true;
              },
              onError: (error: any) => {
                console.error("Payment error:", error);
                checkoutInstance.unmount();
                alert("Erro no pagamento. Por favor, tente novamente.");
                setCheckoutManifest(null);
                setIsLoading(false);
                setShowLoader(true);
                setPaymentInfo(null);
                paymentInfoRef.current = null;
                paymentSuccessRef.current = false;
              },
              onClose: () => {
                console.log(
                  "Payment success status:",
                  paymentSuccessRef.current
                );
                if (paymentSuccessRef.current) {
                  console.log("Payment was successful, redirecting...");
                  const info = paymentInfoRef.current;
                  const payment = info?.payment;
                  // Create URL with search parameters
                  const params = new URLSearchParams({
                    amount: formData.amount.toString(),
                    type: formData.type,
                  });

                  // Check if it's a Multibanco payment (has entity and reference)
                  if (
                    payment?.method === "mb" &&
                    payment?.entity &&
                    payment?.reference
                  ) {
                    params.set("method", "mb");
                    params.set("entity", payment.entity);
                    params.set("reference", payment.reference);
                  } else if (payment?.id || info?.id) {
                    // Add payment_id for other payment methods
                    params.set("payment_id", payment?.id || info.id);
                  }

                  return push(`/donativos/sucesso?${params.toString()}`);
                }
                console.log("Checkout closed without success");
                setCheckoutManifest(null);
                setIsLoading(false);
                setShowLoader(true);
              },
              testing:
                process.env.NODE_ENV === "development" ||
                process.env.NEXT_PUBLIC_VERCEL_TARGET_ENV !== "production",
              language: "pt_PT",
              hideDetails: true,
              display: "inline",
            });
        } else {
          console.error("Easypay checkout element not found");
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [checkoutManifest, push]);

  // Check for iframe every second to hide loader
  useEffect(() => {
    if (!checkoutManifest) return;

    const checkForIframe = () => {
      const checkoutElement = document.getElementById("easypay-checkout");
      if (checkoutElement) {
        const iframe = checkoutElement.querySelector("iframe");
        if (iframe) {
          setShowLoader(false);
          return true;
        }
      }
      return false;
    };

    // Check immediately
    if (checkForIframe()) return;

    // Check every second
    const interval = setInterval(() => {
      if (checkForIframe()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [checkoutManifest]);

  const handleAmountChange = (amount: number) => {
    setFormData({ ...formData, amount });
  };

  const handleInputChange = (
    field: keyof DonationFormData,
    value: string | number
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  if (checkoutManifest) {
    return (
      <div className="bg-white rounded-lg shadow-md max-w-[400px] max-sm:mx-auto relative">
        <div
          id="easypay-checkout"
          className="min-h-[600px] flex justify-center p-0 min-w-[400px] z-10 relative"
        ></div>
        <Loader className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4 absolute top-4 left-1/2" />
        <div className="text-center my-4">
          <button
            onClick={() => {
              setCheckoutManifest(null);
              setIsLoading(false);
              setShowLoader(true);
              setPaymentInfo(null);
              paymentInfoRef.current = null;
              paymentSuccessRef.current = false;
            }}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            Cancelar e voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-[400px] max-md:mx-auto">
      <Logo className="w-[200px] mx-auto mb-4" />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Donation Type */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleInputChange("type", "single")}
              className={`p-4 border rounded-lg text-center transition-colors ${
                formData.type === "single"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="font-medium">Doação</div>
              <div className="text-sm text-gray-500">Doação pontual</div>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange("type", "subscription")}
              className={`p-4 border rounded-lg text-center transition-colors ${
                formData.type === "subscription"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="font-medium">Mensal</div>
              <div className="text-sm text-gray-500">Subscrição recorrente</div>
            </button>
          </div>

        </div>

        {/* Amount Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Valor {formData.type === "subscription" && "(por mês)"}
          </label>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {predefinedAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleAmountChange(amount)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.amount === amount
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {amount}€
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Outro valor:</span>
            <input
              type="number"
              min="1"
              step="1"
              value={formData.amount}
              onChange={(e) =>
                handleAmountChange(parseFloat(e.target.value) || 0)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
            <span className="text-gray-700">€</span>
          </div>

          {/* Subscription Duration */}
          {formData.type === "subscription" && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">
                  Renovar automaticamente durante:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.durationYears}
                  onChange={(e) =>
                    handleInputChange(
                      "durationYears",
                      Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-700">anos</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Pode cancelar a qualquer momento
              </p>
            </div>
          )}
        </div>

        {/* Personal Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="O seu nome"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Telefone
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+351 912 345 678"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            isLoading ||
            !formData.name ||
            !formData.email ||
            formData.amount <= 0
          }
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading
            ? "A processar..."
            : `Contribuir ${formData.amount}€ ${formData.type === "subscription" ? "por mês" : ""}`}
        </button>

        <p className="text-sm text-gray-500 text-center">
          O seu pagamento é processado de forma segura pela Easypay.
        </p>
      </form>
    </div>
  );
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    easypayCheckout: any;
  }
}
