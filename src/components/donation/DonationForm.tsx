"use client";

import { useState } from "react";
import { createDonationCheckout } from "@/app/donativos/actions";
import { Logo } from "../ui/Logo";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { cn } from "@/lib/utils";

type DonationType = "single" | "subscription";

interface DonationFormData {
  amount: number;
  type: DonationType;
  name: string;
  email: string;
  phone: string;
}

export function DonationForm() {
  const [formData, setFormData] = useState<DonationFormData>({
    amount: 10,
    type: "single",
    name: "",
    email: "",
    phone: "",
  });
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const predefinedAmounts = [5, 10, 25, 50, 100];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { url } = await createDonationCheckout(formData);
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao iniciar o pagamento. Por favor, tente novamente.";
      alert(message);
      setIsLoading(false);
    }
  };

  const handlePredefinedAmount = (amount: number) => {
    setFormData({ ...formData, amount });
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    // Allow only numbers
    const sanitized = value.replace(/[^0-9]/g, "");
    setCustomAmount(sanitized);
    const parsed = parseInt(sanitized, 10);
    if (parsed > 0) {
      setFormData({ ...formData, amount: parsed });
    } else if (sanitized === "") {
      setFormData({ ...formData, amount: 0 });
    }
  };

  const handleInputChange = (
    field: keyof DonationFormData,
    value: string | number
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const isCustomAmount = !predefinedAmounts.includes(formData.amount);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-[400px] max-md:mx-auto">
      <Logo className="w-[200px] mx-auto mb-6" />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Donation Type */}
        <div className="space-y-2">
          <Label>Tipo de contributo</Label>
          <ToggleGroup
            type="single"
            value={formData.type}
            onValueChange={(value) => {
              if (value) handleInputChange("type", value as DonationType);
            }}
            className="grid grid-cols-2 gap-2"
          >
            <ToggleGroupItem
              value="single"
              className={cn(
                "flex-col h-auto py-3 px-4 border data-[state=on]:border-blue-500 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-700"
              )}
            >
              <span className="font-medium">Donativo</span>
              <span className="text-xs text-slate-500">Pontual</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="subscription"
              className={cn(
                "flex-col h-auto py-3 px-4 border data-[state=on]:border-blue-500 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-700"
              )}
            >
              <span className="font-medium">Mensal</span>
              <span className="text-xs text-slate-500">Recorrente</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Amount Selection */}
        <div className="space-y-3">
          <Label>
            Valor {formData.type === "subscription" && "(por mês)"}
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {predefinedAmounts.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant={formData.amount === amount && !isCustomAmount ? "default" : "outline"}
                onClick={() => handlePredefinedAmount(amount)}
                className={cn(
                  "h-12",
                  formData.amount === amount && !isCustomAmount && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {amount}€
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="custom-amount" className="whitespace-nowrap text-sm">
              Outro:
            </Label>
            <div className="relative flex-1">
              <Input
                id="custom-amount"
                type="text"
                inputMode="numeric"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="0"
                className={cn(
                  "pr-8",
                  isCustomAmount && customAmount && "border-blue-500 ring-1 ring-blue-500"
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                €
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="O seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+351 912 345 678"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={
            isLoading ||
            !formData.name ||
            !formData.email ||
            formData.amount <= 0
          }
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base"
        >
          {isLoading
            ? "A processar..."
            : `Contribuir ${formData.amount}€${formData.type === "subscription" ? "/mês" : ""}`}
        </Button>

        <p className="text-sm text-slate-500 text-center">
          Pagamento seguro processado pela Stripe.
        </p>
      </form>
    </div>
  );
}
