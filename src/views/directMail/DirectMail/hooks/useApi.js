import {
  useDeleteApi,
  useGetApi,
  usePostApi,
  usePutApi,
} from '../../../../hooks/useApi';

const APIS = {
  directMailTemplate: '/direct-mail-template',
  directMail: '/direct-mail',
};
export const useGetDirectMailTemplate = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const directMailTemplate = ({ query = {} }) =>
    apiCall(`${APIS.directMailTemplate}/all`, {
      params: query,
    });

  return { directMailTemplate, isLoading, isSuccess, isError };
};

export const useGetSpecificDirectMailDetail = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const directMailDetail = ({ id, query = {} }) =>
    apiCall(`${APIS.directMail}/${id}`, {
      params: query,
    });

  return { directMailDetail, isLoading, isSuccess, isError };
};

export const useCreateDirectMail = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createDirectMail = async (invoiceData, loadingMsg) => {
    return apiCall(`${APIS.directMail}`, invoiceData, loadingMsg);
  };

  return { createDirectMail, isLoading, isSuccess, isError };
};

export const useUpdateDirectMail = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateDirectMail = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.directMail}/${id}`, updateData, loadingMsg);

  return { updateDirectMail, isLoading, isSuccess, isError };
};

export const useGetDirectMail = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getDirectMail = (query = {}) =>
    apiCall(`${APIS.directMail}`, {
      params: query,
    });

  return { getDirectMail, isLoading, isSuccess, isError };
};

export const useDeleteDirectMail = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteDirectMail = (id, loadingMsg) =>
    apiCall(`${APIS.directMail}/${id}`, loadingMsg);

  return { deleteDirectMail, isLoading, isSuccess, isError };
};

export const useGetSelectedContactsForDirectMailAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();
  const getDirectMailContactsAPI = (id, config) => {
    return apiCall(`/direct-mail/${id}/contacts`, config);
  };
  return { getDirectMailContactsAPI, isLoading, isSuccess, isError };
};

export const useSendDirectMailViaLobAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const sendDirectMailViaLobAPI = async ({
    id,
    data = {},
    loadingMsg = '',
  }) => {
    return apiCall(`/send-direct-mail-via-lob/${id}`, data, loadingMsg);
  };

  return { sendDirectMailViaLobAPI, isLoading, isSuccess, isError };
};
