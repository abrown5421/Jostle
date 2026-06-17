import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { clearActiveUser } from '../features/active-user/active-user-slice';

const getLoginPath = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env['VITE_LOGIN_PATH'] ?? '/auth/login';
  }
  return '/auth/login';
};

const getApiBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const origin = import.meta.env['VITE_API_ORIGIN'] || import.meta.env['VITE_PUBLIC_API_URL'];
    return origin ? `${origin}/api` : 'http://localhost:3000/api';
  }
  return 'http://localhost:3000/api';
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl:     getApiBaseUrl(),
  credentials: 'include',
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await rawBaseQuery(
      {
        url:         '/auth/refresh',
        method:      'POST',
        credentials: 'include',
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearActiveUser());
      window.location.href = getLoginPath();
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'inithiumApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['User', 'Page', 'Asset', 'Auth', 'Setting'],
  endpoints:   () => ({}),
});