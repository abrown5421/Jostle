import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Text, Input, Button, Loader, Avatar, AvatarImage, AvatarFallback } from '@inithium/ui';
import {
  selectActiveUser,
  showAlert,
  useFindSessionByLobbyIdQuery,
  useJoinSessionMutation,
  useSessionQuery,
  useUpdateSessionMutation,
} from '@inithium/store';
import type { Session, BaseGameState, SessionPlayer } from '@inithium/types';

function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateSecret(): string {
  return Math.random().toString(36).slice(2, 10);
}

const JoinPage: React.FC = () => {
  const dispatch   = useDispatch();
  const [searchParams] = useSearchParams();
  const activeUser = useSelector(selectActiveUser);
  const isAuthenticated = Boolean(activeUser);

  const [lobbyCode, setLobbyCode]   = useState(searchParams.get('code') ?? '');
  const [displayName, setDisplayName] = useState(
    activeUser ? `${activeUser.first_name} ${activeUser.last_name}` : '',
  );
  const [secret, setSecret]           = useState('');
  const [isJoining, setIsJoining]     = useState(false);
  const [joinedSessionId, setJoinedSessionId] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId]   = useState<string | null>(null);
  const [isEditing, setIsEditing]     = useState(false);
  const [editName, setEditName]       = useState('');

  const [submittedCode, setSubmittedCode] = useState('');

  useEffect(() => {
    if (activeUser) setDisplayName(`${activeUser.first_name} ${activeUser.last_name}`);
  }, [activeUser]);

  const { data: targetSession } = useFindSessionByLobbyIdQuery(submittedCode, {
    skip: !submittedCode,
  }) as { data: Session<BaseGameState> | null | undefined };

  const [joinSession]   = useJoinSessionMutation();
  const [updateSession] = useUpdateSessionMutation();

  const { data: joinedSession } = useSessionQuery(joinedSessionId ?? '', {
    skip:            !joinedSessionId,
    pollingInterval: joinedSessionId ? 2000 : 0,
  }) as { data: Session<BaseGameState> | undefined };

  const myRecord = joinedSession?.players.find((p) => p.playerId === myPlayerId);

  const doJoin = useCallback(async (session: Session<BaseGameState>, name: string) => {
    setIsJoining(true);
    try {
      const playerId = isAuthenticated ? activeUser!._id : generatePlayerId();
      const player: SessionPlayer = {
        playerId,
        registeredUser: activeUser ?? undefined,
        displayName:    name,
        secret:         isAuthenticated ? undefined : (secret.trim() || generateSecret()),
        joinedAt:       new Date(),
        isHost:         false,
        isConnected:    true,
      };

      await joinSession({ sessionId: session._id, player }).unwrap();
      setMyPlayerId(playerId);
      setJoinedSessionId(session._id);
    } catch {
      dispatch(showAlert({
        message: 'Could not join the session. Please try again.',
        severity: 'danger',
        closeable: true,
        position: 'bottom-right',
        animation_object: { entry: 'fadeInRight', exit: 'fadeOutRight', entrySpeed: 'fast', exitSpeed: 'faster' },
      }));
    } finally {
      setIsJoining(false);
    }
  }, [activeUser, isAuthenticated, secret, joinSession, dispatch]);

  function nameConflicts(name: string, players: SessionPlayer[]): boolean {
    const normalized = name.trim().toLowerCase();
    return players.some((p) => p.displayName.trim().toLowerCase() === normalized);
  }

  const handleJoin = async () => {
    const trimmedName = displayName.trim();
    const trimmedCode = lobbyCode.trim().toUpperCase();

    if (!trimmedCode) {
      dispatch(showAlert({ message: 'Enter the lobby code before joining.', severity: 'warning', closeable: true, position: 'bottom-right', animation_object: { entry: 'fadeInRight', exit: 'fadeOutRight', entrySpeed: 'fast', exitSpeed: 'faster' } }));
      return;
    }
    if (!trimmedName) {
      dispatch(showAlert({ message: 'Enter a name before joining.', severity: 'warning', closeable: true, position: 'bottom-right', animation_object: { entry: 'fadeInRight', exit: 'fadeOutRight', entrySpeed: 'fast', exitSpeed: 'faster' } }));
      return;
    }

    if (submittedCode !== trimmedCode) {
      setSubmittedCode(trimmedCode);
      return;
    }

    if (!targetSession) {
      dispatch(showAlert({ message: 'No session found for that code. Check it and try again.', severity: 'danger', closeable: true, position: 'bottom-right', animation_object: { entry: 'fadeInRight', exit: 'fadeOutRight', entrySpeed: 'fast', exitSpeed: 'faster' } }));
      return;
    }

    if (nameConflicts(trimmedName, targetSession.players)) {
      dispatch(showAlert({
        message: `"${trimmedName}" is already taken in this session. Try adding a last initial — e.g. "${trimmedName} ${displayName.trim().split(' ').slice(-1)[0]?.[0] ?? 'X'}."`,
        severity: 'warning',
        closeable: true,
        position: 'bottom-right',
        animation_object: { entry: 'fadeInRight', exit: 'fadeOutRight', entrySpeed: 'fast', exitSpeed: 'faster' },
      }));
      return;
    }

    await doJoin(targetSession, trimmedName);
  };

  useEffect(() => {
    if (submittedCode && targetSession && !joinedSessionId && !isJoining) {
      const trimmedName = displayName.trim();
      if (nameConflicts(trimmedName, targetSession.players)) {
        dispatch(showAlert({
          message: `"${trimmedName}" is already taken in this session. Try adding a last initial.`,
          severity: 'warning',
          closeable: true,
          position: 'bottom-right',
          animation_object: { entry: 'fadeInRight', exit: 'fadeOutRight', entrySpeed: 'fast', exitSpeed: 'faster' },
        }));
        return;
      }
      doJoin(targetSession, trimmedName);
    }
  }, [targetSession]);

  const handleLeave = async () => {
    if (!joinedSession || !myPlayerId) return;
    try {
      const nextPlayers = joinedSession.players.filter((p) => p.playerId !== myPlayerId);
      await updateSession({
        id:   joinedSession._id,
        data: { players: nextPlayers },
      }).unwrap();
    } catch {
      dispatch(showAlert({
        message: 'Could not leave the session. Please try again.',
        severity: 'danger',
        closeable: true,
        position: 'bottom-right',
        animation_object: { entry: 'fadeInRight', exit: 'fadeOutRight', entrySpeed: 'fast', exitSpeed: 'faster' },
      }));
      return;
    }
    setJoinedSessionId(null);
    setMyPlayerId(null);
    setSubmittedCode('');
  };

  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed || !joinedSession || !myPlayerId) return;
    try {
      const nextPlayers = joinedSession.players.map((p) =>
        p.playerId === myPlayerId ? { ...p, displayName: trimmed } : p,
      );
      await updateSession({
        id:   joinedSession._id,
        data: { players: nextPlayers },
      }).unwrap();
      setDisplayName(trimmed);
      setIsEditing(false);
    } catch {
      dispatch(showAlert({
        message: 'Could not update your name. Please try again.',
        severity: 'danger',
        closeable: true,
        position: 'bottom-right',
        animation_object: { entry: 'fadeInRight', exit: 'fadeOutRight', entrySpeed: 'fast', exitSpeed: 'faster' },
      }));
    }
  };

  if (joinedSessionId) {
    const isStarting = joinedSession?.status === 'active';
    const avatarProps = activeUser?.user_avatar;
    const displayedName = myRecord?.displayName ?? displayName.trim();
    const initials = displayedName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <Box
        flex direction="col" justify="center" align="center"
        fullWidth fullHeight padding="md" className="gap-6"
      >
        <Avatar
          size="lg"
          shape={avatarProps?.shape ?? 'circle'}
          background={avatarProps?.background}
          fontColor={avatarProps?.fontColor}
        >
          <AvatarImage src={avatarProps?.src} alt={avatarProps?.alt ?? displayedName} />
          <AvatarFallback>{avatarProps?.fallback ?? initials}</AvatarFallback>
        </Avatar>

        {isEditing ? (
          <Box flex direction="col" align="center" className="gap-3 w-full max-w-xs">
            <Input
              label="Your name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
              size="lg"
            />
            <Box flex direction="row" className="gap-2 w-full">
              <Button color="primary" size="md" fullWidth onClick={handleSaveName}>
                Save
              </Button>
              <Button color="surface" variant="outline" size="md" fullWidth onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Box flex direction="col" align="center" className="gap-1">
            <Text overrideClassName="text-2xl font-bold">{displayedName}</Text>
            <Button
              color="surface" variant="ghost" size="sm"
              onClick={() => { setEditName(displayedName); setIsEditing(true); }}
            >
              Edit name
            </Button>
          </Box>
        )}

        {!isStarting && (
          <Box flex direction="col" align="center" className="gap-3">
            <Loader variant="dots" size="md" color="primary" />
            <Text overrideClassName="text-sm opacity-70">
              Waiting for the host to start the game…
            </Text>
          </Box>
        )}

        {isStarting && (
          <Text overrideClassName="text-sm opacity-70 animate-pulse">
            The game is starting…
          </Text>
        )}

        <Button
          color="danger" variant="ghost" size="sm"
          onClick={handleLeave}
        >
          Leave session
        </Button>
      </Box>
    );
  }

  return (
    <Box
      flex direction="col" justify="center" align="center"
      fullWidth fullHeight padding="md" className="gap-6"
    >
      <Box flex direction="col" align="center" className="gap-1">
        <Text overrideClassName="text-2xl font-bold">Join a session</Text>
        <Text overrideClassName="text-sm opacity-70">Enter the code from the host's screen</Text>
      </Box>

      <Box flex direction="col" className="gap-4 w-full max-w-sm">
        <Input
          label="Lobby code"
          value={lobbyCode}
          onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
          fullWidth size="lg"
        />
        <Input
          label="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth size="lg"
        />
        {!isAuthenticated && (
          <Input
            label="Secret (optional, to rejoin)"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            fullWidth size="lg"
          />
        )}
        <Button
          color="primary" size="lg" fullWidth
          disabled={isJoining}
          onClick={handleJoin}
        >
          {isJoining ? 'Joining…' : 'Join session'}
        </Button>
      </Box>
    </Box>
  );
};

export default JoinPage;