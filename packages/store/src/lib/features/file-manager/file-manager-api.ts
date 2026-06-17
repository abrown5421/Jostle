// file-manager.api.ts
import { baseApi } from '../../base/base-api';

export type CreatePageDto = {
  slug: string;
  componentName: string;
};

export type CreatePageResponseDto = {
  message: string;
  slug: string;
};

export type DeletePageResponseDto = {
  message: string;
  slug: string;
};

export const fileManagerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPageFile: builder.mutation<CreatePageResponseDto, CreatePageDto>({
      query: (body) => ({ url: '/file-manager/pages', method: 'POST', body }),
    }),
    deletePageFile: builder.mutation<DeletePageResponseDto, string>({
      query: (slug) => ({ url: `/file-manager/pages/${slug}`, method: 'DELETE' }),
    }),
  }),
  overrideExisting: false,
});

export const useCreatePageFileMutation = fileManagerApi.endpoints.createPageFile.useMutation;
export const useDeletePageFileMutation = fileManagerApi.endpoints.deletePageFile.useMutation;