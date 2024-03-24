import {
  useGetApi,
  useDeleteApi,
  usePostApi,
  usePutApi,
} from '../../../../hooks/useApi';

const APIS = {
  users: '/users',
  companyUsers: '/users/company',
  allCompanyUsers: '/users/company/all',
  permission: '/permissions',
  userNotificationSetting: '/user-notification-setting',
};

export const useGetUsers = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getUsers = (query = {}) =>
    apiCall(`${APIS.users}`, {
      params: query,
    });

  return { getUsers, isLoading, isSuccess, isError };
};

export const useGetPermission = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getPermission = (query = {}) =>
    apiCall(`${APIS.permission}`, {
      params: query,
    });

  return { getPermission, isLoading, isSuccess, isError };
};

export const useGetPaginatedCompanyUsers = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCompanyUsers = (id, query = {}) =>
    apiCall(`${APIS.companyUsers}/${id}`, {
      params: query,
    });

  return { getCompanyUsers, isLoading, isSuccess, isError };
};

export const useGetCompanyUsers = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCompanyUsers = (id, query = {}) =>
    apiCall(`${APIS.allCompanyUsers}/${id}`, {
      params: query,
    });

  return { getCompanyUsers, isLoading, isSuccess, isError };
};

export const useGetUser = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getUser = (id) => apiCall(`${APIS.users}/${id}`);

  return { getUser, isLoading, isSuccess, isError };
};

export const useCreateUser = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createUser = (userData, loadingMsg) =>
    apiCall(`${APIS.users}`, userData, loadingMsg);

  return { createUser, isLoading, isSuccess, isError };
};

export const useUpdateUser = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateUser = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.users}/${id}`, updateData, loadingMsg);

  return { updateUser, isLoading, isSuccess, isError };
};

export const useDeleteUser = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteUser = (id, loadingMsg) =>
    apiCall(`${APIS.users}/${id}`, loadingMsg);

  return { deleteUser, isLoading, isSuccess, isError };
};

export const useGetUserNotificationSettings = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getUserNotificationSettings = (id, query = {}) =>
    apiCall(`${APIS.userNotificationSetting}/${id}`, {
      params: query,
    });

  return { getUserNotificationSettings, isLoading, isSuccess, isError };
};

export const useUpdateUserNotificationSettings = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateNotificationSettings = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.userNotificationSetting}/${id}`, updateData, loadingMsg);

  return { updateNotificationSettings, isLoading, isSuccess, isError };
};
