import { useState } from 'react';
import Axios from '@src/api/axios-config';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { baseURL } from '../api/axios-config';

export const useGetApi = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const makeApiCall = async (url, config = {}) => {
    setSuccess(false);
    setError(false);
    setLoading(true);

    const response = { data: null, error: null };

    const toastId = '';

    try {
      const responseData = await Axios({
        url: baseURL + url,
        method: 'GET',
        ...config,
      });

      response.data = responseData?.data?.data;
      const toast = responseData?.data?.toast;
      const message = responseData?.data?.message;
      const responseType = responseData?.data?.response_type;

      if (responseType === 'error') {
        response.error = responseData?.data?.message;
      }

      if (toast && message) {
        if (responseType === 'success') {
          showToast(TOASTTYPES.success, toastId, message);
        } else {
          showToast(TOASTTYPES.error, toastId, message);
        }
      }
      if (responseType !== 'error') {
        setSuccess(true);
      }
      setLoading(false);
    } catch (error) {
      const errorMsg =
        response.error ||
        (error.response?.data?.message?.text
          ? error.response.data.message.text
          : error.response?.data?.message
          ? error.response.data.message
          : 'Error while processing');

      // Here loader made false if manual abort or any other error without signal abort
      if (config?.onManualAbortLoadingFalse || error?.message !== 'canceled') {
        setLoading(false);
      }

      response.error = errorMsg;

      if (
        error?.message !== 'canceled' &&
        errorMsg !== 'Error while processing'
      ) {
        showToast(TOASTTYPES.error, toastId, errorMsg);
      }
      setError(true);
    }

    return response;
  };

  return [
    makeApiCall,
    { isLoading: loading, isSuccess: success, isError: error },
  ];
};

export const usePostApi = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const makeApiCall = async (url, data = {}, loadingMsg = '', config = {}) => {
    setSuccess(false);
    setError(false);
    setLoading(true);

    const response = { data: null, error: null };

    let toastId = '';

    if (loadingMsg) toastId = showToast(TOASTTYPES.loading, '', loadingMsg);

    try {
      const responseData = await Axios({
        url: baseURL + url,
        data,
        method: 'POST',
        ...config,
      });

      response.data = responseData.data?.data;
      const toast = responseData.data?.toast;
      const message = responseData.data?.message;
      const responseType = responseData?.data?.response_type;

      if (responseType === 'error') {
        response.error = responseData?.data?.message;
        setError(true);
      }

      if (toast && message)
        showToast(
          responseType === 'success' ? TOASTTYPES.success : TOASTTYPES.error,
          toastId,
          message
        );
      else if (loadingMsg) showToast(TOASTTYPES.success, toastId, 'Success');

      if (responseType !== 'error') {
        setSuccess(true);
      }
    } catch (error) {
      const errorMsg =
        response.error ||
        (error.response?.data?.message?.text
          ? error.response.data.message.text
          : error.response?.data?.message
          ? error.response.data.message
          : 'Error while processing');
      response.error = errorMsg;
      response.data = error?.response?.data?.data || null;
      showToast(TOASTTYPES.error, toastId, errorMsg);
      setError(true);
    } finally {
      setLoading(false);
    }

    return response;
  };

  return [
    makeApiCall,
    { isLoading: loading, isSuccess: success, isError: error },
  ];
};

export const usePutApi = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const makeApiCall = async (url, data = {}, loadingMsg = '', config = {}) => {
    setSuccess(false);
    setError(false);
    setLoading(true);
    const response = { data: null, error: null };

    let toastId = '';
    if (loadingMsg) toastId = showToast(TOASTTYPES.loading, '', loadingMsg);

    try {
      const responseData = await Axios({
        url: baseURL + url,
        data,
        method: 'PUT',
        ...config,
      });
      response.data = responseData.data?.data;
      const toast = responseData.data?.toast;
      const message = responseData.data?.message;

      if (toast && message) showToast(TOASTTYPES.success, toastId, message);
      else if (loadingMsg) showToast(TOASTTYPES.success, toastId, 'Success');

      setSuccess(true);
    } catch (error) {
      const errorMsg = error.response?.data?.message?.text
        ? error.response.data.message.text
        : error.response?.data?.message
        ? error.response.data.message
        : 'Error while processing';
      response.error = errorMsg;
      response.data = error?.response?.data?.data || null;
      showToast(TOASTTYPES.error, toastId, errorMsg);
      response.error = errorMsg;
      setError(true);
    } finally {
      setLoading(false);
    }
    return response;
  };

  return [
    makeApiCall,
    { isLoading: loading, isSuccess: success, isError: error },
  ];
};

export const useDeleteApi = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const makeApiCall = async (url, loadingMsg = '', config = {}) => {
    setSuccess(false);
    setError(false);
    setLoading(true);

    const response = { data: null, error: null };

    let toastId = '';
    if (loadingMsg) toastId = showToast(TOASTTYPES.loading, '', loadingMsg);

    try {
      const responseData = await Axios({
        url: baseURL + url,
        method: 'DELETE',
        ...config,
      });
      response.data = responseData.data?.data;
      const toast = responseData.data?.toast;
      const message = responseData.data?.message;

      if (toast && message) showToast(TOASTTYPES.success, toastId, message);
      else if (loadingMsg) showToast(TOASTTYPES.success, toastId, 'Success');
      setSuccess(true);
    } catch (error) {
      const errorMsg = error.response?.data?.message?.text
        ? error.response.data.message.text
        : error.response?.data?.message
        ? error.response.data.message
        : 'Error while processing';
      showToast(TOASTTYPES.error, toastId, errorMsg);

      response.error = errorMsg;
      setError(true);
    } finally {
      setLoading(false);
    }

    return response;
  };

  return [
    makeApiCall,
    { isLoading: loading, isSuccess: success, isError: error },
  ];
};

export const usePatchApi = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const makeApiCall = async (url, data = {}, loadingMsg = '', config = {}) => {
    setSuccess(false);
    setError(false);
    setLoading(true);
    const response = { data: null, error: null };

    let toastId = '';
    if (loadingMsg) toastId = showToast(TOASTTYPES.loading, '', loadingMsg);

    try {
      const responseData = await Axios({
        url: baseURL + url,
        data,
        method: 'PATCH',
        ...config,
      });
      response.data = responseData.data?.data;
      const toast = responseData.data?.toast;
      const message = responseData.data?.message;

      if (toast && message) showToast(TOASTTYPES.success, toastId, message);
      else if (loadingMsg) showToast(TOASTTYPES.success, toastId, 'Success');

      setSuccess(true);
    } catch (error) {
      const errorMsg = error.response?.data?.message?.text
        ? error.response.data.message.text
        : error.response?.data?.message
        ? error.response.data.message
        : 'Error while processing';
      response.error = errorMsg;
      response.data = error?.response?.data?.data || null;
      showToast(TOASTTYPES.error, toastId, errorMsg);
      response.error = errorMsg;
      setError(true);
    } finally {
      setLoading(false);
    }
    return response;
  };

  return [
    makeApiCall,
    { isLoading: loading, isSuccess: success, isError: error },
  ];
};
