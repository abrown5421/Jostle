import React from 'react';
import { Box } from '../../components';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';
import { UserSlotProps } from './navbar.types';
import { useUserStatus } from '@inithium/store';

const UserSlot: React.FC<UserSlotProps> = ({ activeUser, onAvatarClick }) => {
  const status = useUserStatus();

  const renderAvatar = (avatar: NonNullable<NonNullable<typeof activeUser>['user_avatar']>) => (
    <Avatar
      src={avatar.src}
      alt={avatar.alt}
      fallback={avatar.fallback}
      size={avatar.size}
      status={status}
      shape={avatar.shape}
      background={avatar.background}
      fontColor={avatar.fontColor}
      onClick={onAvatarClick}
    >
      {avatar.src && <AvatarImage src={avatar.src} alt={avatar.alt} />}
      <AvatarFallback>{avatar.fallback || '??'}</AvatarFallback>
    </Avatar>
  );

  if (!activeUser || !activeUser.user_avatar) {
    return (
      <Box flex align="center" padding="sm" className="h-[56px] w-full">
        <Avatar size="md" shape="circle" status={status} onClick={onAvatarClick}>
          <AvatarFallback>??</AvatarFallback>
        </Avatar>
      </Box>
    );
  }

  return (
    <Box flex align="center" padding="sm" className="h-[56px] w-full">
      {renderAvatar(activeUser.user_avatar)}
    </Box>
  );
};

export default UserSlot;