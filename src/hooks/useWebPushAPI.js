import { useDeleteApi, usePostApi } from './useApi';

export const useAddWebPushSubscribeAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const addWebPushSubscribeAPI = (data) => apiCall('/web-push/subscribe', data);

  return { addWebPushSubscribeAPI, isLoading, isSuccess, isError };
};

export const useDeleteWebPushSubscribe = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteWebPushSubscribe = () => apiCall(`/web-push`);

  return { deleteWebPushSubscribe, isLoading, isSuccess, isError };
};
