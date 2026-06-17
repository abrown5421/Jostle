import React from 'react';
import { Tabs } from '@inithium/ui';
import { getProfileTabs } from './profile-tab-registry';
import { User } from '@inithium/types';

interface ProfileTabsProps {
  profileUser: any;
  isOwnProfile: boolean;
  activeUser: User | null;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ profileUser, isOwnProfile, activeUser }) => {
  const tabs = getProfileTabs().filter(
    tab => !tab.ownProfileOnly || isOwnProfile
  );

  if (tabs.length === 0) return null;

  return (
    <Tabs variant="enclosed" size="md" color="primary" className="w-full h-full">
      <Tabs.List>
        {tabs.map(tab => (
          <Tabs.Tab key={tab.id} leadingIcon={tab.leadingIcon}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <Tabs.Panels>
        {tabs.map(tab => (
          <Tabs.Panel key={tab.id}>
            <tab.component profileUser={profileUser} isOwnProfile={isOwnProfile} activeUser={activeUser} />
          </Tabs.Panel>
        ))}
      </Tabs.Panels>
    </Tabs>
  );
};