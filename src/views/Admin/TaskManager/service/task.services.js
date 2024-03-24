import {
  useGetApi,
  useDeleteApi,
  usePostApi,
  usePutApi,
  usePatchApi,
} from '../../../../hooks/useApi';

const APIS = {
  tasks: '/tasks',
  'tasks-category': '/tasks-category',
  printTask: '/print-task-data',
};

export const useGetTasksList = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTaskList = (query = {}, signal = false) =>
    apiCall(`${APIS.tasks}-list`, {
      params: query,
      ...(signal && { signal }),
    });

  return { getTaskList, isLoading, isSuccess, isError };
};

export const useGetTasksOptionCount = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTaskOptionCount = (query = {}, signal = false) =>
    apiCall(`${APIS.tasks}-options-count`, {
      params: query,
      ...(signal && { signal }),
    });

  return { getTaskOptionCount, isLoading, isSuccess, isError };
};

export const useGetMultipleParentSubtask = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const getMultipleParentSubtask = (data, loadingMsg, query = {}) =>
    apiCall(`${APIS.tasks}/multiple-parent-subtask`, data, loadingMsg, {
      params: query,
    });

  return { getMultipleParentSubtask, isLoading, isSuccess, isError };
};

export const useGetTasksAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTasks = (query = {}) =>
    apiCall(`${APIS.tasks}`, {
      params: query,
    });

  return { getTasks, isLoading, isSuccess, isError };
};

export const useGetTaskByIdAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTaskByIdAPI = (id, config) => apiCall(`${APIS.tasks}/${id}`, config);

  return { getTaskByIdAPI, isLoading, isSuccess, isError };
};

export const useCreateTask = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createTask = (userData, loadingMsg, query = {}) =>
    apiCall(`${APIS.tasks}`, userData, loadingMsg, { params: query });

  return { createTask, isLoading, isSuccess, isError };
};

export const usePinTaskAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const pinTaskAPI = ({ id, data, loadingMsg, query = {} }) =>
    apiCall(`${APIS.tasks}/pin/${id}`, data, loadingMsg, { params: query });

  return { pinTaskAPI, isLoading, isSuccess, isError };
};

export const useSnoozeTaskAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const snoozeTaskAPI = ({ id, data, loadingMsg, query = {} }) =>
    apiCall(`${APIS.tasks}/snooze/${id}`, data, loadingMsg, { params: query });

  return { snoozeTaskAPI, isLoading, isSuccess, isError };
};

export const useCreateBulkTaskWithContact = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createBulkTaskWithContact = (userData, loadingMsg, query = {}) =>
    apiCall(`${APIS.tasks}-bulk-with-contact`, userData, loadingMsg, {
      params: query,
    });

  return { createBulkTaskWithContact, isLoading, isSuccess, isError };
};

export const useReOrderTask = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const reOrderTask = (data, loadingMsg, query = {}) => {
    apiCall('/tasks-reorder', data, loadingMsg, { params: query });
  };

  return { reOrderTask, isLoading, isSuccess, isError };
};

export const useUpdateTaskCategory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateTaskCategory = (id, data, loadingMsg, query = {}) => {
    return apiCall(`${APIS['tasks-category']}/${id}`, data, loadingMsg, {
      params: query,
    });
  };

  return { updateTaskCategory, isLoading, isSuccess, isError };
};

export const useUpdateTask = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateTask = (id, updateData, loadingMsg, query = {}, others = {}) =>
    apiCall(`${APIS.tasks}/${id}`, updateData, loadingMsg, {
      params: query,
      ...others,
    });

  return { updateTask, isLoading, isSuccess, isError };
};

export const useAutoSaveTaskDetails = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const autoSaveTaskDetails = (
    id,
    updateData,
    loadingMsg,
    query = {},
    others = {}
  ) =>
    apiCall(`${APIS.tasks}-autosave/${id}`, updateData, loadingMsg, {
      params: query,
      ...others,
    });

  return { autoSaveTaskDetails, isLoading, isSuccess, isError };
};

export const useSetCompleteStatusTaskAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const setCompleteStatusTaskAPI = (data, loadingMsg, query = {}) =>
    apiCall(`${APIS.tasks}/set-complete-status`, data, loadingMsg, {
      params: query,
    });

  return { setCompleteStatusTaskAPI, isLoading, isSuccess, isError };
};

export const useDeleteTask = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteTask = (id, loadingMsg) =>
    apiCall(`${APIS.tasks}/${id}`, loadingMsg);

  return { deleteTask, isLoading, isSuccess, isError };
};

export const useDeleteSnoozeTask = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteSnoozeTask = (id, loadingMsg) =>
    apiCall(`${APIS.tasks}/snooze/${id}`, loadingMsg);

  return { deleteSnoozeTask, isLoading, isSuccess, isError };
};

export const useUpdateTaskParent = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateTask = (id, updateData, loadingMsg, query = {}) =>
    apiCall(`${APIS.tasks}-parent/${id}`, updateData, loadingMsg, {
      params: query,
    });

  return { updateTask, isLoading, isSuccess, isError };
};

export const useCloneTask = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const cloneTask = (id, data, loadingMsg) =>
    apiCall(`${APIS.tasks}/clone/${id}`, data, loadingMsg);

  return { cloneTask, isLoading, isSuccess, isError };
};

export const usePrintTasks = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getPrintTask = (query) =>
    apiCall(`${APIS.printTask}`, {
      params: query,
    });

  return { getPrintTask, isLoading, isSuccess, isError };
};

export const useGetCalenderTasksList = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCalenderTaskList = (query = {}, signal = false) =>
    apiCall(`${APIS.tasks}-calendar-list`, {
      params: query,
      ...(signal && { signal }),
    });

  return { getCalenderTaskList, isLoading, isSuccess, isError };
};

export const useUpdateTaskTimerWarning = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePatchApi();

  const updateTaskTimerWarning = (id, query = {}, signal = false) =>
    apiCall(`${APIS.tasks}-warning/${id}`, {
      ...query,
      ...(signal && { signal }),
    });

  return { updateTaskTimerWarning, isLoading, isSuccess, isError };
};

export const useGetKanbanTasksList = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getKanbanTaskList = (query = {}, signal = false) =>
    apiCall(`${APIS.tasks}-kanban-list`, {
      params: query,
      ...(signal && { signal }),
    });
  return { getKanbanTaskList, isLoading, isSuccess, isError };
};

export const useGetUserTaskManagerSetting = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getUserTaskManagerSetting = (query = {}, signal = false) =>
    apiCall(`${APIS.tasks}-settings`, {
      params: query,
      ...(signal && { signal }),
    });
  return { getUserTaskManagerSetting, isLoading, isSuccess, isError };
};

export const useKanbanTaskReOrderTask = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const kanbanTaskReOrderTask = (data, loadingMsg, query = {}) => {
    apiCall('/kanban-tasks-reorder', data, loadingMsg, { params: query });
  };

  return { kanbanTaskReOrderTask, isLoading, isSuccess, isError };
};

export const useUpdateUserTaskManagerSetting = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const updateTaskManagerSetting = (data, loadingMsg) =>
    apiCall(`${APIS.tasks}-settings`, data, loadingMsg);

  return { updateTaskManagerSetting, isLoading, isSuccess, isError };
};
