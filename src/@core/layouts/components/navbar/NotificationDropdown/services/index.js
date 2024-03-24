import {
  useDeleteApi,
  useGetApi,
  usePutApi,
} from '../../../../../../hooks/useApi';

export const useGetUserNotificationsAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getUserNotificationsAPI = (query = {}) =>
    apiCall('/user-notifications', {
      params: query,
    });

  return { getUserNotificationsAPI, isLoading, isSuccess, isError };
};

export const useGetUserNotificationsCountAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getUserNotificationsCountAPI = (query = {}) =>
    apiCall('/user-notifications-count', {
      params: query,
    });

  return { getUserNotificationsCountAPI, isLoading, isSuccess, isError };
};

export const useDeleteUserNotificationsAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteUserNotificationsAPI = (id, loadingMsg) =>
    apiCall(`/delete-user-notifications/${id}`, loadingMsg);

  return { deleteUserNotificationsAPI, isLoading, isSuccess, isError };
};

export const useUpdateUserNotificationsReadStatusAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateUserNotificationsReadStatusAPI = (updateData, loadingMsg) =>
    apiCall(`/update-user-notifications-read-status`, updateData, loadingMsg);

  return {
    updateUserNotificationsReadStatusAPI,
    isLoading,
    isSuccess,
    isError,
  };
};
