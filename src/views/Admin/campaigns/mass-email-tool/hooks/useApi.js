import { useGetApi } from '../../../../../hooks/useApi';

const APIS = {
  'category-sendgrid-matrix': '/category-sendgrid-matrix',
};
export const useGetSendGridStasticsByCategory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getSendGridStasticsByCategory = ({ id, query = {} }) =>
    apiCall(`${APIS['category-sendgrid-matrix']}/${id}`, {
      params: query,
    });

  return { getSendGridStasticsByCategory, isLoading, isSuccess, isError };
};
