"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateItemAction } from "@/app/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type EditItemFormProps = {
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
  onSuccess: () => void;
};

export function EditItemForm({ organizationId, item, onSuccess }: EditItemFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");

    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      const supabase = createSupabaseBrowserClient();
      const fileExt = file.name.split(".").pop() ?? "jpg";
      const fileName = `${organizationId}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      formData.set("imagePath", fileName);
    } else {
      formData.set("imagePath", item.image_path ?? "");
    }

    startTransition(async () => {
      const result = await updateItemAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }

      router.refresh();
      onSuccess();
    });
  }

  return (
    <form action={handleSubmit} className="stack-lg">
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="itemId" type="hidden" value={item.id} />
      <input name="imagePath" type="hidden" />
      <input name="oldImagePath" type="hidden" value={item.image_path ?? ""} />
      <div className="form-grid">
        <label className="field">
          <span>Title</span>
          <input defaultValue={item.title} name="title" required />
        </label>
        <label className="field">
          <span>Price</span>
          <input defaultValue={item.price} min="0" name="price" required step="0.01" type="number" />
        </label>
        <label className="field">
          <span>Quantity</span>
          <input defaultValue={item.quantity} min="0" name="quantity" required step="1" type="number" />
        </label>
        <label className="field">
          <span>Replace Image</span>
          <input accept="image/*" name="image" type="file" />
        </label>
      </div>
      <label className="field">
        <span>Info</span>
        <textarea defaultValue={item.info} name="info" rows={4} />
      </label>
      <label className="field">
        <span>Artist Payment</span>
        <input defaultValue={item.artist_payment} name="artistPayment" />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Saving changes..." : "Save changes"}
      </button>
    </form>
  );
}
