"use client";

import { useState } from "react";
import { deleteItemAction } from "@/app/actions";
import { Modal } from "@/components/modal";
import { SaleForm } from "@/components/sale-form";
import { StockAdjustmentForm } from "@/components/stock-adjustment-form";

type ItemActionsProps = {
  organizationId: string;
  itemId: string;
};

export function ItemActions({ organizationId, itemId }: ItemActionsProps) {
  const [stockOpen, setStockOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="inline-actions">
        <button className="button" onClick={() => setStockOpen(true)} type="button">
          Update Stock
        </button>
        <button className="button secondary" onClick={() => setSaleOpen(true)} type="button">
          Add a Sale
        </button>
        <button className="button danger" onClick={() => setDeleteOpen(true)} type="button">
          Delete Item
        </button>
      </div>

      <Modal onClose={() => setStockOpen(false)} open={stockOpen} title="Update Stock">
        <StockAdjustmentForm
          itemId={itemId}
          onSuccess={() => setStockOpen(false)}
          organizationId={organizationId}
        />
      </Modal>

      <Modal onClose={() => setSaleOpen(false)} open={saleOpen} title="Add a Sale">
        <SaleForm
          itemId={itemId}
          onSuccess={() => setSaleOpen(false)}
          organizationId={organizationId}
        />
      </Modal>

      <Modal onClose={() => setDeleteOpen(false)} open={deleteOpen} title="Delete Item">
        <form action={deleteItemAction} className="stack">
          <input name="organizationId" type="hidden" value={organizationId} />
          <input name="itemId" type="hidden" value={itemId} />
          <p className="muted">
            This permanently removes the item and its related sales and stock history.
          </p>
          <button className="button danger" type="submit">
            Yes, delete this item
          </button>
          <button className="ghost-button" onClick={() => setDeleteOpen(false)} type="button">
            Cancel
          </button>
        </form>
      </Modal>
    </>
  );
}
