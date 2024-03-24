import {
  useDeleteApi,
  useGetApi,
  usePostApi,
  usePutApi,
} from '../../../../hooks/useApi';

const APIS = {
  pages: '/pages',
  userGuide: '/user-guide',
};

export const useGetPages = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getPages = (query = {}) =>
    apiCall(`${APIS.pages}`, {
      params: query,
    });

  return { getPages, isLoading, isSuccess, isError };
};

export const usePostUserGuide = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();
  const addUserGuide = async (data) => {
    return apiCall(`${APIS.userGuide}`, data);
  };

  return { addUserGuide, isLoading, isSuccess, isError };
};

export const useUpdateuserGuide = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateUserGuide = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.userGuide}/${id}`, updateData, loadingMsg);

  return { updateUserGuide, isLoading, isSuccess, isError };
};

export const useGetUserGuide = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getUserGuide = (query = {}) =>
    apiCall(`${APIS.userGuide}`, {
      params: query,
    });

  return { getUserGuide, isLoading, isSuccess, isError };
};

export const useDeleteUserGuide = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteUserGuide = (id, loadingMsg) =>
    apiCall(`${APIS.userGuide}/${id}`, loadingMsg);

  return { deleteUserGuide, isLoading, isSuccess, isError };
};
