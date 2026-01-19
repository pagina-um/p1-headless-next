"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BankTransferModal() {
  const [copied, setCopied] = useState<string | null>(null);

  const bankDetails = {
    bank: "Banco Santander Totta",
    iban: "PT50 0018 0003 5564 8737 0201 1",
    accountHolder: "Página UM - Associação",
    bic: "TOTAPTPL",
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-blue-600 hover:text-blue-800 underline text-sm font-medium">
          Transferência bancária direta
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transferência Bancária</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Pode fazer uma transferência direta para a nossa conta bancária:
          </p>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                Titular
              </label>
              <p className="font-medium">{bankDetails.accountHolder}</p>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                Banco
              </label>
              <p className="font-medium">{bankDetails.bank}</p>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                IBAN
              </label>
              <div className="flex items-center gap-2">
                <p className="font-mono font-medium">{bankDetails.iban}</p>
                <button
                  onClick={() => copyToClipboard(bankDetails.iban, "iban")}
                  className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                >
                  {copied === "iban" ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                BIC/SWIFT
              </label>
              <div className="flex items-center gap-2">
                <p className="font-mono font-medium">{bankDetails.bic}</p>
                <button
                  onClick={() => copyToClipboard(bankDetails.bic, "bic")}
                  className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                >
                  {copied === "bic" ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 italic">
            Após a transferência, envie-nos um email para{" "}
            <a
              href="mailto:geral@paginaum.pt"
              className="text-blue-600 hover:underline"
            >
              geral@paginaum.pt
            </a>{" "}
            com o comprovativo para que possamos agradecer.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
