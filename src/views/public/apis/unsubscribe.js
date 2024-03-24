import { usePostApi } from '../../../hooks/useApi';

export const useUnSubscribeAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const unSubscribeAPI = (data, loadingMsg, query = {}) =>
    apiCall(`/unsubscribe-contact`, data, loadingMsg, { params: query });

  return { unSubscribeAPI, isLoading, isSuccess, isError };
};
