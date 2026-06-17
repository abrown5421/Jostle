import React, { useEffect, useMemo } from 'react';
import { AnimationController, AlertPosition } from '@inithium/types';
import { ManagedAlertProps } from './alert.types';
import { Box } from '../box/box';
import { Button } from '../button/button';

const positionStyles: Record<AlertPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
};

export const Alert: React.FC<ManagedAlertProps> = ({ alertData, onDismiss, onExited }) => {
  const controller: AnimationController = useMemo(() => ({
    phase: 'idle',
    triggerEnter: () => {},
    triggerExit: () => Promise.resolve(),
  }), []);

  const mergedAnimation = useMemo(() => ({
    ...alertData.animation_object,
    controller,
  }), [alertData.animation_object, controller]);

  // Handle Redux state driven exit transition triggering
  useEffect(() => {
    if (!alertData.open) {
      const fallback = setTimeout(onExited, 400);
      controller.triggerExit().then(() => {
        clearTimeout(fallback);
        onExited();
      });
      return () => clearTimeout(fallback);
    }
  }, [alertData.open, controller, onExited]);

  // Unified auto-close timer rule: all alerts close after 3s
  useEffect(() => {
    if (!alertData.open) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, [alertData.open, onDismiss]);

  return (
    <div 
      className={`fixed z-50 w-full max-w-md transition-all duration-300 ${
        alertData.open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      } ${positionStyles[alertData.position ?? 'bottom-right']}`}
    >
      <Box
        color={alertData.severity}
        animation={mergedAnimation}
        flex
        align="center"
        justify="between"
        padding="md"
        borderRadius="md"
        border
        fullWidth
      >
        <span>{alertData.message}</span>
        {alertData.closeable && (
          <Button
            color={alertData.severity}
            variant="ghost"
            size="sm"
            icon="x"
            onClick={onDismiss}
            className="ml-4 flex-shrink-0"
          />
        )}
      </Box>
    </div>
  );
};