import { AllowedEmail } from '@/features/allowlist/types/allowlist.types';
import { Card, CardContent } from '@/shared/components/ui/card';

type AllowedEmailsListProps = {
  emails: AllowedEmail[];
};

export const AllowedEmailsList = ({ emails }: AllowedEmailsListProps) => {
  if (emails.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No emails allowed yet.</p>;
  }

  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {emails.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-sm font-medium">{entry.email}</p>
              {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
