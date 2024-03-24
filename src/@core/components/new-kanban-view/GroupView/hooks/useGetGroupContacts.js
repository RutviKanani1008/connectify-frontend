import { useState } from 'react';
import { useSelector } from 'react-redux';

import { userData } from '../../../../../redux/user';
import { getContactDetails } from '../../../../../api/contacts';
import { getForms as getFormsAPI } from '../../../../../api/forms';

const useGetGroupContacts = ({ setModal, handleDeleteGroup, groups }) => {
  const user = useSelector(userData);

  // ** State **
  const [contactLoading, setContactLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [forms, setForms] = useState([]);
  const [remainingGroups, setRemainingGroups] = useState([]);

  const getGroupContacts = async ({ id, data, deleteGroup }) => {
    try {
      setContactLoading(true);
      if (deleteGroup) {
        const tempGroup = groups.filter(
          (s) => s._id !== id && s._id !== 'unAssigned'
        );
        const temp = [];
        tempGroup.forEach((t) => {
          const obj = {};
          obj._id = t._id;
          obj.label = t?.groupName;
          obj.value = t?.groupCode;
          temp.push(obj);
        });
        setRemainingGroups(temp);
      } else {
        setModal((prev) => ({ ...prev, relatedContact: true }));
      }
      const contact = await getContactDetails({
        company: user.company._id,
        'group.id': id,
        select: 'firstName,lastName,email,phone',
        archived: false,
      });
      const forms = await getFormsAPI({
        'group.id': id,
        company: user.company._id,
        archived: false,
      });

      if (deleteGroup) {
        if (contact.data.data.length === 0) {
          deleteGroup(id);
          setModal((prev) => ({ ...prev, delete: false, id: null }));
        } else {
          handleDeleteGroup({ id, data });
        }
      }
      setContacts(contact.data.data);
      setForms(forms.data.data);
      setContactLoading(false);
    } catch (error) {
      setContactLoading(false);
    }
  };

  return { getGroupContacts, contactLoading, remainingGroups, contacts, forms };
};

export default useGetGroupContacts;
