"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createItemAction } from "@/app/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function CreateItemForm({ organizationId }: { organizationId: string }) {
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
      formData.set("imagePath", "");
    }

    startTransition(async () => {
      const result = await createItemAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }

      router.refresh();
      const form = document.getElementById("create-item-form") as HTMLFormElement | null;
      form?.reset();
    });
  }

  return (
    <form action={handleSubmit} className="stack-lg" id="create-item-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="imagePath" type="hidden" />
      <div className="form-grid">
        <label className="field">
          <span>Title</span>
          <input name="title" placeholder="Signed first edition" required />
        </label>
        <label className="field">
          <span>Price</span>
          <input min="0" name="price" required step="0.01" type="number" />
        </label>
        <label className="field">
          <span>Quantity</span>
          <input min="0" name="quantity" required step="1" type="number" />
        </label>
        <label className="field">
          <span>Image</span>
          <input accept="image/*" name="image" type="file" />
        </label>
      </div>
      <label className="field">
        <span>Info</span>
        <textarea name="info" placeholder="Condition, edition notes, booth notes..." rows={4} />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Saving item..." : "Add item"}
      </button>
    </form>
  );
}
