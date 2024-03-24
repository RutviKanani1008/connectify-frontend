import { useGetApi, usePostApi } from '../../../../hooks/useApi';

const APIS = {
  'list-email-templates': '/email-templates/list',
  'list-sms-templates': '/sms-templates/list',
  changeFolder: '/change-email-template-folder',
};

export const useGetEmailTemplates = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getEmailTemplates = (query = {}) =>
    apiCall(`${APIS['list-email-templates']}`, {
      params: query,
    });

  return { getEmailTemplates, isLoading, isSuccess, isError };
};

export const useGetSmsTemplates = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getSmsTemplates = (query = {}) =>
    apiCall(`${APIS['list-sms-templates']}`, {
      params: query,
    });

  return { getSmsTemplates, isLoading, isSuccess, isError };
};

export const useUpdateEmailTempleteFolder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const updateEmailTemplateFolder = (userData, loadingMsg) =>
    apiCall(`${APIS.changeFolder}`, userData, loadingMsg);

  return { updateEmailTemplateFolder, isLoading, isSuccess, isError };
};
