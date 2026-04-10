"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addMultiSaleAction } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";

type MultiSaleFormProps = {
  organizationId: string;
  accountNames: string[];
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: string;
  }>;
  onSuccess: () => void;
};

const paymentMethods = ["Venmo", "Zelle", "Cash", "Other"] as const;

export function MultiSaleForm({
  organizationId,
  accountNames,
  items,
  onSuccess
}: MultiSaleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const selectedCount = useMemo(
    () =>
      Object.values(quantities).reduce(
        (sum, quantity) => sum + Math.max(0, Math.floor(Number(quantity) || 0)),
        0
      ),
    [quantities]
  );

  const liveTotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const quantity = Math.max(0, Math.floor(Number(quantities[item.id]) || 0));
        return sum + Number(item.price) * quantity;
      }, 0),
    [items, quantities]
  );

  function updateQuantity(itemId: string, nextValue: string) {
    if (nextValue === "") {
      setQuantities((current) => ({ ...current, [itemId]: "" }));
      return;
    }

    if (!/^\d+$/.test(nextValue)) {
      return;
    }

    setQuantities((current) => ({ ...current, [itemId]: nextValue }));
  }

  async function handleSubmit(formData: FormData) {
    const saleLines = items
      .map((item) => ({
        itemId: item.id,
        quantity: Math.max(0, Math.floor(Number(quantities[item.id]) || 0))
      }))
      .filter((line) => line.quantity > 0);

    formData.set("saleLines", JSON.stringify(saleLines));
    setError("");

    startTransition(async () => {
      const result = await addMultiSaleAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }

      setQuantities({});
      router.refresh();
      onSuccess();
    });
  }

  return (
    <form action={handleSubmit} className="stack">
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="saleLines" type="hidden" value="[]" />
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
          <input list={`multi-accounts-${organizationId}`} name="account" placeholder="Whose account received it?" />
          <datalist id={`multi-accounts-${organizationId}`}>
            {accountNames.map((accountName) => (
              <option key={accountName} value={accountName} />
            ))}
          </datalist>
        </>
      </label>
      <div className="stack">
        <strong>Select items</strong>
        <div className="multi-sale-list">
          {items.map((item) => (
            <div className="multi-sale-row" key={item.id}>
              <div className="stack" style={{ gap: "4px" }}>
                <strong>{item.title}</strong>
                <span className="muted">
                  In stock {item.quantity} · ${item.price}
                </span>
              </div>
              <input
                max={item.quantity}
                min="0"
                onChange={(event) => updateQuantity(item.id, event.target.value)}
                step="1"
                type="number"
                value={quantities[item.id] ?? ""}
              />
            </div>
          ))}
        </div>
      </div>
      <p className="muted">Total units selected: {selectedCount}</p>
      <p className="totalAmount">Total: {formatCurrency(liveTotal)}</p>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Recording..." : "Record combined sale"}
      </button>
    </form>
  );
}
