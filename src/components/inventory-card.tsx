"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Modal } from "@/components/modal";
import { SaleForm } from "@/components/sale-form";
import { formatCurrency } from "@/lib/utils";

type InventoryCardProps = {
  organizationId: string;
  accountNames?: string[];
  item: {
    id: string;
    title: string;
    image_path: string | null;
    artist_payment: string;
    price: string;
    quantity: number;
  };
};

export function InventoryCard({ organizationId, accountNames = [], item }: InventoryCardProps) {
  const [saleOpen, setSaleOpen] = useState(false);

  return (
    <>
      <article className="item-card compact">
        <Link href={`/organizations/${organizationId}/items/${item.id}`}>
          {item.image_path ? (
            <Image
              alt={item.title}
              className="item-image"
              height={720}
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${item.image_path}`}
              width={960}
            />
          ) : (
            <div className="item-image" />
          )}
        </Link>

        <div className="item-card-body">
          <h3 className="item-title clamp-2">{item.title}</h3>
          <div className="item-meta compact">
            <span className="pill">{formatCurrency(item.price)}</span>
            <span className="muted">Qty: {item.quantity}</span>
          </div>
          {item.artist_payment ? (
            <span className="muted ">{item.artist_payment}</span>
          ) : null}
        </div>

        <div className="item-card-actions">
          <button className="button" onClick={() => setSaleOpen(true)} type="button">
            Record Sale
          </button>
          <Link className="ghost-button" href={`/organizations/${organizationId}/items/${item.id}`}>
            See Details
          </Link>
        </div>
      </article>

      <Modal onClose={() => setSaleOpen(false)} open={saleOpen} title={`Record Sale: ${item.title}`}>
        <SaleForm
          accountNames={accountNames}
          itemId={item.id}
          itemPrice={item.price}
          onSuccess={() => setSaleOpen(false)}
          organizationId={organizationId}
        />
      </Modal>
    </>
  );
}
