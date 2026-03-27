"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSaleAction } from "@/app/actions";

type SaleFormProps = {
  organizationId: string;
  itemId: string;
  onSuccess: () => void;
};

const paymentMethods = ["Venmo", "Zelle", "Cash", "Other"] as const;

export function SaleForm({ organizationId, itemId, onSuccess }: SaleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await addSaleAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }

      router.refresh();
      onSuccess();
    });
  }

  return (
    <form action={handleSubmit} className="stack">
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="itemId" type="hidden" value={itemId} />
      <label className="field">
        <span>Way of sale</span>
        <select defaultValue="Venmo" name="paymentMethod">
          {paymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Account</span>
        <input name="account" placeholder="Whose account received it?" />
      </label>
      <label className="field">
        <span>Amount override</span>
        <input min="0" name="amountOverride" placeholder="Leave blank to use list price" step="0.01" type="number" />
      </label>
      <label className="field">
        <span>Quantity</span>
        <input defaultValue={1} min="1" name="quantity" required step="1" type="number" />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Saving sale..." : "Add sale"}
      </button>
    </form>
  );
}
