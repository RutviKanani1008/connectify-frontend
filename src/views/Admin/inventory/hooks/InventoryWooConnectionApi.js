// ==================== Packages =======================
import { useGetApi, usePostApi } from '../../../../hooks/useApi';
// ====================================================


const APIS = {
  wooConnection: '/inventory/woo-connection',
};


export const useGetWooConnection = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getWooConnection = () => apiCall(`${APIS.wooConnection}`);

  return { getWooConnection, isLoading, isSuccess, isError };
};

export const useSaveWooConnection = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const saveWooConnection = (wooData, loadingMsg) =>
    apiCall(`${APIS.wooConnection}`, wooData, loadingMsg);

  return { saveWooConnection, isLoading, isSuccess, isError };
};

