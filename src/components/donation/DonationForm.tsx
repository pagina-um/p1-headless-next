"use client";

import { useState } from "react";
import { createDonationCheckout } from "@/app/donativos/actions";
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

  const predefinedAmounts = [5, 10, 25, 50, 100];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { url } = await createDonationCheckout(formData);
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Erro ao iniciar o pagamento. Por favor, tente novamente.");
      setIsLoading(false);
    }
  };

  const handleAmountChange = (amount: number) => {
    setFormData({ ...formData, amount });
  };

  const handleInputChange = (
    field: keyof DonationFormData,
    value: string | number
  ) => {
    setFormData({ ...formData, [field]: value });
  };

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
          O seu pagamento é processado de forma segura pela Stripe.
        </p>
      </form>
    </div>
  );
}
