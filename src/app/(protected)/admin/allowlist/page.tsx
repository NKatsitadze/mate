import { AddAllowedEmailForm } from '@/features/allowlist/components/add-allowed-email-form';
import { AllowedEmailsList } from '@/features/allowlist/components/allowed-emails-list';
import { listAllowedEmailsService } from '@/features/allowlist/service/allowlist.service';

export default async function AdminAllowlistPage() {
  const result = await listAllowedEmailsService(1, 100);
  const emails = 'error' in result.data ? [] : result.data.items;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin</p>
        <h1 className="mt-1 text-2xl font-bold">Allowlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">Only these emails can register a Mate account.</p>
      </div>
      <AddAllowedEmailForm />
      <AllowedEmailsList emails={emails} />
    </div>
  );
}
