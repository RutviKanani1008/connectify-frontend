import { useGetApi, usePostApi, usePutApi } from '../../../hooks/useApi';

const APIS = {
  integration: '/integration',
};

export const useGetIntegration = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getIntegration = (query = {}) =>
    apiCall(`${APIS.integration}`, {
      params: query,
    });

  return { getIntegration, isLoading, isSuccess, isError };
};

export const useCreateSendgridIntegration = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createIntegration = (integrationData, loadingMsg) =>
    apiCall(`${APIS.integration}-sendgrid`, integrationData, loadingMsg);

  return { createIntegration, isLoading, isSuccess, isError };
};

export const useUpdateSendgridIntegration = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateIntegration = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.integration}-sendgrid/${id}`, updateData, loadingMsg);

  return { updateIntegration, isLoading, isSuccess, isError };
};

export const useCreateTwilioIntegration = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createIntegration = (integrationData, loadingMsg) =>
    apiCall(`${APIS.integration}-twilio`, integrationData, loadingMsg);

  return { createIntegration, isLoading, isSuccess, isError };
};

export const useUpdateTwilioIntegration = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateIntegration = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.integration}-twilio/${id}`, updateData, loadingMsg);

  return { updateIntegration, isLoading, isSuccess, isError };
};

export const useCreateSmtpIntegration = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createIntegration = (integrationData, loadingMsg) =>
    apiCall(`${APIS.integration}-smtp`, integrationData, loadingMsg);

  return { createIntegration, isLoading, isSuccess, isError };
};

export const useUpdateSmtpIntegration = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateIntegration = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.integration}-smtp/${id}`, updateData, loadingMsg);

  return { updateIntegration, isLoading, isSuccess, isError };
};
