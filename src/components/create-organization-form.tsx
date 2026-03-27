import { createOrganizationAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function CreateOrganizationForm() {
  return (
    <form action={createOrganizationAction} className="stack">
      <label className="field">
        <span>Organization name</span>
        <input name="name" placeholder="Rare Finds Collective" required />
      </label>
      <SubmitButton pendingLabel="Creating organization...">Create organization</SubmitButton>
    </form>
  );
}
