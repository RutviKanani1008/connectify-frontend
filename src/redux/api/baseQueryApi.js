import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/axios-config';

const baseQueryApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: [
    'MAIL',
    'COMMUNICATION_SETTINGS',
    'DIRECT_MAIL_TEMPLATE',
    'ENVELOPE',
    'AFTER_TASK_INSTRUCTION_TEMPLATE',
  ],
  endpoints: () => ({}),
  keepUnusedDataFor: 10000,
});

export default baseQueryApi;
