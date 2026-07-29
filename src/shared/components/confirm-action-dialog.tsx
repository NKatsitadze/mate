'use client';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';

type ConfirmButtonVariant = 'default' | 'destructive' | 'outline';

type ConfirmActionDialogProps = {
  triggerLabel: string;
  triggerVariant?: ConfirmButtonVariant;
  triggerClassName?: string;
  title: string;
  description: string;
  confirmLabel: string;
  confirmingLabel: string;
  confirmVariant?: ConfirmButtonVariant;
  loading: boolean;
  onConfirm: () => Promise<void>;
};

export const ConfirmActionDialog = ({
  triggerLabel,
  triggerVariant = 'outline',
  triggerClassName,
  title,
  description,
  confirmLabel,
  confirmingLabel,
  confirmVariant = 'default',
  loading,
  onConfirm,
}: ConfirmActionDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm" className={triggerClassName}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm} disabled={loading}>
            {loading ? confirmingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
