// ==================== Packages =======================
import { useState } from 'react';
import { useGetApi, usePutApi } from '../../../../../hooks/useApi';
import _ from 'lodash';
// ====================================================
import { getCurrentUser } from '../../../../../helper/user.helper';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { useGetContacts } from '../../../contact/service/contact.services';

const APIS = {
  scheduledMassEmail: '/scheduled-mass-email',
};

export const useGetScheduledMails = ({
  setScheduledMassEmails,
  setScheduledMassEmailPagination,
  scheduledMassEmails,
  activeView,
}) => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getScheduledMails = async (query) => {
    try {
      setScheduledMassEmailPagination({
        page: query.page || 1,
        limit: query.limit || 6,
      });
      const { data, error } = await apiCall(APIS.scheduledMassEmail, {
        params: query,
      });

      if (!error && data) {
        if (activeView === 'list') {
          setScheduledMassEmails({
            data: [...data.scheduledMassEmails],
            totalScheduledMassEmails: data?.totalScheduleMassEmail || 0,
          });
        } else {
          setScheduledMassEmails({
            data: [...scheduledMassEmails.data, ...data.scheduledMassEmails],
            totalScheduledMassEmails: data?.totalScheduleMassEmail || 0,
          });
        }
      }
    } catch (error) {
      console.log({ error });
    }
  };
  return { getScheduledMails, isLoading, isSuccess, isError };
};

export const useGetScheduledMailDetail = ({ reset }) => {
  // ============================== States ============================
  const [scheduledMailDetail, setScheduledMailDetail] = useState({});
  const [contacts, setContacts] = useState([]);
  // ========================== Custom Hooks =========================
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();
  const { getContacts, isLoading: contactLoading } = useGetContacts();

  const getScheduledMail = async (id, mode) => {
    let tempContacts = [];
    try {
      const api = `${APIS.scheduledMassEmail}/${id}${
        mode === 'view' ? '?withPopulatedContacts=true' : ''
      }`;
      const { data, error } = await apiCall(api);
      if (!error && data) {
        if (mode === 'edit') {
          const { data: contactData, error } = await getContacts({
            select: 'firstName,lastName,email,phone,userProfile',
          });
          if (contactData && !error && _.isArray(contactData)) {
            tempContacts = [...contactData];
            const obj = {};
            obj['label'] = data?.template?.name;
            obj['value'] = data?.template?._id;
            reset({
              scheduledJobName: data.scheduledJobName,
              template: obj,
              ...data.contacts.reduce(
                (prevObj, key) => ({ ...prevObj, [key]: true }),
                {}
              ),
            });
            tempContacts = tempContacts.map((obj) => ({
              ...obj,
              selected: data.contacts.includes(obj._id) ? true : false,
            }));
            const selectedContacts = tempContacts.filter((obj) => obj.selected);
            const otherContacts = tempContacts.filter((obj) => !obj.selected);
            tempContacts = [...selectedContacts, ...otherContacts];
          }
        } else {
          tempContacts = [
            ...data.contacts.map((obj) => ({ ...obj, selected: true })),
          ];
        }
        setContacts(tempContacts);
        setScheduledMailDetail(data);
      }
    } catch (error) {
      console.log({ error });
    }
  };

  return {
    getScheduledMail,
    isLoading: contactLoading || isLoading,
    isSuccess,
    isError,
    scheduledMailDetail,
    contacts,
  };
};

export const useCancelScheduledMail = ({ getScheduledMails, user }) => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const cancelScheduledMail = async (id, body = {}, loadingMsg) => {
    try {
      const { error } = await apiCall(
        `${APIS.scheduledMassEmail}/cancel/${id}`,
        {
          ...body,
        },
        loadingMsg
      );

      if (!error) {
        getScheduledMails({
          company: user?.company?._id ? user?.company?._id : null,
        });
      }
    } catch (error) {
      console.log({ error });
    }
  };

  return { cancelScheduledMail, isLoading, isSuccess, isError };
};

export const useUpdateScheduledMail = ({
  setEditViewModal,
  id,
  getScheduledMails,
}) => {
  const user = getCurrentUser();
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();
  const updateScheduledMail = async (values) => {
    try {
      const tempValues = { ...values };
      delete values.scheduledJobName;
      delete values.template;
      if (_.isObject(values)) {
        const contacts = Object.keys(values).filter((key) => values[key]);
        if (contacts.length) {
          const { error } = await apiCall(`${APIS.scheduledMassEmail}/${id}`, {
            contacts,
            template: tempValues.template.value,
            scheduledJobName: tempValues.scheduledJobName,
          });
          if (!error) {
            setEditViewModal({ isOpen: false, mode: '', id: '' });
            getScheduledMails({
              company: user?.company?._id ? user?.company?._id : null,
            });
          }
        } else {
          await showWarnAlert({
            title: '',
            text: 'Please select one or more contact.',
            icon: 'warning',
            showCancelButton: false,
            allowOutsideClick: false,
            confirmButtonText: 'Okay',
            customClass: {
              confirmButton: 'btn btn-primary',
            },
            buttonsStyling: false,
          });
        }
      }
    } catch (error) {
      console.log({ error });
    }
  };

  return { updateScheduledMail, isLoading, isSuccess, isError };
};

export const useGetScheduleMailForCloneScheduleMail = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getScheduleMailForCloneScheduleMail = async (id, query = {}) => {
    try {
      const api = `${APIS.scheduledMassEmail}/${id}`;
      // const api = `${APIS.scheduledMassEmail}/${id}?withPopulatedContacts=true`;
      return apiCall(api, { params: query });
    } catch (error) {
      console.log('useGetScheduleMailForCloneScheduleMail---Error', error);
    }
  };

  return {
    getScheduleMailForCloneScheduleMail,
    isSuccess,
    isError,
    isLoading,
  };
};

export const useGetScheduleMailContacts = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getScheduleMailContacts = async (id, query = {}) => {
    try {
      const api = `${APIS.scheduledMassEmail}/${id}/contacts`;
      return apiCall(api, { params: query });
    } catch (error) {
      console.log('useGetScheduleMailContacts---Error', error);
    }
  };

  return {
    getScheduleMailContacts,
    isSuccess,
    isError,
    isLoading,
  };
};
