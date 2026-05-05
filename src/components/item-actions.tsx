"use client";

import { useState } from "react";
import { deleteItemAction } from "@/app/actions";
import { EditItemForm } from "@/components/edit-item-form";
import { Modal } from "@/components/modal";
import { SaleForm } from "@/components/sale-form";
import { StockAdjustmentForm } from "@/components/stock-adjustment-form";

type ItemActionsProps = {
  organizationId: string;
  item: {
    id: string;
    title: string;
    image_path: string | null;
    info: string;
    artist_payment: string;
    price: string;
    quantity: number;
  };
  accountNames?: string[];
};

export function ItemActions({
  organizationId,
  item,
  accountNames = []
}: ItemActionsProps) {
  const itemId = item.id;
  const [stockOpen, setStockOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="inline-actions">
        <button className="ghost-button" onClick={() => setEditOpen(true)} type="button">
          Edit Item
        </button>
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

      <Modal onClose={() => setEditOpen(false)} open={editOpen} title="Edit Item">
        <EditItemForm item={item} onSuccess={() => setEditOpen(false)} organizationId={organizationId} />
      </Modal>

      <Modal onClose={() => setSaleOpen(false)} open={saleOpen} title="Add a Sale">
        <SaleForm
          accountNames={accountNames}
          itemId={itemId}
          itemPrice={item.price}
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
