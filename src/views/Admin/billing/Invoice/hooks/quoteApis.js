import {
  useGetApi,
  usePostApi,
  usePutApi,
  useDeleteApi,
} from '../../../../../hooks/useApi';

const APIS = {
  quote: '/quotes',
};

export const useGetQuotes = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getQuotes = (query = {}) =>
    apiCall(`${APIS.quote}`, {
      params: query,
    });

  return { getQuotes, isLoading, isSuccess, isError };
};

export const useGetQuote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getQuote = (id) => apiCall(`${APIS.quote}/${id}`);

  return { getQuote, isLoading, isSuccess, isError };
};

export const useGetLatestQuoteId = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getLatestQuoteId = () => apiCall(`${APIS.quote}/new-id`);

  return { getLatestQuoteId, isLoading, isSuccess, isError };
};

export const useCreateQuote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createQuote = async (quoteData, loadingMsg) => {
    return apiCall(`${APIS.quote}`, quoteData, loadingMsg);
  };

  return { createQuote, isLoading, isSuccess, isError };
};

export const useSendQuote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const sendQuote = async (id, loadingMsg) => {
    return apiCall(`${APIS.quote}/send/${id}`, {}, loadingMsg);
  };
  return { sendQuote, isLoading, isSuccess, isError };
};

export const useUpdateQuote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateQuote = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.quote}/${id}`, updateData, loadingMsg);

  return { updateQuote, isLoading, isSuccess, isError };
};

export const useDeleteQuote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteQuote = (id, loadingMsg) =>
    apiCall(`${APIS.quote}/${id}`, loadingMsg);

  return { deleteQuote, isLoading, isSuccess, isError };
};
