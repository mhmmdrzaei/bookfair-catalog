"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordAccountTransferAction } from "@/app/actions";

type AccountTransferFormProps = {
  organizationId: string;
  accountNames: string[];
  onSuccess: () => void;
};

const paymentMethods = ["Venmo", "Zelle", "Cash", "Other"] as const;

export function AccountTransferForm({
  organizationId,
  accountNames,
  onSuccess
}: AccountTransferFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await recordAccountTransferAction(formData);
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
      <label className="field">
        <span>From account</span>
        <>
          <input list={`from-accounts-${organizationId}`} name="fromAccount" required />
          <datalist id={`from-accounts-${organizationId}`}>
            {accountNames.map((accountName) => (
              <option key={accountName} value={accountName} />
            ))}
          </datalist>
        </>
      </label>
      <label className="field">
        <span>To account</span>
        <>
          <input list={`to-accounts-${organizationId}`} name="toAccount" required />
          <datalist id={`to-accounts-${organizationId}`}>
            {accountNames.map((accountName) => (
              <option key={accountName} value={accountName} />
            ))}
          </datalist>
        </>
      </label>
      <label className="field">
        <span>Amount</span>
        <input min="0.01" name="amount" required step="0.01" type="number" />
      </label>
      <label className="field">
        <span>Payment method</span>
        <select defaultValue="Venmo" name="paymentMethod">
          {paymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Note</span>
        <input name="note" placeholder="Reason for the reconciliation" />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="button secondary" disabled={isPending} type="submit">
        {isPending ? "Recording..." : "Record transfer"}
      </button>
    </form>
  );
}
