// ==================== Packages =======================
import { useState } from 'react';
import { useGetApi, usePutApi } from '../../../../../hooks/useApi';
import _ from 'lodash';
// ====================================================
import { useGetContacts } from '../../../contact/service/contact.services';
import { getCurrentUser } from '../../../../../helper/user.helper';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';

const APIS = { scheduledMassSMS: '/scheduled-mass-sms' };

export const useGetScheduledSMSList = ({ setScheduledMassSMSList }) => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getScheduledSMSList = async (query) => {
    try {
      const { data, error } = await apiCall(APIS.scheduledMassSMS, {
        params: query,
      });

      if (!error && data) {
        setScheduledMassSMSList(data);
      }
    } catch (error) {
      console.log({ error });
    }
  };
  return { getScheduledSMSList, isLoading, isSuccess, isError };
};

export const useGetScheduledSMSDetail = ({ reset }) => {
  // ============================== States ============================
  const [scheduledSMSDetail, setScheduledSMSDetail] = useState({});
  const [contacts, setContacts] = useState([]);

  // ========================== Custom Hooks =========================
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const { getContacts, isLoading: contactLoading } = useGetContacts();

  const getScheduledSMS = async (id, mode) => {
    let tempContacts = [];
    try {
      const api = `${APIS.scheduledMassSMS}/${id}${
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
        setScheduledSMSDetail(data);
      }
    } catch (error) {
      console.log({ error });
    }
  };

  return {
    getScheduledSMS,
    isLoading: contactLoading || isLoading,
    isSuccess,
    isError,
    scheduledSMSDetail,
    contacts,
  };
};

export const useCancelScheduledSMS = ({ getScheduledSMSList, user }) => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const cancelScheduledSMS = async (id, body = {}, loadingMsg) => {
    try {
      const { error } = await apiCall(
        `${APIS.scheduledMassSMS}/cancel/${id}`,
        { ...body },
        loadingMsg
      );

      if (!error) {
        getScheduledSMSList({
          company: user?.company?._id ? user?.company?._id : null,
        });
      }
    } catch (error) {
      console.log({ error });
    }
  };
  return { cancelScheduledSMS, isLoading, isSuccess, isError };
};

export const useUpdateScheduledSMS = ({
  setEditViewModal,
  id,
  getScheduledSMSList,
}) => {
  const user = getCurrentUser();
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();
  const updateScheduledSMS = async (values) => {
    try {
      const tempValues = { ...values };
      delete values.scheduledJobName;
      delete values.template;
      if (_.isObject(values)) {
        const contacts = Object.keys(values).filter((key) => values[key]);
        if (contacts.length) {
          const { error } = await apiCall(`${APIS.scheduledMassSMS}/${id}`, {
            contacts,
            template: tempValues.template.value,
            scheduledJobName: tempValues.scheduledJobName,
          });
          if (!error) {
            setEditViewModal({ isOpen: false, mode: '', id: '' });
            getScheduledSMSList({
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

  return { updateScheduledSMS, isLoading, isSuccess, isError };
};
