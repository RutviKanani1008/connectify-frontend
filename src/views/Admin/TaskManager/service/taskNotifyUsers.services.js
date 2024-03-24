import { useGetApi, usePostApi } from '../../../../hooks/useApi';

const APIS = {
  taskNotifyUsers: '/task-notify-users',
};

export const useCreateTaskNotifyUsers = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const notifyUsers = (data, loadingMsg, query = {}) =>
    apiCall(`${APIS.taskNotifyUsers}`, data, loadingMsg, { params: query });

  return { notifyUsers, isLoading, isSuccess, isError };
};

export const useGetUnreadUsersTasks = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getUnreadTasks = (userId, query = {}) =>
    apiCall(`${APIS.taskNotifyUsers}/${userId}`, { params: query });

  return { getUnreadTasks, isLoading, isSuccess, isError };
};

export const useDeleteReadTasks = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const removeReadTasks = (userId, data) =>
    apiCall(`${APIS.taskNotifyUsers}/${userId}`, data);

  return { removeReadTasks, isLoading, isSuccess, isError };
};

export const useCheckUnreadStatus = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const checkUnreadStatus = (data, query = {}) =>
    apiCall(`${APIS.taskNotifyUsers}/checkUnread`, data, undefined, {
      params: query,
    });

  return { checkUnreadStatus, isLoading, isSuccess, isError };
};
