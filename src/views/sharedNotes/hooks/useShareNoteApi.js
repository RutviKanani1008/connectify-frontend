import { useGetApi } from '../../../hooks/useApi';

const APIS = {
  notes: '/notes',
};

export const useGetNoteDetail = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getNote = (id, params) =>
    apiCall(`${APIS.notes}/${id}`, {
      params,
    });

  return { getNote, isLoading, isSuccess, isError };
};
