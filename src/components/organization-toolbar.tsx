"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { AccountTransferForm } from "@/components/account-transfer-form";
import { MultiSaleForm } from "@/components/multi-sale-form";

type OrganizationToolbarProps = {
  organizationId: string;
  accountNames: string[];
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: string;
  }>;
};

export function OrganizationToolbar({
  organizationId,
  accountNames,
  items
}: OrganizationToolbarProps) {
  const [multiSaleOpen, setMultiSaleOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  return (
    <>
      <div className="inventory-toolbar">
        <button className="button" onClick={() => setMultiSaleOpen(true)} type="button">
          Multi Sell
        </button>
        <button className="button secondary" onClick={() => setTransferOpen(true)} type="button">
          Account Reconcile
        </button>
        <a className="ghost-button" href={`/organizations/${organizationId}/export`}>
          Export CSV
        </a>
      </div>

      <Modal onClose={() => setMultiSaleOpen(false)} open={multiSaleOpen} title="Record Combined Sale">
        <MultiSaleForm
          accountNames={accountNames}
          items={items}
          onSuccess={() => setMultiSaleOpen(false)}
          organizationId={organizationId}
        />
      </Modal>

      <Modal onClose={() => setTransferOpen(false)} open={transferOpen} title="Record Account Transfer">
        <AccountTransferForm
          accountNames={accountNames}
          onSuccess={() => setTransferOpen(false)}
          organizationId={organizationId}
        />
      </Modal>
    </>
  );
}
