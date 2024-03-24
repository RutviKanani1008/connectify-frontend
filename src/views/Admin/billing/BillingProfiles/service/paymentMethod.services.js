// ==================== Packages =======================
import { useState } from 'react';
import _ from 'lodash';
// ====================================================
import {
  usePostApi,
  useGetApi,
  usePutApi,
  useDeleteApi,
} from '../../../../../hooks/useApi';
const APIS = { paymentMethod: '/payment-method' };

export const useAddPaymentMethod = () => {
  const [apiCall, { isLoading, isError }] = usePostApi();
  const addPaymentMethod = async (data) => {
    return apiCall(`${APIS.paymentMethod}`, data);
  };
  return {
    addPaymentMethod,
    isLoading,
    isError,
  };
};

export const useGetPaymentMethodsByContactId = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [apiCall, { isLoading, isError }] = useGetApi();

  const getPaymentMethodsByContactId = async (id) => {
    const { data, error } = await apiCall(
      `/payment-methods-by-contact-id/${id}`
    );
    if (!error && data && _.isArray(data)) {
      setPaymentMethods(data);
    }
  };
  return {
    getPaymentMethodsByContactId,
    setPaymentMethods,
    paymentMethods,
    isLoading,
    isError,
  };
};

export const useRemovePaymentMethods = () => {
  const [apiCall, { isLoading, isError }] = useDeleteApi();

  const removePaymentMethodsService = async (ids) => {
    return apiCall('/payment-methods/delete', '', {
      params: { ids },
    });
  };

  return {
    removePaymentMethodsService,
    isLoading,
    isError,
  };
};

export const useMakeDefaultPaymentMethod = () => {
  const [apiCall, { isLoading, isError }] = usePutApi();
  const makeDefaultPaymentMethod = async (data) => {
    return apiCall(
      `${APIS.paymentMethod}/make-default`,
      data,
      'Set payment method...'
    );
  };
  return {
    makeDefaultPaymentMethod,
    isLoading,
    isError,
  };
};
