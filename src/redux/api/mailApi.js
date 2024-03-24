import baseQueryApi from './baseQueryApi';

export const mailApi = baseQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    connectSmtpImap: builder.mutation({
      query: ({ data, ...rest }) => ({
        url: '/smtp-imap/connect',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
    }),
    updateSmtpImap: builder.mutation({
      query: ({ userName, data, ...rest }) => ({
        url: `/smtp-imap/update/${userName}`,
        method: 'PUT',
        data,
        extraOptions: { ...rest },
      }),
    }),
    getConnectedSmtpAccounts: builder.query({
      query: ({ params, ...rest } = {}) => ({
        url: '/smtp-imap/connected-accounts',
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
      // providesTags: [{ type: 'MAIL', id: 'connected-accounts' }],
    }),
    getConnectedSmtpAccountByService: builder.query({
      query: ({ userName, params, ...rest } = {}) => ({
        url: `/smtp-imap/connected-accounts/${userName}`,
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
    }),
    removeSmtpImapCredential: builder.mutation({
      query: ({ params, ...rest }) => ({
        url: '/smtp-imap/remove-account',
        method: 'DELETE',
        params,
        extraOptions: { ...rest },
      }),
      invalidatesTags: (_result, error) => {
        return error ? [] : [{ type: 'MAIL' }];
      },
    }),
    refreshMail: builder.mutation({
      query: ({ data, ...rest }) => ({
        url: '/smtp-imap/refresh',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
      invalidatesTags: (_result, error) => {
        return error ? [] : [{ type: 'MAIL' }];
      },
    }),
    getIsMailSyncing: builder.query({
      query: ({ params, ...rest } = {}) => ({
        url: '/smtp-imap/is-mail-syncing',
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
    }),
    getMails: builder.query({
      query: ({ params, ...rest }) => ({
        url: '/emails',
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
      providesTags: (arg1, arg2, queryArgs) => {
        return [{ type: 'MAIL', id: queryArgs?.params?.folder }];
      },
    }),
    getMailsCount: builder.query({
      query: ({ params, ...rest }) => ({
        url: '/emails/count',
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
    }),
    getMailThread: builder.query({
      query: ({ params, ...rest }) => ({
        url: '/email',
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
    }),
    getMailThreadById: builder.query({
      query: ({ threadId, params, ...rest }) => ({
        url: `/email/thread/${threadId}`,
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
    }),
    getNextPrevMailService: builder.query({
      query: ({ params, ...rest }) => ({
        url: '/email/next-prev-mail',
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
    }),
    sendMail: builder.mutation({
      query: ({ data, ...rest }) => ({
        url: '/email/send',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
      // invalidatesTags: (_result, error) => {
      //   return error ? [] : [{ type: 'MAIL' }];
      // },
    }),
    replyMail: builder.mutation({
      query: ({ data, ...rest }) => ({
        url: '/email/reply',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
      // invalidatesTags: (_result, error) => {
      //   return error ? [] : [{ type: 'MAIL' }];
      // },
    }),
    forwardMail: builder.mutation({
      query: ({ data, ...rest }) => ({
        url: '/email/forward',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
      // invalidatesTags: (_result, error) => {
      //   return error ? [] : [{ type: 'MAIL' }];
      // },
    }),
    markReadUnread: builder.mutation({
      query: ({ data, ...rest }) => ({
        url: '/email/mark-read-unread',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
      // invalidatesTags: (_result, error) => {
      //   return error ? [] : [{ type: 'MAIL' }];
      // },
    }),
    markStarredUStarred: builder.mutation({
      query: ({ data, ...rest }) => ({
        url: '/email/mark-starred-un-starred',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
      // invalidatesTags: (_result, error) => {
      //   return error ? [] : [{ type: 'MAIL' }];
      // },
    }),
    mailMoveIntoSpecificFolder: builder.mutation({
      query: ({ data, ...rest }) => ({
        url: '/email/mail-move-into-specific-folder',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
      // invalidatesTags: (_result, error) => {
      //   return error ? [] : [{ type: 'MAIL' }];
      // },
    }),
    uploadAttachment: builder.mutation({
      query: ({ data, ...rest }) => ({
        url: '/email/attachment-upload',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
    }),
    getContactFromMail: builder.query({
      query: ({ data, ...rest }) => ({
        url: '/email/get-contact-from-email',
        method: 'POST',
        data,
        extraOptions: { ...rest },
      }),
    }),
  }),
});

export const {
  useConnectSmtpImapMutation,
  useUpdateSmtpImapMutation,
  useLazyGetConnectedSmtpAccountsQuery,
  useLazyGetConnectedSmtpAccountByServiceQuery,
  useRemoveSmtpImapCredentialMutation,
  useRefreshMailMutation,
  useLazyGetIsMailSyncingQuery,
  useGetMailsQuery,
  useLazyGetMailsQuery,
  useLazyGetMailsCountQuery,
  useGetMailThreadQuery,
  useLazyGetNextPrevMailServiceQuery,
  useSendMailMutation,
  useReplyMailMutation,
  useForwardMailMutation,
  useMarkReadUnreadMutation,
  useMarkStarredUStarredMutation,
  useMailMoveIntoSpecificFolderMutation,
  useUploadAttachmentMutation,
  useLazyGetMailThreadByIdQuery,
  useLazyGetContactFromMailQuery,
} = mailApi;
