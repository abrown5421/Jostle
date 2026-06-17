import { registerProfileTab } from './profile-tab-registry';
import { ProfileInfoEditTab } from './profile-info-edit/profile-info-edit';
import { ProfileSettingsEditTab } from './profile-settings-edit/profile-settings-edit';

registerProfileTab({
  id: 'profile-info-edit',
  label: 'Edit Profile',
  leadingIcon: 'Pencil',
  component: ProfileInfoEditTab,
  ownProfileOnly: true,
});

registerProfileTab({
  id: 'profile-settings-edit',
  label: 'Profile Settings',
  leadingIcon: 'Cog',
  component: ProfileSettingsEditTab,
  ownProfileOnly: true,
});