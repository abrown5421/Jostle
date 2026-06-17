import { selectSettingByKey } from '@inithium/store';
import { Box, Text } from '@inithium/ui';
import {
  Mail,
  Phone,
  MapPin,
  Cake,
  type LucideIcon,
} from 'lucide-react';
import { useSelector } from 'react-redux';

const formatDob = (dob?: string): string =>
  dob
    ? new Date(dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

const formatAddress = (address?: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}): string =>
  address
    ? [
        address.street,
        address.city,
        address.state && address.zip ? `${address.state} ${address.zip}` : address.state || address.zip,
        address.country,
      ].filter(Boolean).join(', ')
    : '';

interface InfoRowProps {
  icon: LucideIcon;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, value }) => (
  <Box flex direction="row" className="items-start gap-2.5 py-1.5">
    <Icon
      size={14}
      className="mt-0.5 shrink-0 text-secondary"
      strokeWidth={2}
    />
    <Text variant="body" color="surface-contrast" overrideClassName="text-sm leading-snug break-all">
      {value}
    </Text>
  </Box>
);

interface SectionProps {
  children: React.ReactNode;
}

const InfoGroup: React.FC<SectionProps> = ({ children }) => (
  <Box flex direction="col" className="gap-0.5 py-3 first:pt-0 last:pb-0 last:border-none border-b border-slate-300">
    {children}
  </Box>
);

interface ProfileInfoSectionProps {
  profileUser: any;
}

export const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({ profileUser }) => {
  if (!profileUser) return null;

  const showAddress = useSelector(selectSettingByKey('profile-info-address'))?.value ?? true;
  const showPhone   = useSelector(selectSettingByKey('profile-info-phone'))?.value ?? true;
  const showDob     = useSelector(selectSettingByKey('profile-info-dob'))?.value ?? true;
  const showBio     = useSelector(selectSettingByKey('profile-info-bio'))?.value ?? true;

  const address = showAddress ? formatAddress(profileUser.address) : '';
  const dob     = showDob     ? formatDob(profileUser.dob)         : '';

  const hasContact = profileUser.email || (showPhone && profileUser.phone_number);
  const hasPersonal = dob || address;

  if (!hasContact && !hasPersonal && !(showBio && profileUser.bio) && !profileUser.role) return null;

  return (
    <Box flex direction="col" className="mt-1">
      {showBio && profileUser.bio && (
        <Box className="py-3 border-b border-t border-slate-300">
          <Text variant="body" color="surface-contrast" overrideClassName="text-sm leading-relaxed">
            {profileUser.bio}
          </Text>
        </Box>
      )}

      {hasContact && (
        <InfoGroup>
          {profileUser.email && <InfoRow icon={Mail} value={profileUser.email} />}
          {showPhone && profileUser.phone_number && <InfoRow icon={Phone} value={profileUser.phone_number} />}
        </InfoGroup>
      )}

      {hasPersonal && (
        <InfoGroup>
          {dob     && <InfoRow icon={Cake}   value={dob}     />}
          {address && <InfoRow icon={MapPin} value={address} />}
        </InfoGroup>
      )}
    </Box>
  );
};