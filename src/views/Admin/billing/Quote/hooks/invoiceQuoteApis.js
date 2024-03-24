import { usePostApi, useGetApi } from '../../../../../hooks/useApi';

export const useChangeBillStatusHistory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const changeStatusAPI = async (body) => {
    await apiCall(`/change-bill-status-history`, body);
  };
  return { changeStatusAPI, isLoading, isSuccess, isError };
};

export const useGetBillStatusHistory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getBillStatusHistoryAPI = async (query) => {
    return apiCall(`/bill-status-history`, { params: query });
  };
  return { getBillStatusHistoryAPI, isLoading, isSuccess, isError };
};
