import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import { Box, Text, Button, Avatar, AvatarImage, AvatarFallback } from '@inithium/ui';
import {
  selectActiveUser,
  showAlert,
  useHostSessionMutation,
  useSessionQuery,
  useUpdateSessionMutation,
} from '@inithium/store';
import type { Session, BaseGameState, SessionPlayer } from '@inithium/types';
import { generateLobbyCode } from './generate-lobby-code';

const PLACEHOLDER_GAME_CONFIG = {
  gameId:   'placeholder-game-id',
  gameKey:  'placeholder-game-key',
  gameName: 'Placeholder Game',
  settings: [] as Session<BaseGameState>['config']['settings'],
};

const JOIN_BASE_URL =
  typeof window !== 'undefined' ? `${window.location.origin}/join` : '/join';

const SFX_URL = 'http://localhost:3000/api/assets/by-key/ce9985b3-54e9-455e-bb4e-2a7fb23a1fd1.mp3';
const LEAVE_SFX_URL = 'http://localhost:3000/api/assets/by-key/64150f57-86ad-4077-b708-0dfcab81563b.mp3';

const HostPage: React.FC = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const activeUser = useSelector(selectActiveUser);

  const { id: sessionIdParam } = useParams<{ id?: string }>();
  const [lobbyCode] = useState<string>(() => generateLobbyCode());
  const creatingRef = useRef(false);
  const prevPlayerCountRef = useRef<number | null>(null);

  const [hostSession]                               = useHostSessionMutation();
  const [updateSession, { isLoading: isStarting }] = useUpdateSessionMutation();

  const { data: session } = useSessionQuery(sessionIdParam ?? '', {
    skip:            !sessionIdParam,
    pollingInterval: sessionIdParam ? 2000 : 0,
  }) as { data: Session<BaseGameState> | undefined };

  useEffect(() => {
    if (!session?.players) return;
    const currentCount = session.players.length;
    if (prevPlayerCountRef.current !== null) {
      if (currentCount > prevPlayerCountRef.current) {
        new Audio(SFX_URL).play().catch(() => {});
      } else if (currentCount < prevPlayerCountRef.current) {
        new Audio(LEAVE_SFX_URL).play().catch(() => {});
      }
    }
    prevPlayerCountRef.current = currentCount;
  }, [session?.players]);

  useEffect(() => {
    if (sessionIdParam)      return;
    if (!activeUser)         return;
    if (creatingRef.current) return;

    creatingRef.current = true;

    hostSession({
      lobbyId:      lobbyCode,
      hostId:       activeUser._id,
      config:       PLACEHOLDER_GAME_CONFIG,
      players:      [],
      teams:        [],
      playerScores: [],
      teamScores:   [],
      gameState:    { game: PLACEHOLDER_GAME_CONFIG.gameKey, phase: 'lobby' },
      status:       'configuring' as const,
      startedAt:    null,
      completedAt:  null,
      winnerId:     null,
      winnerTeamId: null,
    })
      .unwrap()
      .then((created: Session<BaseGameState>) => {
        navigate(`/host/${created._id}`, { replace: true });
      })
      .catch(() => {
        creatingRef.current = false;
        dispatch(showAlert({
          message: 'Could not create the session. Please try again.',
          severity: 'danger',
          closeable: true,
          position: 'bottom-right',
          animation_object: { entry: 'fadeInRight', exit: 'fadeOutRight', entrySpeed: 'fast', exitSpeed: 'faster' },
        }));
      });
  }, [sessionIdParam, activeUser, lobbyCode, hostSession, navigate, dispatch]);

  const handleRemovePlayer = useCallback(async (playerId: string) => {
    if (!session) return;
    const nextPlayers = session.players.filter((p) => p.playerId !== playerId);
    try {
      await updateSession({
        id: session._id,
        data: { players: nextPlayers },
      }).unwrap();
    } catch {
      dispatch(showAlert({
        message: 'Could not remove player. Please try again.',
        severity: 'danger',
        closeable: true,
        position: 'bottom-right',
        animation_object: { entry: 'fadeInRight', exit: 'fadeOutRight', entrySpeed: 'fast', exitSpeed: 'faster' },
      }));
    }
  }, [session, updateSession, dispatch]);

  const handleStart = async () => {
    if (!session) return;
    const sortedPlayers = [...session.players].sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );
    try {
      await updateSession({
        id: session._id,
        data: {
          status:    'active',
          startedAt: new Date(),
          players:   sortedPlayers,
          gameState: { ...session.gameState, phase: 'playing' },
        },
      }).unwrap();
      navigate(`/play/${session._id}`);
    } catch {
      dispatch(showAlert({
        message: 'Could not start the session. Please try again.',
        severity: 'danger',
        closeable: true,
        position: 'bottom-right',
        animation_object: { entry: 'fadeInRight', exit: 'fadeOutRight', entrySpeed: 'fast', exitSpeed: 'faster' },
      }));
    }
  };

  const joinUrl       = useMemo(() => `${JOIN_BASE_URL}?code=${session?.lobbyId ?? ''}`, [session?.lobbyId]);
  const joinedPlayers = useMemo(() => session?.players ?? [], [session?.players]);

  return (
    <Box flex direction="row" fullWidth fullHeight padding="md" className="gap-6">
      <Box
        flex direction="col" justify="center" align="center"
        padding="xl" border borderRadius="lg" color="surface2"
        fullWidth className="gap-6"
      >
        <Box flex direction="col" align="center" className="gap-2">
          <Text overrideClassName="text-sm uppercase tracking-wide opacity-70">
            Join with code
          </Text>
          <Text overrideClassName="text-5xl font-bold tracking-[0.2em]">
            {session?.lobbyId ?? '…'}
          </Text>
        </Box>

        <Box padding="md" color="surface-contrast" borderRadius="md" className="inline-block">
          {session?.lobbyId
            ? <QRCodeSVG value={joinUrl} size={200} />
            : <Box className="w-[200px] h-[200px]" />}
        </Box>

        <Text overrideClassName="text-sm opacity-70">Scan to join from your phone</Text>
      </Box>

      <Box
        flex direction="col" padding="lg" border
        borderRadius="lg" color="surface2" fullWidth className="gap-4"
      >
        <Box flex direction="row" justify="between" align="center">
          <Text overrideClassName="text-lg font-semibold">
            Players ({joinedPlayers.length})
          </Text>
        </Box>

        <Box flex direction="col" className="gap-2 overflow-y-auto" fullHeight>
          {joinedPlayers.length === 0 && (
            <Text overrideClassName="opacity-60 text-sm">Waiting for players to join…</Text>
          )}

          {joinedPlayers.map((player: SessionPlayer) => {
            const avatarProps = player.registeredUser?.user_avatar;
            const initials = player.displayName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <Box
                key={player.playerId}
                flex direction="row" align="center" justify="between"
                padding="sm" borderRadius="md" color="surface3"
                className="gap-3"
              >
                <Button
                  icon="trash-2"
                  color="danger"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePlayer(player.playerId)}
                />

                <Avatar
                  size="sm"
                  shape={avatarProps?.shape ?? 'circle'}
                  background={avatarProps?.background}
                  fontColor={avatarProps?.fontColor}
                >
                  <AvatarImage src={avatarProps?.src} alt={avatarProps?.alt ?? player.displayName} />
                  <AvatarFallback>{avatarProps?.fallback ?? initials}</AvatarFallback>
                </Avatar>

                <Box flex direction="col" className="flex-1 min-w-0">
                  <Text overrideClassName="truncate">{player.displayName}</Text>
                  {!player.isConnected && (
                    <Text overrideClassName="text-xs uppercase text-danger">Disconnected</Text>
                  )}
                </Box>

                {player.isHost && (
                  <Text overrideClassName="text-xs uppercase opacity-60 shrink-0">Host</Text>
                )}
              </Box>
            );
          })}
        </Box>

        <Button
          color="primary" size="lg" fullWidth
          disabled={isStarting || !session}
          onClick={handleStart}
        >
          Let's go
        </Button>
      </Box>
    </Box>
  );
};

export default HostPage;