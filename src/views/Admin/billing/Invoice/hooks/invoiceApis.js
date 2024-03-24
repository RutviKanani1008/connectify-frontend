import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import {
  useGetApi,
  usePostApi,
  usePutApi,
  useDeleteApi,
} from '../../../../../hooks/useApi';

const APIS = {
  invoice: '/invoice',
};

export const useGetInvoices = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getInvoices = (query = {}) =>
    apiCall(`${APIS.invoice}`, {
      params: query,
    });

  return { getInvoices, isLoading, isSuccess, isError };
};

export const useGetInvoice = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getInvoice = (id, query = {}) =>
    apiCall(`${APIS.invoice}/${id}`, { params: query });

  return { getInvoice, isLoading, isSuccess, isError };
};

export const useCloneInvoice = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const cloneInvoice = (id, loadingMsg) =>
    apiCall(`${APIS.invoice}/clone/${id}`, null, loadingMsg);

  return { cloneInvoice, isLoading, isSuccess, isError };
};

export const useGetLatestInvoiceId = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getLatestInvoiceId = () => apiCall(`${APIS.invoice}/new-id`);

  return { getLatestInvoiceId, isLoading, isSuccess, isError };
};

export const useCreateInvoice = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createInvoice = async (invoiceData, loadingMsg) => {
    return apiCall(`${APIS.invoice}`, invoiceData, loadingMsg);
  };

  return { createInvoice, isLoading, isSuccess, isError };
};

export const useSendTestInvoice = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const sendTestInvoice = async (id, body, loadingMsg) => {
    return apiCall(`${APIS.invoice}/send-test-invoice/${id}`, body, loadingMsg);
  };
  return { sendTestInvoice, isLoading, isSuccess, isError };
};

export const useSendInvoice = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const sendInvoice = async (id, loadingMsg) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to send this invoice?',
    });
    if (result.value) {
      await apiCall(`${APIS.invoice}/send-invoice/${id}`, {}, loadingMsg);
    }
  };
  return { sendInvoice, isLoading, isSuccess, isError };
};

export const useUpdateInvoice = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateInvoice = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.invoice}/${id}`, updateData, loadingMsg);

  return { updateInvoice, isLoading, isSuccess, isError };
};

export const useUpdateInvoiceStatus = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateInvoiceStatus = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.invoice}/update-status/${id}`, updateData, loadingMsg);

  return { updateInvoiceStatus, isLoading, isSuccess, isError };
};

export const useDeleteInvoice = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteInvoice = (id, loadingMsg) =>
    apiCall(`${APIS.invoice}/${id}`, loadingMsg);

  return { deleteInvoice, isLoading, isSuccess, isError };
};
