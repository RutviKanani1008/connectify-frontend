import { useGetApi } from '../../../../../../hooks/useApi';

const APIS = {
  group: '/group',
};

export const useGetGroupsAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getGroupsAPI = (query = {}) =>
    apiCall(`${APIS.group}`, {
      params: query,
    });

  return { getGroupsAPI, isLoading, isSuccess, isError };
};
