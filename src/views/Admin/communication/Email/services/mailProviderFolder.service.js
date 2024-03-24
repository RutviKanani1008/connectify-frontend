import { useGetApi, usePostApi } from '../../../../../hooks/useApi';

export const useMapImapFolder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const mapImapFolder = (data, loadingMsg) =>
    apiCall('/mail-provider-folder', data, loadingMsg);

  return { mapImapFolder, isLoading, isSuccess, isError };
};

export const useGetMappedImapFolderService = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getMappedImapFolderService = () => apiCall('/mail-provider-folder');

  return { getMappedImapFolderService, isLoading, isSuccess, isError };
};
