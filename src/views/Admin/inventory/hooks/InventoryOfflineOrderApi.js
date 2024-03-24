// ==================== Packages =======================
import { useGetApi, usePostApi, usePutApi } from '../../../../hooks/useApi';
// ====================================================


const APIS = {
  offlineOrder: '/inventory/offline-order',
};

export const useCreateOfflineOrder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createOfflineOrder = (orderData, loadingMsg) =>
    apiCall(`${APIS.offlineOrder}`, orderData, loadingMsg);

  return { createOfflineOrder, isLoading, isSuccess, isError };
};

export const useUpdateOfflineOrder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateOfflineOrder = (id, orderData, loadingMsg) =>
    apiCall(`${APIS.offlineOrder}/${id}`, orderData, loadingMsg);

  return { updateOfflineOrder, isLoading, isSuccess, isError };
};

export const useGetOfflineOrder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getOrder = (id) => apiCall(`${APIS.offlineOrder}/${id}`);

  return { getOrder, isLoading, isSuccess, isError };
};

export const useGetOfflineOrders = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getOfflineOrders = (query = {}) =>
    apiCall(`${APIS.offlineOrder}`, {
      params: query,
    });

  return { getOfflineOrders, isLoading, isSuccess, isError };
};
