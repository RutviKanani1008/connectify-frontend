import {
  useDeleteApi,
  useGetApi,
  usePostApi,
  usePutApi,
} from '../../../hooks/useApi';

const APIS = {
  forms: '/forms',
  cloneForm: '/clone-form',
};

export const useGetCompanyForms = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCompanyForms = (query = {}) =>
    apiCall(`${APIS.forms}`, {
      params: query,
    });

  return { getCompanyForms, isLoading, isSuccess, isError };
};

export const useGetForm = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getForm = (id) =>
    apiCall(`${APIS.forms}/${id}`, {
      params: {},
    });

  return { getForm, isLoading, isSuccess, isError };
};

export const useCloneForm = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const cloneForm = (id, loadingMsg) =>
    apiCall(`${APIS.cloneForm}/${id}`, {}, loadingMsg);

  return { cloneForm, isLoading, isSuccess, isError };
};

export const useDeleteForm = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteForm = (id, loadingMsg) =>
    apiCall(`${APIS.forms}/${id}`, loadingMsg);

  return { deleteForm, isLoading, isSuccess, isError };
};

export const useUpdateForm = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateForm = (id, body, loadingMsg) =>
    apiCall(`${APIS.forms}/${id}`, body, loadingMsg);

  return { updateForm, isLoading, isSuccess, isError };
};

export const useUploadFormFile = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const uploadFormFile = (body) => {
    return apiCall(`/upload`, body);
  };

  return { uploadFormFile, isLoading, isSuccess, isError };
};
