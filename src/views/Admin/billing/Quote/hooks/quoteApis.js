import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
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

  const getQuote = (id, query) =>
    apiCall(`${APIS.quote}/${id}`, { params: query });

  return { getQuote, isLoading, isSuccess, isError };
};

export const useCloneQuote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const cloneQuote = (id, loadingMsg) =>
    apiCall(`${APIS.quote}/clone/${id}`, null, loadingMsg);

  return { cloneQuote, isLoading, isSuccess, isError };
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

  const sendQuote = async (slug, loadingMsg) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to send this quote?',
    });
    if (result.value) {
      await apiCall(`${APIS.quote}/send/${slug}`, {}, loadingMsg);
    }
  };
  return { sendQuote, isLoading, isSuccess, isError };
};

export const useSendTestQuote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const sendTestQuote = async (slug, body, loadingMsg) => {
    return apiCall(`${APIS.quote}/send-test-quote/${slug}`, body, loadingMsg);
  };

  return { sendTestQuote, isLoading, isSuccess, isError };
};

export const useUpdateQuote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateQuote = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.quote}/${id}`, updateData, loadingMsg);

  return { updateQuote, isLoading, isSuccess, isError };
};

export const useUpdateQuoteStatus = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateQuoteStatus = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.quote}/update-status/${id}`, updateData, loadingMsg);

  return { updateQuoteStatus, isLoading, isSuccess, isError };
};

export const useDeleteQuote = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteQuote = (id, loadingMsg) =>
    apiCall(`${APIS.quote}/${id}`, loadingMsg);

  return { deleteQuote, isLoading, isSuccess, isError };
};
