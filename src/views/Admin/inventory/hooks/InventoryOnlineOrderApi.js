// ==================== Packages =======================
import { useGetApi, usePutApi } from '../../../../hooks/useApi';
// ====================================================


const APIS = {
  onlineOrder: '/inventory/online-order',
};


export const useGetOnlineOrder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getOrder = (id) => apiCall(`${APIS.onlineOrder}/${id}`);

  return { getOrder, isLoading, isSuccess, isError };
};

export const useUpdateOnlineOrder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateOnlineOrder = (id, orderData, loadingMsg) =>
    apiCall(`${APIS.onlineOrder}/${id}`, orderData, loadingMsg);

  return { updateOnlineOrder, isLoading, isSuccess, isError };
};

export const useGetOnlineOrders = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getOnlineOrders = (query = {}) =>
    apiCall(`${APIS.onlineOrder}`, {
      params: query,
    });

  return { getOnlineOrders, isLoading, isSuccess, isError };
};
