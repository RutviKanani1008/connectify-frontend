import { usePutApi } from '../../../hooks/useApi';

export const useUpdateUserPreference = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateUserPreference = (id, body = {}, loadingMsg) =>
    apiCall(`/users/preferences/${id}`, body, loadingMsg);

  return { updateUserPreference, isLoading, isSuccess, isError };
};
