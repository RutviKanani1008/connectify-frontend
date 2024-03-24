import {
  useDeleteApi,
  useGetApi,
  usePostApi,
  usePutApi,
} from '../../../../hooks/useApi';

export const TASK_TIMER_STATUS = {
  start: 'start',
  end: 'end',
  pause: 'pause',
};

const APIS = {
  tasksTimer: '/task-timer',
  taskTimerHistory: '/task-timer-history',
  taskTimerReport: '/task-timer-report',
};

export const useGetTaskTimer = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTaskTimer = (query = {}) =>
    apiCall(`${APIS.tasksTimer}`, {
      params: query,
    });

  return { getTaskTimer, isLoading, isSuccess, isError };
};

export const useGetTaskTimerHistory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTaskTimerHistory = (query = {}) =>
    apiCall(`${APIS.tasksTimer}-details`, {
      params: query,
    });

  return { getTaskTimerHistory, isLoading, isSuccess, isError };
};

export const useUpdateTaskTimer = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateTaskTimer = (id, userData, loadingMsg, query = {}) =>
    apiCall(`${APIS.tasksTimer}/${id}`, userData, loadingMsg, {
      params: query,
    });

  return { updateTaskTimer, isLoading, isSuccess, isError };
};

export const useCreateTaskTimer = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createTaskTimer = (userData, loadingMsg, query = {}) =>
    apiCall(`${APIS.tasksTimer}`, userData, loadingMsg, { params: query });

  return { createTaskTimer, isLoading, isSuccess, isError };
};

export const useCreateTaskTimerHistory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createTaskTimerHistory = (data, loadingMsg, query = {}) =>
    apiCall(`${APIS.taskTimerHistory}`, data, loadingMsg, {
      params: query,
    });

  return { createTaskTimerHistory, isLoading, isSuccess, isError };
};

export const useUpdateTaskTimerHistory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateTaskTimerHistory = (id, data, loadingMsg, query = {}) =>
    apiCall(`${APIS.taskTimerHistory}/${id}`, data, loadingMsg, {
      params: query,
    });

  return { updateTaskTimerHistory, isLoading, isSuccess, isError };
};

export const useDeleteTaskTimer = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteTaskTimer = (id, loadingMsg, query = {}) =>
    apiCall(`${APIS.tasksTimer}/${id}`, loadingMsg, {
      params: query,
    });

  return { deleteTaskTimer, isLoading, isSuccess, isError };
};

export const useExportTaskTimerDataAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const exportTaskTimerDataAPI = (query = {}) =>
    apiCall('/export-task-timer-data', {
      params: query,
    });

  return { exportTaskTimerDataAPI, isLoading, isSuccess, isError };
};

export const useGetLatestTaskTimerDataAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getLatestTaskTimerDataAPI = (query = {}) =>
    apiCall(`${APIS.tasksTimer}-latest`, {
      params: query,
    });

  return { getLatestTaskTimerDataAPI, isLoading, isSuccess, isError };
};

export const useTaskTimerReport = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const taskTimerReport = (data, loadingMsg, query = {}) =>
    apiCall(`${APIS.taskTimerReport}`, data, loadingMsg, {
      params: query,
    });

  return { taskTimerReport, isLoading, isSuccess, isError };
};
