import axios from 'axios';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { setProcessing } from '../redux/common';
import { store } from '../redux/store';
import { getCookie } from '../utility/Utils';
export const baseURL = process.env.REACT_APP_API_URL;

axios.interceptors.request.use(
  (config) => {
    // ** Get token from localStorage

    let accessToken;
    if (
      window.location.pathname.includes('/member') &&
      localStorage.getItem('isCompanyAdmin') &&
      localStorage.getItem('memberUserId') &&
      localStorage.getItem('memberToken')
    ) {
      accessToken = localStorage.getItem('memberToken');
    } else if (
      window.location.pathname.includes('/admin') &&
      localStorage.getItem('isSuperAdmin') &&
      localStorage.getItem('adminUserId') &&
      localStorage.getItem('adminToken')
    ) {
      accessToken = localStorage.getItem('adminToken');
    } else {
      accessToken = getCookie('token');
    }

    // ** If token is present add it to request's Authorization Header
    if (accessToken) {
      config.headers.Authorization = accessToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error?.response?.status === 401) {
      document.cookie = `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('isCompanyAdmin');
      localStorage.removeItem('memberUserId');
      localStorage.removeItem('memberToken');
      localStorage.removeItem('isSuperAdmin');
      localStorage.removeItem('adminUserId');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('group');
      // window.location.reload();
    }
    throw error;
  }
);
const setLoader = (shouldShow, status) => {
  if (shouldShow) {
    store.dispatch(setProcessing(status));
  }
};

export const axiosPost = (
  url,
  data = {},
  params = {},
  shouldProcess = false,
  options = {}
) => {
  setLoader(shouldProcess, true);
  return axios
    .post(baseURL + url, data, {
      params,
      ...options,
    })
    .then((res) => {
      setLoader(shouldProcess, false);
      return res;
    })
    .catch((error) => {
      setLoader(shouldProcess, false);
      return {
        error: error.response?.data?.message?.text
          ? error.response?.data?.message?.text
          : 'Error while processing',
        errorData: error.response?.data?.message?.errors
          ? error.response?.data?.message?.errors
          : error.response?.data?.message
          ? error.response?.data?.message
          : [],
      };
    });
};

export const axiosGet = (url, params, shouldProcess = false) => {
  setLoader(shouldProcess, true);
  return axios
    .get(baseURL + url, { params })
    .then((res) => {
      setLoader(shouldProcess, false);
      return res;
    })
    .catch((error) => {
      setLoader(shouldProcess, false);
      return {
        error: error.response?.data?.message?.text
          ? error.response?.data?.message?.text
          : 'Error while processing',
      };
    });
};

export const axiosPut = (
  url,
  data = {},
  params = {},
  shouldProcess = false
) => {
  setLoader(shouldProcess, true);
  return axios
    .put(baseURL + url, data, { params })
    .then((res) => {
      setLoader(shouldProcess, false);
      return res;
    })
    .catch((error) => {
      setLoader(shouldProcess, false);

      return {
        error: error.response?.data?.message?.text
          ? error.response?.data?.message?.text
          : 'Error while processing',
      };
    });
};

export const axiosPatch = (url, data = {}, params, shouldProcess = false) => {
  setLoader(shouldProcess, true);
  return axios
    .patch(baseURL + url, data, { params })
    .then((res) => {
      setLoader(shouldProcess, false);
      return res;
    })
    .catch((error) => {
      setLoader(shouldProcess, false);
      return {
        error: error.response?.data?.message?.text
          ? error.response?.data?.message?.text
          : 'Error while processing',
      };
    });
};

export const axiosDelete = (url, params, shouldProcess = false) => {
  setLoader(shouldProcess, true);
  return axios
    .delete(baseURL + url, { params })
    .then((res) => {
      setLoader(shouldProcess, false);
      return res;
    })
    .catch((error) => {
      setLoader(shouldProcess, false);
      return {
        error: error.response?.data?.message?.text
          ? error.response?.data?.message?.text
          : 'Error while processing',
      };
    });
};

export const axiosBaseQuery = async (args) => {
  let result;
  let toastId = '';
  try {
    result = await axios({
      url: baseURL + args.url,
      method: args.method,
      data: args.data,
      params: args.params,
      ...args.extraOptions,
    });

    if (args?.data?.loadingMsg)
      toastId = showToast(TOASTTYPES.loading, '', args?.data?.loadingMsg);

    const toast = result?.data?.toast;
    const message = result?.data?.message;
    const responseType = result?.data?.response_type;

    if (toast && message) {
      if (responseType === 'success') {
        showToast(TOASTTYPES.success, toastId, message);
      } else {
        showToast(TOASTTYPES.error, toastId, message);
      }
    }
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError;

    const errorMsg =
      result?.error ||
      (err.response?.data?.message?.text
        ? err.response.data.message.text
        : err.response?.data?.message
        ? err.response.data.message
        : 'Error while processing');
    err.error = errorMsg;
    err.data = err?.response?.data?.data || null;
    showToast(TOASTTYPES.error, toastId, errorMsg);

    return {
      error: {
        status: err?.response?.status,
        data: err?.response?.data || err?.message,
        message: err?.response?.data?.message || 'Something went wrong...',
      },
    };
  }
};

export default axios;
