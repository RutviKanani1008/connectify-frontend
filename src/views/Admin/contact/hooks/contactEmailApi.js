import { useGetApi, usePostApi } from '../../../../hooks/useApi';

const APIS = {
  emailTemplates: '/email-templates',
  contactEmail: '/contact-email',
  scheduleMassEmail : '/schedule-contact-mass-email'
};

export const useGetEmailTemplete = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getEmailTemplete = (query = {}) =>
    apiCall(`${APIS.emailTemplates}`, {
      params: query,
    });

  return { getEmailTemplete, isLoading, isSuccess, isError };
};

export const useSendContactEmail = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const sendContactEmail = (note, loadingMsg) =>
    apiCall(`${APIS.contactEmail}`, note, loadingMsg);

  return { sendContactEmail, isLoading, isSuccess, isError };
};

export const useCancelScheduleSendContactEmail = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const cancelScheduleContactEmail = (note, loadingMsg) =>
    apiCall(`${APIS.scheduleMassEmail}`, note, loadingMsg);

  return { cancelScheduleContactEmail, isLoading, isSuccess, isError };
};

export const useGetSendContactMail = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getSendContactEmail = (query = {}) =>
    apiCall(`${APIS.contactEmail}`, {
      params: query,
    });

  return { getSendContactEmail, isLoading, isSuccess, isError };
};