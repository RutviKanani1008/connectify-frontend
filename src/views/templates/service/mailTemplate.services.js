// ==================== Packages =======================
import { useState } from 'react';
// ====================================================
import { useGetApi } from '../../../hooks/useApi';
const APIS = { mailTemplates: '/email-templates' };

export const useGetMassMailTemplatesAsOptions = () => {
  const [mailTemplatesOptions, setMailTemplatesOptions] = useState([]);
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();
  const getMailTemplateOptions = async () => {
    try {
      const { error, data } = await apiCall(`${APIS.mailTemplates}`, {
        params: { select: 'name' },
      });

      if (!error && data) {
        if (data?.length) {
          const options = [
            ...data.map((obj) => ({
              id: obj._id,
              value: obj._id,
              label: obj.name,
            })),
          ];
          setMailTemplatesOptions(options);
        }
      }
    } catch (error) {
      console.log({ error });
    }
  };

  return {
    getMailTemplateOptions,
    isLoading,
    isSuccess,
    isError,
    mailTemplatesOptions,
  };
};
