import {
  useGetApi,
  useDeleteApi,
  usePostApi,
  usePutApi,
} from '../../../../hooks/useApi';

const APIS = {
  folder: '/folder',
  group: '/group',
  tags: '/tags',
  tagsFolder: '/tags-folder',
};

export const useGetFolders = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getFolders = (query = {}, controller = null) =>
    apiCall(`${APIS.folder}`, {
      params: query,
      ...(controller && { signal: controller }),
    });

  return { getFolders, isLoading, isSuccess, isError };
};

export const useCreateFolder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createFolder = (userData, loadingMsg) =>
    apiCall(`${APIS.folder}`, userData, loadingMsg);

  return { createFolder, isLoading, isSuccess, isError };
};

export const useUpdateFolder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateFolder = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.folder}/${id}`, updateData, loadingMsg);

  return { updateFolder, isLoading, isSuccess, isError };
};

export const useUpdateTagFolder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const updateTagFolder = (userData, loadingMsg) =>
    apiCall(`${APIS.tagsFolder}`, userData, loadingMsg);

  return { updateTagFolder, isLoading, isSuccess, isError };
};

export const useDeleteFolder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteFolder = (id, loadingMsg) =>
    apiCall(`${APIS.folder}/${id}`, loadingMsg);

  return { deleteFolder, isLoading, isSuccess, isError };
};

export const useDeleteGroup = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteGroup = (id, loadingMsg) =>
    apiCall(`${APIS.group}/${id}`, loadingMsg);

  return { deleteGroup, isLoading, isSuccess, isError };
};

// Groups Api
export const useGetGroups = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getGroups = (query = {}) =>
    apiCall(`${APIS.group}`, {
      params: query,
    });

  return { getGroups, isLoading, isSuccess, isError };
};

// Tags

export const useCreateTag = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createTag = (userData, loadingMsg) =>
    apiCall(`${APIS.tags}`, userData, loadingMsg);

  return { createTag, isLoading, isSuccess, isError };
};

export const useGetTags = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTags = (query = {}) =>
    apiCall(`${APIS.tags}`, {
      params: query,
    });

  return { getTags, isLoading, isSuccess, isError };
};

export const useUpdateTag = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateTag = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.tags}/${id}`, updateData, loadingMsg);

  return { updateTag, isLoading, isSuccess, isError };
};
