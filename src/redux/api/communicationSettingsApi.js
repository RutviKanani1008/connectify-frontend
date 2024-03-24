import baseQueryApi from './baseQueryApi';

export const communicationSettingApi = baseQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommunicationSettings: builder.query({
      query: ({ params, ...rest } = {}) => ({
        url: '/communication-setting',
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
      providesTags: [{ type: 'COMMUNICATION_SETTINGS' }],
    }),
    updateCommunicationSetting: builder.mutation({
      query: ({ data, ...rest }) => ({
        url: '/communication-setting',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
      invalidatesTags: [{ type: 'COMMUNICATION_SETTINGS' }],
    }),
  }),
});

export const {
  useLazyGetCommunicationSettingsQuery,
  useUpdateCommunicationSettingMutation,
} = communicationSettingApi;
