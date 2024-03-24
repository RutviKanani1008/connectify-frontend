import { useGetApi, usePostApi, usePutApi } from '../../../../hooks/useApi';

const APIS = {
  taskOption: '/task-option',
  deleteTaskOption: '/delete-task-option',
};

export const useGetTaskOptions = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTaskOptions = (query = {}) =>
    apiCall(`${APIS.taskOption}`, {
      params: query,
    });

  return { getTaskOptions, isLoading, isSuccess, isError };
};

export const useGetTaskOption = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTaskOption = (id) => apiCall(`${APIS.taskOption}/${id}`);

  return { getTaskOption, isLoading, isSuccess, isError };
};

export const useCreateTaskOption = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createTaskOption = (userData, loadingMsg) =>
    apiCall(`${APIS.taskOption}`, userData, loadingMsg);

  return { createTaskOption, isLoading, isSuccess, isError };
};

export const useUpdateTaskOption = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateTaskOption = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.taskOption}/${id}`, updateData, loadingMsg);

  return { updateTaskOption, isLoading, isSuccess, isError };
};

export const useDeleteTaskOption = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const deleteTaskOption = (id, userData, loadingMsg) =>
    apiCall(`${APIS.deleteTaskOption}/${id}`, userData, loadingMsg);

  return { deleteTaskOption, isLoading, isSuccess, isError };
};

export const useReOrderTaskOption = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const reOrderTaskOption = (data, loadingMsg, query = {}) => {
    apiCall('/task-option-reorder', data, loadingMsg, { params: query });
  };

  return { reOrderTaskOption, isLoading, isSuccess, isError };
};
