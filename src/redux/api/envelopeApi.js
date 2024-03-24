import baseQueryApi from './baseQueryApi';

export const envelopeApi = baseQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnvelopes: builder.query({
      query: ({ params, ...rest } = {}) => ({
        url: '/envelope',
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
      providesTags: [{ type: 'ENVELOPE' }],
    }),
    getEnvelope: builder.query({
      query: ({ id, params, ...rest } = {}) => ({
        url: `/envelope/${id}`,
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
      providesTags: [{ type: 'ENVELOPE' }],
    }),
    addEnvelope: builder.mutation({
      query: ({ data, ...rest }) => ({
        url: '/envelope',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
      invalidatesTags: [{ type: 'ENVELOPE' }],
    }),
    cloneEnvelope: builder.mutation({
      query: ({ id, data, ...rest }) => ({
        url: `/envelope-clone/${id}`,
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
      invalidatesTags: [{ type: 'ENVELOPE' }],
    }),
    updateEnvelope: builder.mutation({
      query: ({ id, data, ...rest }) => ({
        url: `/envelope/${id}`,
        method: 'PUT',
        data,
        extraOptions: { ...rest },
      }),
      invalidatesTags: [{ type: 'ENVELOPE' }],
    }),
    deleteEnvelope: builder.mutation({
      query: ({ id, data, ...rest }) => ({
        url: `/envelope/${id}`,
        method: 'DELETE',
        data,
        extraOptions: { ...rest },
      }),
      invalidatesTags: [{ type: 'ENVELOPE' }],
    }),
  }),
});

export const {
  useLazyGetEnvelopeQuery,
  useLazyGetEnvelopesQuery,
  useAddEnvelopeMutation,
  useUpdateEnvelopeMutation,
  useDeleteEnvelopeMutation,
  useCloneEnvelopeMutation,
} = envelopeApi;
