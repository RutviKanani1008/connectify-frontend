import { useGetApi, usePostApi } from '../../../../hooks/useApi';

const APIS = {
  contacts: '/delete-multi-contacts',
  archiveContacts: '/archive-multi-contacts',
  changeGroup: '/change-contacts-groups',
  countContact: '/count-contacts',
  contactActivities : '/contact-activities',
};

export const useMultipleDeleteContacts = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const deleteMultipleContacts = (contacts, loadingMsg) =>
    apiCall(`${APIS.contacts}`, contacts, loadingMsg);

  return { deleteMultipleContacts, isLoading, isSuccess, isError };
};

export const useMultipleArchiveContacts = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const archiveMultipleContacts = (contacts, loadingMsg) =>
    apiCall(`${APIS.archiveContacts}`, contacts, loadingMsg);

  return { archiveMultipleContacts, isLoading, isSuccess, isError };
};

export const useMultipleGroupChange = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const changeContactGroups = (contacts, loadingMsg) =>
    apiCall(`${APIS.changeGroup}`, contacts, loadingMsg);

  return { changeContactGroups, isLoading, isSuccess, isError };
};

export const useCountContacts = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const countContacts = (contacts, loadingMsg) =>
    apiCall(`${APIS.countContact}`, contacts, loadingMsg);

  return { countContacts, isLoading, isSuccess, isError };
};

export const useGetContactActivities = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getContactActivities = (query = {}) =>
    apiCall(`${APIS.contactActivities}`, {
      params: query,
    });

  return { getContactActivities, isLoading, isSuccess, isError };
};