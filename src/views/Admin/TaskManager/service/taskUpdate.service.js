import {
  useDeleteApi,
  useGetApi,
  usePostApi,
  usePutApi,
} from '../../../../hooks/useApi';

const APIS = {
  taskUpdate: '/task-update',
};

export const useGetTaskUpdates = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTaskUpdates = (query = {}) =>
    apiCall(`${APIS.taskUpdate}`, {
      params: query,
    });

  return { getTaskUpdates, isLoading, isSuccess, isError };
};

export const useGetTaskUpdate = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTaskUpdate = (id) => apiCall(`${APIS.taskUpdate}/${id}`);

  return { getTaskUpdate, isLoading, isSuccess, isError };
};

export const useCreateTaskUpdate = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createTaskUpdate = (data, loadingMsg, query = {}) =>
    apiCall(`${APIS.taskUpdate}`, data, loadingMsg, { params: query });

  return { createTaskUpdate, isLoading, isSuccess, isError };
};

export const useEditTaskUpdate = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const editTaskUpdate = (id, data, loadingMsg, query = {}) =>
    apiCall(`${APIS.taskUpdate}/${id}`, data, loadingMsg, { params: query });

  return { editTaskUpdate, isLoading, isSuccess, isError };
};

export const useDeleteTaskUpdate = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteTaskUpdate = (id, loadingMsg) =>
    apiCall(`${APIS.taskUpdate}/${id}`, loadingMsg);

  return { deleteTaskUpdate, isLoading, isSuccess, isError };
};
