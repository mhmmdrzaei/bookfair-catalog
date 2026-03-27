"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStockAction } from "@/app/actions";

type StockAdjustmentFormProps = {
  organizationId: string;
  itemId: string;
  onSuccess: () => void;
};

export function StockAdjustmentForm({
  organizationId,
  itemId,
  onSuccess
}: StockAdjustmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await updateStockAction(formData);
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
        <span>Stock change</span>
        <input
          name="delta"
          placeholder="Use positive or negative numbers"
          required
          step="1"
          type="number"
        />
      </label>
      <label className="field">
        <span>Note</span>
        <input name="note" placeholder="Restock, correction, damaged copy..." />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Updating..." : "Update stock"}
      </button>
    </form>
  );
}
