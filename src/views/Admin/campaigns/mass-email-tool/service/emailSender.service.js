import {
  useDeleteApi,
  useGetApi,
  usePostApi,
  usePutApi,
} from '../../../../../hooks/useApi';

const APIS = {
  emailSender: '/email-sender',
  emailResend: '/email-resend-verify',
  emailSenderStatus: '/email-sender-status',
};

export const useGetEmailSenderAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getEmailSenderAPI = (query = {}) =>
    apiCall(`${APIS.emailSender}`, {
      params: query,
    });

  return { getEmailSenderAPI, isLoading, isSuccess, isError };
};

export const useAddEmailSenderAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const addEmailSenderAPI = (userData, loadingMsg) =>
    apiCall(`${APIS.emailSender}`, userData, loadingMsg);

  return { addEmailSenderAPI, isLoading, isSuccess, isError };
};

export const useReSendEmailSenderAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const reSendEmailSenderAPI = (userData, loadingMsg) =>
    apiCall(`${APIS.emailResend}`, userData, loadingMsg);

  return { reSendEmailSenderAPI, isLoading, isSuccess, isError };
};

export const useUpdateEmailSenderAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateEmailSenderAPI = (data, loadingMsg) =>
    apiCall(`${APIS.emailSender}/verify`, data, loadingMsg);

  return { updateEmailSenderAPI, isLoading, isSuccess, isError };
};

export const useDeleteEmailSender = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteEmailSenderAPI = (id, loadingMsg) =>
    apiCall(`${APIS.emailSender}/${id}`, loadingMsg);

  return { deleteEmailSenderAPI, isLoading, isSuccess, isError };
};

export const useUpdateEmailSenderStatus = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateEmailSenderStatus = (id, data, loadingMsg) =>
    apiCall(`${APIS.emailSenderStatus}/${id}`, data, loadingMsg);

  return { updateEmailSenderStatus, isLoading, isSuccess, isError };
};
