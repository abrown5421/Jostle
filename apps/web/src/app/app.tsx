import { TransitionRouter, NavigationLink, useNavigation } from '@inithium/router';
import { Box, Navbar, Text, Loader, Alert, useDarkMode, Footer } from '@inithium/ui';
import React, { useEffect, useMemo } from 'react';
import {
  useReadAllPagesQuery,
  selectActiveUser,
  useAuthBootstrap,
  useLogoutMutation,
  hideAlert,
  clearAlert,
  RootState,
  useReadAllSettingsQuery,
  selectAllSettings,
} from '@inithium/store';
import { useSelector, useDispatch } from 'react-redux';
import type { Page } from '@inithium/types';
import { FontLoader } from '@inithium/ui';

const App: React.FC = () => {
  useAuthBootstrap();
  useReadAllSettingsQuery();
  const dispatch = useDispatch();

  const { data, isLoading, error } = useReadAllPagesQuery();
  useReadAllSettingsQuery();

  const activeUser = useSelector(selectActiveUser);
  const settings = useSelector(selectAllSettings);
  const alertData = useSelector((state: RootState) => state.alert.current);
  
  useDarkMode(activeUser?.dark_mode);
  
  const [logout] = useLogoutMutation();
  const { navigateToKey } = useNavigation();

  useEffect(() => console.log(activeUser), [activeUser]);
  
  useEffect(() => {
    if (settings.length > 0) {
      console.log('Global Settings Root Log:', settings);
    }
  }, [settings]);

  const mainNavPages = useMemo<Page[]>(() => {
    if (!data) return [];
    return [...data]
      .filter((page) => page.navigation?.location === 'main')
      .filter((page) => activeUser ? !page.navigation?.anonymous : !page.navigation?.authenticated)
      .sort((a, b) => (a.navigation?.order ?? 0) - (b.navigation?.order ?? 0));
  }, [data, activeUser]);

  const profileNavPages = useMemo<Page[]>(() => {
    if (!data) return [];
    return [...data]
      .filter((page) => page.navigation?.location === 'profile')
      .sort((a, b) => (a.navigation?.order ?? 0) - (b.navigation?.order ?? 0));
  }, [data, activeUser]);

  const footerNavPages = useMemo<Page[]>(() => {
    if (!data) return [];
    return [...data]
      .filter((page) => page.navigation?.location === 'main')
      .filter((page) => activeUser ? !page.navigation?.anonymous : !page.navigation?.authenticated)
      .filter((page) => !page.navigation?.isButton)
      .sort((a, b) => (a.navigation?.order ?? 0) - (b.navigation?.order ?? 0));
  }, [data, activeUser]);

  const footerSecondaryPages = useMemo<Page[]>(() => {
    if (!data) return [];
    return [...data]
      .filter((page) => page.navigation?.location === 'footer')
      .sort((a, b) => (a.navigation?.order ?? 0) - (b.navigation?.order ?? 0));
  }, [data]);

  const renderLink = (page: Page, className?: string) => {
    const params = activeUser?._id ? { id: activeUser._id } : undefined;
    return (
      <NavigationLink pageKey={page.key} params={params} className={className}>
        {page.navigation!.label}
      </NavigationLink>
    );
  };

  const handleLogout = async () => {
    await logout();
    navigateToKey('login');
  };

  return (
    <Box color="surface4-contrast" className="h-screen w-screen relative">
      <FontLoader />
      {alertData && (
        <Alert
          alertData={alertData}
          onDismiss={() => dispatch(hideAlert())}
          onExited={() => dispatch(clearAlert())}
        />
      )}

      {isLoading ? (
        <Box flex justify="center" align="center" className="h-full w-full">
          <Loader variant="spinner" size="lg" color="primary" />
        </Box>
      ) : error ? (
        <Box flex justify="center" align="center" className="h-full w-full">
          <Text color="danger">Error</Text>
        </Box>
      ) : (
        <Box>
          <Navbar
            pages={mainNavPages}
            profilePages={profileNavPages}
            activeUser={activeUser}
            renderLink={renderLink}
            onLogout={handleLogout}
          />
          <TransitionRouter />
          <Footer
            pages={footerNavPages}
            footerPages={footerSecondaryPages}
            renderLink={renderLink}
          />
        </Box>
      )}
    </Box>
  );
};

export default App;