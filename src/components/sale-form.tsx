"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSaleAction } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";

type SaleFormProps = {
  organizationId: string;
  itemId: string;
  itemPrice: string;
  accountNames?: string[];
  onSuccess: () => void;
};

const paymentMethods = ["Venmo", "Zelle", "Cash", "Other"] as const;

export function SaleForm({
  organizationId,
  itemId,
  itemPrice,
  accountNames = [],
  onSuccess
}: SaleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [quantityInput, setQuantityInput] = useState("1");
  const [amountOverrideInput, setAmountOverrideInput] = useState("");

  const liveTotal = useMemo(() => {
    const quantity = Math.max(1, Math.floor(Number(quantityInput) || 1));
    const overrideAmount = amountOverrideInput ? Number(amountOverrideInput) : null;

    if (overrideAmount !== null && Number.isFinite(overrideAmount) && overrideAmount >= 0) {
      return overrideAmount;
    }

    return Number(itemPrice) * quantity;
  }, [amountOverrideInput, itemPrice, quantityInput]);

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
        <span>Payment Method</span>
        <select defaultValue="Venmo" name="paymentMethod">
          {paymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Person's Account</span>
        <>
          <input list={`accounts-${organizationId}`} name="account" placeholder="Whose account received it?" />
          <datalist id={`accounts-${organizationId}`}>
            {accountNames.map((accountName) => (
              <option key={accountName} value={accountName} />
            ))}
          </datalist>
        </>
      </label>
      <label className="field">
        <span>Amount override (discounts ect)</span>
        <input
          min="0"
          name="amountOverride"
          onChange={(event) => setAmountOverrideInput(event.target.value)}
          placeholder="Leave blank to use list price"
          step="0.01"
          type="number"
          value={amountOverrideInput}
        />
      </label>
      <label className="field">
        <span>Quantity</span>
        <input
          min="1"
          name="quantity"
          onChange={(event) => setQuantityInput(event.target.value)}
          required
          step="1"
          type="number"
          value={quantityInput}
        />
      </label>
      <p className="totalAmount">Total: {formatCurrency(liveTotal)}</p>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Saving sale..." : "Add sale"}
      </button>
    </form>
  );
}
