import { useGetApi, usePatchApi, usePostApi } from '../hooks/useApi';
import { axiosGet, axiosPost, axiosPut } from './axios-config';

const APIS = {
  login: '/auth/login',
  logout: '/auth/logout',
  'virtual-login': '/auth/virtual-login',
  register: '/auth/register',
  company: '/company',
  user: '/user',
  'user-details': '/user-details',
  'user-auth': '/auth/user',
  'loggedin-user': '/loggedin-user',
  'forgot-password': '/auth/forgot-password',
  'reset-password': '/auth/reset-password',
  upload: '/upload',
  'send-verification': '/auth/send-verification',
  'check-verification': '/auth/check-verification',
  removeAttachment: '/remove-attachment',
};

export const useLoginUser = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();
  const login = (data) => apiCall(APIS.login, data);
  return { login, isLoading, isSuccess, isError };
};

export const useLogoutUserAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();
  const logoutAPI = (data) => apiCall(APIS.logout, data);
  return { logoutAPI, isLoading, isSuccess, isError };
};

export const useVirtualLogin = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const virtualLogin = async (id) => {
    return apiCall(`${APIS['virtual-login']}/${id}`);
  };

  return { virtualLogin, isLoading, isSuccess, isError };
};

export const useVirtualUserLogin = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const virtualUserLogin = async (id) => {
    return apiCall(`${APIS['virtual-login']}/user/${id}`);
  };

  return { virtualUserLogin, isLoading, isSuccess, isError };
};

export const useVirtualAdminLogin = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const virtualAdminLogin = async (id) => {
    return apiCall(`${APIS['virtual-login']}/admin/${id}`);
  };

  return { virtualAdminLogin, isLoading, isSuccess, isError };
};

export const useRegister = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const register = async (data) => {
    return apiCall(APIS.register, data);
  };

  return { register, isLoading, isSuccess, isError };
};

export const useGetUser = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getUser = async (query) => {
    return apiCall(APIS.user, { params: query });
  };

  return { getUser, isLoading, isSuccess, isError };
};

export const useGetUserDetails = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getUserDetails = async (query) => {
    return apiCall(APIS['user-details'], { params: query });
  };

  return { getUserDetails, isLoading, isSuccess, isError };
};

export const updateUser = (data) => {
  return axiosPut(`${APIS.user}`, data, {}, true);
};

export const getLoggedInUser = (query) => {
  return axiosGet(APIS['loggedin-user'], query, true);
};

export const forgotPassword = (data) => {
  return axiosPost(APIS['forgot-password'], data, {}, true);
};

export const resetPassword = (data, code) => {
  return axiosPost(`${APIS['reset-password']}?code=${code}`, data, {}, true);
};

export const uploadFile = (data, socketSessionId) => {
  return axiosPost(APIS.upload, data, {}, true, {
    headers: {
      'socket-session-id': socketSessionId,
    },
  });
};

export const uploadProfileImage = (data) => {
  return axiosPost(APIS.upload, data, {}, true);
};

export const sendVerification = (data) => {
  return axiosPost(APIS['send-verification'], data, {}, true);
};

export const checkVerification = (data) => {
  return axiosPost(APIS['check-verification'], data, {}, true);
};

export const useUpdateuserDetail = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePatchApi();

  const UpdateuserDetail = async (id, data) => {
    return apiCall(`${APIS.user}/${id}`, data);
  };

  return { UpdateuserDetail, isLoading, isSuccess, isError };
};

export const useRemoveAttachment = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const removeAttachment = async (data) => {
    return apiCall(APIS.removeAttachment, data);
  };

  return { removeAttachment, isLoading, isSuccess, isError };
};
