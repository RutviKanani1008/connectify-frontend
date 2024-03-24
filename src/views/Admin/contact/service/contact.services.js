// ==================== Packages =======================
import { useState } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
// ====================================================

import {
  useDeleteApi,
  useGetApi,
  usePostApi,
  usePutApi,
} from '../../../../hooks/useApi';
import { userData } from '../../../../redux/user';

const APIS = { contact: '/contacts' };

export const useGetContacts = () => {
  const user = useSelector(userData);
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();
  // ============================== States ============================
  const [contacts, setContact] = useState([]);

  const getContacts = async (query = {}) => {
    try {
      const { data, error } = await apiCall(APIS.contact, {
        params: {
          company: user.company._id,
          ...query,
        },
      });
      if (!error && _.isArray(data)) {
        setContact(data);
      }
      return { data, error };
    } catch (error) {
      console.log({ error });
    }
  };
  return { getContacts, isLoading, isSuccess, isError, contacts };
};

export const useGetContactsByFilter = () => {
  const [apiCall, { isLoading }] = useGetApi();

  const getContacts = async ({ search, page, query = {} }) => {
    try {
      const { data, error } = await apiCall(
        `/filterd-contacts?search=${search}&page=${page}`,
        {
          params: query,
        }
      );
      if (!error && data) {
        return { data };
      }
    } catch (error) {
      console.log(error);
    }
  };

  return { getContacts, isLoading };
};

export const useGetContactsNewAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();
  const getContactsNewAPI = async (config) => {
    return await apiCall('/new-contacts', config);
  };
  return { getContactsNewAPI, isLoading, isSuccess, isError };
};

export const useGetContactsForMassEmailAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();
  const getContactsNewAPI = (config) => {
    return apiCall('/contacts-mass-email', config);
  };
  return { getContactsNewAPI, isLoading, isSuccess, isError };
};

export const useGetContactsForCloneMassEmailAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();
  const getContactsForCloneMassEmailAPI = (config) => {
    return apiCall('/contacts-mass-email-clone', config);
  };
  return { getContactsForCloneMassEmailAPI, isLoading, isSuccess, isError };
};

export const useGetImportContacts = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const getImportContacts = (body = {}) =>
    apiCall(`/current-import-contacts`, body);

  return { getImportContacts, isLoading, isSuccess, isError };
};

export const useDeleteImportContact = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteImportContact = (id) =>
    apiCall(`/current-import-contacts/${id}`, 'deleting contact...');

  return { deleteImportContact, isLoading, isSuccess, isError };
};

export const useUpdateImportContact = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateImportContact = (id, body = {}) =>
    apiCall(`/current-import-contacts/${id}`, body);

  return { updateImportContact, isLoading, isSuccess, isError };
};

export const useFinalUploadContacts = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const finalUploadContacts = (id, body = {}) =>
    apiCall(`/final-import-contacts/${id}`, body);

  return { finalUploadContacts, isLoading, isSuccess, isError };
};

export const useDeleteImportContactDetails = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteImportContactDetails = (id) =>
    apiCall(`/trash-import-contacts/${id}`);

  return { deleteImportContactDetails, isLoading, isSuccess, isError };
};

export const useGetSelectedContactsForMassEmailAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();
  const getSelectedContactsAPI = (config) => {
    return apiCall('/selected-contacts-mass-email', config);
  };
  return { getSelectedContactsAPI, isLoading, isSuccess, isError };
};
