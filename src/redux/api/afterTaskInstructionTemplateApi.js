import baseQueryApi from './baseQueryApi';

export const afterTaskInstructionTemplateApi = baseQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getAfterTaskInstructionTemplate: builder.query({
      query: ({ params, ...rest } = {}) => ({
        url: '/after-task-instruction-template',
        method: 'GET',
        params,
        extraOptions: { ...rest },
      }),
      providesTags: [{ type: 'AFTER_TASK_INSTRUCTION_TEMPLATE' }],
    }),
  }),
});

export const { useLazyGetAfterTaskInstructionTemplateQuery } =
  afterTaskInstructionTemplateApi;
