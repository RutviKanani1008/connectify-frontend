import { useGetApi, usePostApi } from './useApi';

export const useExportDataAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const exportDataAPI = (query = {}) =>
    apiCall('/export-data', {
      params: query,
    });

  return { exportDataAPI, isLoading, isSuccess, isError };
};

export const useExportTaskDataAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const exportDataAPI = (data) => apiCall('/export-task-data', data);

  return { exportDataAPI, isLoading, isSuccess, isError };
};

export const useUpdatePositionAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const updatePositionAPI = (data) => apiCall('/change-position', data);

  return { updatePositionAPI, isLoading, isSuccess, isError };
};
