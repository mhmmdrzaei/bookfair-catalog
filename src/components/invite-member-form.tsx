import { inviteMemberAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function InviteMemberForm({ organizationId }: { organizationId: string }) {
  return (
    <form action={inviteMemberAction} className="inline-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <label className="field grow">
        <span>Invite by email</span>
        <input name="email" placeholder="friend@example.com" required type="email" />
      </label>
      <SubmitButton pendingLabel="Sending...">Add user</SubmitButton>
    </form>
  );
}
