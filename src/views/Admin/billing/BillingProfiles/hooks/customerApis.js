import { useGetApi } from '../../../../../hooks/useApi';

const APIS = {
  customer: '/billing-profiles',
  enableBillingProfile: '/enable-billing-profile',
};

export const useGetCustomers = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCustomers = (query = {}) =>
    apiCall(`${APIS.customer}`, {
      params: query,
    });

  return { getCustomers, isLoading, isSuccess, isError };
};
