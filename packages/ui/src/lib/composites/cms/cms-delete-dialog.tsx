import React from 'react';
import { Dialog, Text } from '@inithium/ui';

export interface ConfirmDeleteDialogProps {
  open: boolean;
  label: string;
  onClose: () => void;
  onConfirm: (close: () => void) => void;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  label,
  onClose,
  onConfirm,
}) => {
  const actions = [
    {
      label: 'Cancel',
      variant: 'ghost' as const,
      color: 'secondary' as const,
      onClick: (close: () => void) => {
        close();
        onClose();
      },
    },
    {
      label: 'Delete Permanently',
      variant: 'solid' as const,
      color: 'danger' as const,
      leadingIcon: 'trash-2',
      onClick: onConfirm,
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Confirm Destructive Action"
      size="xl"
      variant="alert"
      backdrop={true}
      transition={true}
      actions={actions}
      actionsAlign="right"
    >
      <Text variant="body2" overrideClassName="text-slate-600">
        {label}
      </Text>
    </Dialog>
  );
};