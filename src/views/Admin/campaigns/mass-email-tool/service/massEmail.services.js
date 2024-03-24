// ==================== Packages =======================
import { useEffect, useState } from 'react';
import _ from 'lodash';
// ====================================================
import { getEmailTemplates as getEmailTemplatesAPI } from '../../../../../api/emailTemplates';
import { getGroups } from '../../../../../api/groups';
import { getSpecificMassEmail } from '../../../../../api/massEmail';
import { getCurrentUser } from '../../../../../helper/user.helper';
import { useGetApi } from '../../../../../hooks/useApi';

export const useGetMassEmailInitialDetail = ({
  reset,
  setFilterValue,
  unAssignFilter,
  params,
  setSelectedContact,
}) => {
  const user = getCurrentUser();
  // ============================== States ============================
  const [availableEmails, setAvailableEmails] = useState([]);
  const [availableEmailTemplates, setAvailableEmailTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getContacts();
  }, []);

  const getContacts = () => {
    setLoading(true);
    Promise.all([
      getEmailTemplatesAPI({ select: 'name,htmlBody' }),
      getGroups({ company: user.company._id }),
    ])
      .then(async (response) => {
        const emailTemp = response[0]?.data?.data;
        setAvailableEmailTemplates(emailTemp || []);

        const tempObj = [];
        emailTemp.forEach((email) => {
          if (email?.htmlBody) {
            const obj = {};
            obj['label'] = email.name;
            obj['value'] = email._id;
            tempObj.push(obj);
          }
        });

        const groups = response[1];
        if (groups.data?.data) {
          const groupObj = [
            {
              id: 'UnassignedItem',
              value: 'Unassigned',
              label: 'Unassigned',
            },
          ];
          groups?.data?.data
            ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            ?.forEach((group) => {
              const obj = {};
              obj.id = group._id;
              obj.value = group.groupCode;
              obj.label = group.groupName;
              groupObj.push(obj);
            });
          setFilterValue({
            group: groupObj,
            status: [unAssignFilter],
            category: [unAssignFilter],
            tags: [unAssignFilter],
            pipeline: [unAssignFilter],
          });
        }

        if (params.id !== 'add') {
          const massEmail = await getSpecificMassEmail(params.id, {
            select: 'title,template,company,contacts',
          });

          if (massEmail?.data?.data) {
            const tempMassEmailObj = massEmail?.data?.data;

            if (
              tempMassEmailObj?.template?._id &&
              tempMassEmailObj?.template?.name
            ) {
              const obj = {};
              obj['label'] = tempMassEmailObj?.template?.name;
              obj['value'] = tempMassEmailObj?.template?._id;
              tempMassEmailObj.template = obj;
            }
            const obj = {};
            if (tempMassEmailObj.contacts?.length) {
              tempMassEmailObj.contacts?.map((contact) => {
                obj[contact?._id] = true;
              });
            }
            setSelectedContact({
              checkAll: false,
              selectedContact: obj,
            });
            delete tempMassEmailObj.contacts;
            reset(tempMassEmailObj);
          }
        }
        setAvailableEmails(tempObj);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return {
    getContacts,
    loading,
    availableEmails,
    availableEmailTemplates,
  };
};
export const useGetMassEmailContactFilterData = ({
  setFilterValue,
  unAssignFilter,
}) => {
  const user = getCurrentUser();
  // ============================== States ============================
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMassEmailContactFilterData();
  }, []);

  const getMassEmailContactFilterData = () => {
    setLoading(true);
    getGroups({ company: user.company._id })
      .then(async (response) => {
        const groups = response;
        if (groups.data?.data) {
          const groupObj = [
            {
              id: 'UnassignedItem',
              value: 'Unassigned',
              label: 'Unassigned',
            },
          ];
          groups?.data?.data?.forEach((group) => {
            const obj = {};
            obj.id = group._id;
            obj.value = group.groupCode;
            obj.label = group.groupName;
            groupObj.push(obj);
          });
          setFilterValue({
            group: groupObj,
            status: [unAssignFilter],
            category: [unAssignFilter],
            tags: [unAssignFilter],
            pipeline: [unAssignFilter],
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };
  return {
    loading,
  };
};

export const useGetEmailTemplates = () => {
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [templateOption, setTemplateOption] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getEmailTemplates = async () => {
    try {
      setIsLoading(true);
      const emailTemplates = await getEmailTemplatesAPI({
        select: 'name,htmlBody',
      });

      if (_.isArray(emailTemplates?.data?.data)) {
        setTemplateOption(
          emailTemplates.data.data.map((obj) => ({
            value: obj._id,
            label: obj.name,
          }))
        );
        setEmailTemplates(emailTemplates.data.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return { isLoading, emailTemplates, getEmailTemplates, templateOption };
};

export const useGetSelectedContactsForSavedMassEmailAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();
  const getMassEmailContactsAPI = (id, config) => {
    return apiCall(`/mass-email/${id}/contacts`, config);
  };
  return { getMassEmailContactsAPI, isLoading, isSuccess, isError };
};
