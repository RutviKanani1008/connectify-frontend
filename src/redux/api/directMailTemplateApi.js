import baseQueryApi from './baseQueryApi';

export const directMailTemplateApi = baseQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getDirectMailTemplates: builder.query({
      query: ({ params, ...rest } = {}) => ({
        url: '/direct-mail-template',
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
      providesTags: [{ type: 'DIRECT_MAIL_TEMPLATE' }],
    }),
    getDirectMailTemplate: builder.query({
      query: ({ id, params, ...rest } = {}) => ({
        url: `/direct-mail-template/${id}`,
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
      providesTags: [{ type: 'DIRECT_MAIL_TEMPLATE' }],
    }),
    addDirectMailTemplate: builder.mutation({
      query: ({ data, ...rest }) => ({
        url: '/direct-mail-template',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
      invalidatesTags: [{ type: 'DIRECT_MAIL_TEMPLATE' }],
    }),
    cloneDirectMailTemplate: builder.mutation({
      query: ({ id, data, ...rest }) => ({
        url: `/direct-mail-template-clone/${id}`,
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
      invalidatesTags: [{ type: 'DIRECT_MAIL_TEMPLATE' }],
    }),
    updateDirectMailTemplate: builder.mutation({
      query: ({ id, data, ...rest }) => ({
        url: `/direct-mail-template/${id}`,
        method: 'PUT',
        data,
        extraOptions: { ...rest },
      }),
      invalidatesTags: [{ type: 'DIRECT_MAIL_TEMPLATE' }],
    }),
    deleteDirectMailTemplate: builder.mutation({
      query: ({ id, data, ...rest }) => ({
        url: `/direct-mail-template/${id}`,
        method: 'DELETE',
        data,
        extraOptions: { ...rest },
      }),
      invalidatesTags: [{ type: 'DIRECT_MAIL_TEMPLATE' }],
    }),
  }),
});

export const {
  useLazyGetDirectMailTemplateQuery,
  useLazyGetDirectMailTemplatesQuery,
  useAddDirectMailTemplateMutation,
  useUpdateDirectMailTemplateMutation,
  useDeleteDirectMailTemplateMutation,
  useCloneDirectMailTemplateMutation,
} = directMailTemplateApi;
