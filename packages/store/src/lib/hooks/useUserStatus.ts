import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/active-user/active-user-slice';
import type { AvatarStatus } from '@inithium/types';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'pointerdown',
  'scroll',
  'touchstart',
];

export const useUserStatus = (): AvatarStatus => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      setIsIdle(false);
      return;
    }

    const resetTimer = () => {
      setIsIdle(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT_MS);
    };

    resetTimer();

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return 'offline';
  if (isIdle) return 'away';
  return 'online';
};