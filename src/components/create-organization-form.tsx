import { createOrganizationAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function CreateOrganizationForm() {
  return (
    <form action={createOrganizationAction} className="stack">
      <label className="field">
        <span>Event name</span>
        <input name="name" placeholder="Spring Book Fair" required />
      </label>
      <SubmitButton pendingLabel="Creating event...">Create event</SubmitButton>
    </form>
  );
}
