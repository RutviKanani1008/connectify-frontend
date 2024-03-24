import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../../../helper/user.helper';
import {
  useGetDirectMailTemplate,
  useGetSelectedContactsForDirectMailAPI,
  useGetSpecificDirectMailDetail,
} from '../hooks/useApi';
import { getGroups } from '../../../../api/groups';
import _ from 'lodash';

export const useGetDirectMailInitialDetail = ({
  reset,
  setFilterValue,
  unAssignFilter,
  params,
  setSelectedContact,
}) => {
  const user = getCurrentUser();
  // ============================== States ============================
  const [availableDirectTemplate, setAvailableDirectMailTemplate] = useState(
    []
  );
  const [availableDirectMailTemplates, setAvailableDirectMailTemplates] =
    useState([]);
  const [loading, setLoading] = useState(false);
  const { directMailTemplate } = useGetDirectMailTemplate();
  const { directMailDetail } = useGetSpecificDirectMailDetail();

  useEffect(() => {
    getContacts();
  }, []);

  const getContacts = () => {
    setLoading(true);
    Promise.all([
      directMailTemplate({ select: 'name,description,body', type: 'TEMPLATE' }),
      getGroups({ company: user.company._id }),
    ])
      .then(async (response) => {
        const directMails = response[0]?.data;
        setAvailableDirectMailTemplates(directMails || []);
        const tempObj = [];
        directMails.forEach((email) => {
          const obj = {};
          obj['label'] = email.name;
          obj['value'] = email._id;
          tempObj.push(obj);
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

        if (params.id !== 'add') {
          const { data, error } = await directMailDetail({ id: params.id });
          if (!error) {
            const tempMassEmailObj = JSON.parse(JSON.stringify(data));
            if (
              tempMassEmailObj?.directMailTemplate?._id &&
              tempMassEmailObj?.directMailTemplate?.name
            ) {
              const obj = {};
              obj['label'] = tempMassEmailObj?.directMailTemplate?.name;
              obj['value'] = tempMassEmailObj?.directMailTemplate?._id;
              tempMassEmailObj.directMailTemplate = obj;
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
        setAvailableDirectMailTemplate(tempObj);

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return {
    getContacts,
    loading,
    availableDirectTemplate,
    availableDirectMailTemplates,
  };
};

export const useGetSelectedContactsForDirectMail = ({
  previousDataStore = false,
  directMailId = null,
}) => {
  const [contactsData, setContactData] = useState({ results: [], total: 0 });
  const [controller, setController] = useState(null);
  const { getDirectMailContactsAPI, isLoading } =
    useGetSelectedContactsForDirectMailAPI();

  const getSelectedContacts = async (query = {}) => {
    let tempController = controller;
    if (tempController) {
      tempController.abort();
    }
    tempController = new AbortController();
    setController(tempController);

    query = { ...query };

    const { data, error } = await getDirectMailContactsAPI(directMailId, {
      params: {
        search: query.search,
        page: query.page,
        limit: query.limit,
      },
      signal: tempController.signal,
    });
    if (!error && _.isArray(data?.results)) {
      tempController.abort();
      const obj = {
        results: data.results,
        total: data.total,
      };

      if (previousDataStore && query.page !== 1) {
        setContactData((prev) => ({
          ...obj,
          results: [...prev.results, ...obj.results],
        }));
      } else {
        setContactData(obj);
      }
      return obj;
    }
  };
  return { getSelectedContacts, contactsData, isLoading };
};
