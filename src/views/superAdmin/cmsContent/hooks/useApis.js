import {
  useDeleteApi,
  useGetApi,
  usePostApi,
  usePutApi,
} from '../../../../hooks/useApi';

const APIS = {
  pages: '/pages',
  cmsContent: '/cms-content',
};

export const useGetPages = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getPages = (query = {}) =>
    apiCall(`${APIS.pages}`, {
      params: query,
    });

  return { getPages, isLoading, isSuccess, isError };
};

export const usePostCmsContent = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();
  const addCmsContent = async (data) => {
    return apiCall(`${APIS.cmsContent}`, data);
  };

  return { addCmsContent, isLoading, isSuccess, isError };
};

export const useUpdateCmsContent = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateCmsContent = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.cmsContent}/${id}`, updateData, loadingMsg);

  return { updateCmsContent, isLoading, isSuccess, isError };
};

export const useGetCmsContents = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCmsContent = (query = {}) =>
    apiCall(`${APIS.cmsContent}`, {
      params: query,
    });

  return { getCmsContent, isLoading, isSuccess, isError };
};

export const useDeleteCmsContent = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteCmsContent = (id, loadingMsg) =>
    apiCall(`${APIS.cmsContent}/${id}`, loadingMsg);

  return { deleteCmsContent, isLoading, isSuccess, isError };
};
