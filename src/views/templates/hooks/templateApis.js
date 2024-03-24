import { usePostApi } from '../../../hooks/useApi';

const APIS = {
  saveEmailTemplate: '/email-templates',
  saveSmsTemplate: '/sms-templates',
  checkEmailTemplate: '/email-template-exist',
  checkSmsTemplate: '/sms-template-exist',
};

export const useSaveTemplate = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const saveEmailTemplate = async (body = {}, loadingMsg) => {
    try {
      const res = await apiCall(
        APIS.saveEmailTemplate,
        {
          ...body,
        },
        loadingMsg
      );
      return res;
    } catch (error) {
      console.log({ error });
    }
  };

  const saveSmsTemplate = async (body = {}, loadingMsg) => {
    try {
      const res = await apiCall(
        APIS.saveSmsTemplate,
        {
          ...body,
        },
        loadingMsg
      );
      return res;
    } catch (error) {
      console.log({ error });
    }
  };

  return { saveEmailTemplate, saveSmsTemplate, isLoading, isSuccess, isError };
};

export const useCheckTemplateAvailable = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const checkEmailTemplate = async (templateName) => {
    try {
      const res = await apiCall(APIS.checkEmailTemplate, { name: templateName });
      return res;
    } catch (error) {
      console.log({ error });
    }
  };

  const checkSmsTemplate = async (templateName) => {
    try {
      const res = await apiCall(APIS.checkSmsTemplate, { name: templateName });
      return res;
    } catch (error) {
      console.log({ error });
    }
  };

  return {
    checkEmailTemplate,
    checkSmsTemplate,
    isLoading,
    isSuccess,
    isError,
  };
};
