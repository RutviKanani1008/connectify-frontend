// ==================== Packages =======================
import { useEffect, useState } from 'react';
// ====================================================
import { getContactDetails } from '../../../../../api/contacts';
import { getGroups } from '../../../../../api/groups';
import { getSpecificMassSMS } from '../../../../../api/massSMS';
import { getSmsTemplates } from '../../../../../api/smsTemplates';
import { getCurrentUser } from '../../../../../helper/user.helper';

export const useGetMassSMSInitialDetail = ({
  setFilterContacts,
  reset,
  setFilterValue,
  unAssignFilter,
  setCurrentSelectedContacts,
  params,
}) => {
  const user = getCurrentUser();
  // ============================== States ============================
  const [availableContacts, setAvailableContacts] = useState([]);
  const [availableSMS, setAvailableSMS] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getContacts();
  }, []);

  const getContacts = () => {
    setLoading(true);
    Promise.all([
      getContactDetails({
        company: user.company._id,
        select: 'firstName,lastName,email,phone,userProfile',
      }),
      getSmsTemplates({ select: 'name' }),
      getGroups({ company: user.company._id }),
    ])
      .then(async (response) => {
        setFilterContacts(response[0]?.data?.data);
        setAvailableContacts(response[0]?.data?.data);
        const smsTemp = response[1]?.data?.data;
        const tempObj = [];
        smsTemp.forEach((temp) => {
          const obj = {};
          obj['label'] = temp.name;
          obj['value'] = temp._id;
          tempObj.push(obj);
        });

        const groups = response[2];
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
          const massSMS = await getSpecificMassSMS(params.id);

          if (massSMS?.data?.data) {
            const tempMassSMSObj = massSMS?.data?.data;
            let tempSelectedContact = {};
            tempMassSMSObj?.contacts.forEach((contact) => {
              tempSelectedContact = {
                ...tempSelectedContact,
                [contact._id]: { ...contact, checked: true },
              };
            });

            setCurrentSelectedContacts(tempSelectedContact);
            if (
              tempMassSMSObj?.template?._id &&
              tempMassSMSObj?.template?.name
            ) {
              const obj = {};
              obj['label'] = tempMassSMSObj?.template?.name;
              obj['value'] = tempMassSMSObj?.template?._id;
              tempMassSMSObj.template = obj;
            }
            delete tempMassSMSObj.contacts;
            reset(tempMassSMSObj);
          }
        }
        setAvailableSMS(tempObj);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return { getContacts, loading, availableContacts, availableSMS };
};
