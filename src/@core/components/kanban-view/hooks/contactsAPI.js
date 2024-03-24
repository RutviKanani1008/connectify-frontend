import { useState } from 'react';
import { useGetApi } from '../../../../hooks/useApi';

const APIS = {
  'contacts-not-in-stage': '/contacts-not-in-stage',
};

export const useGetNotInStageContactList = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();
  const [controller, setController] = useState(null);

  const getOtherStageContacts = async (query = {}) => {
    let tempController = controller;
    if (tempController) {
      tempController.abort();
    }
    tempController = new AbortController();
    setController(tempController);
    return await apiCall(APIS['contacts-not-in-stage'], {
      params: {
        ...query,
      },
      signal: tempController.signal,
    });
  };
  return { getOtherStageContacts, isLoading, isSuccess, isError };
};
