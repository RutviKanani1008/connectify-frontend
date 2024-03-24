// ==================== Packages =======================
import { useState } from 'react';
// ====================================================
import { useGetApi } from '../../../hooks/useApi';
const APIS = { smsTemplates: '/sms-templates' };

export const useGetMassSMSTemplatesAsOptions = () => {
  const [smsTemplates, setSMSTemplates] = useState([]);
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();
  const getSMSTemplates = async () => {
    try {
      const { error, data } = await apiCall(`${APIS.smsTemplates}`, {
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
          setSMSTemplates(options);
        }
      }
    } catch (error) {
      console.log({ error });
    }
  };

  return { getSMSTemplates, isLoading, isSuccess, isError, smsTemplates };
};
