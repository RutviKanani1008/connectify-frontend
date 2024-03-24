import { useGetApi, useDeleteApi, usePostApi } from '../../../hooks/useApi';

const APIS = {
  checklistTemplates: '/checklist-templates',
  tagsFolder: '/checklist-folder',
  'checklist-order': '/checklist/order',
  'folders-reorder': '/folders-reorder',
};

export const useGetChecklistTemplates = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getChecklistTemplates = (query = {}) =>
    apiCall(`${APIS.checklistTemplates}`, {
      params: query,
    });

  return { getChecklistTemplates, isLoading, isSuccess, isError };
};

export const useGetExportChecklistTemplates = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getExportChecklistTemplates = (query = {}) =>
    apiCall(`${APIS.checklistTemplates}-export`, {
      params: query,
    });

  return { getExportChecklistTemplates, isLoading, isSuccess, isError };
};

export const useCopyChecklistToContacts = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const copyChecklistToContacts = (id, data = {}) =>
    apiCall(
      `${APIS.checklistTemplates}/copy-to-contacts/${id}`,
      data,
      'Coypying checklist...'
    );

  return { copyChecklistToContacts, isLoading, isSuccess, isError };
};

export const useUpdateChecklistFolder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const updateChecklistFolder = (userData, loadingMsg) =>
    apiCall(`${APIS.tagsFolder}`, userData, loadingMsg);

  return { updateChecklistFolder, isLoading, isSuccess, isError };
};

export const useGetChecklistTemplate = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getChecklistTemplate = (id) =>
    apiCall(`${APIS.checklistTemplates}/${id}`);

  return { getChecklistTemplate, isLoading, isSuccess, isError };
};

export const useCheckChecklistTemplateExist = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getChecklistTemplate = (query) =>
    apiCall(`${APIS.checklistTemplates}/exist`, { params: query });

  return { getChecklistTemplate, isLoading, isSuccess, isError };
};

export const useSaveChecklistTemplate = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createChecklistTemplate = (data, loadingMsg) =>
    apiCall(`${APIS.checklistTemplates}`, data, loadingMsg);

  return { createChecklistTemplate, isLoading, isSuccess, isError };
};

export const useCloneChecklistTemplate = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const cloneChecklistTemplate = (id, data, loadingMsg) =>
    apiCall(`${APIS.checklistTemplates}/clone/${id}`, data, loadingMsg);

  return { cloneChecklistTemplate, isLoading, isSuccess, isError };
};

export const useUpdateChecklistOrder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const updateChecklistOrder = (data, loadingMsg) =>
    apiCall(`${APIS['checklist-order']}`, data, loadingMsg);

  return { updateChecklistOrder, isLoading, isSuccess, isError };
};

export const useDeleteChecklistTemplate = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteChecklistTemplate = (id, loadingMsg) =>
    apiCall(`${APIS.checklistTemplates}/${id}`, loadingMsg);

  return { deleteChecklistTemplate, isLoading, isSuccess, isError };
};

export const useGetSpecificChecklistTemplates = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getSpecificChecklistTemplates = (id, query = {}) =>
    apiCall(`${APIS.checklistTemplates}/${id}`, {
      params: query,
    });

  return { getSpecificChecklistTemplates, isLoading, isSuccess, isError };
};

export const useUpdateReOrderFolder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const updateReOrderFolder = (userData, loadingMsg) =>
    apiCall(`${APIS['folders-reorder']}`, userData, loadingMsg);

  return { updateReOrderFolder, isLoading, isSuccess, isError };
};

export const useCopyChecklistToCompany = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const copyChecklistToCompany = (id, data = {}) =>
    apiCall(
      `${APIS.checklistTemplates}/copy-to-company/${id}`,
      data,
      'Coypying checklist...'
    );

  return { copyChecklistToCompany, isLoading, isSuccess, isError };
};
