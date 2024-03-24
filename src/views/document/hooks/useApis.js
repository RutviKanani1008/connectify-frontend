import { useDeleteApi, useGetApi, usePostApi } from '../../../hooks/useApi';

const APIS = {
  documents: '/documents',
  document: '/document',
  'documents-folder': '/documents-folder',
};

export const useGetCompanyDocuments = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCompanyDocuments = (query = {}) =>
    apiCall(`${APIS.documents}`, {
      params: query,
    });

  return { getCompanyDocuments, isLoading, isSuccess, isError };
};

export const useGetDocument = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getDocument = (id) => apiCall(`${APIS.document}/${id}`);

  return { getDocument, isLoading, isSuccess, isError };
};

export const useUpdateDocumentsFolder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const updateDocumentsFolder = (body, loadingMsg) =>
    apiCall(`${APIS['documents-folder']}`, body, loadingMsg);

  return { updateDocumentsFolder, isLoading, isSuccess, isError };
};

export const useDeleteDocumentsFolder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteDocumentsFolder = (folderId, loadingMsg) =>
    apiCall(`${APIS['documents-folder']}/${folderId}`, loadingMsg);

  return { deleteDocumentsFolder, isLoading, isSuccess, isError };
};
