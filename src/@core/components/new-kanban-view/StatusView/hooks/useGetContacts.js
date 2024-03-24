import { useState } from 'react';
import { getContactDetails } from '../../../../../api/contacts';

const useGetContacts = ({
  group,
  user,
  setModal,
  handleDeleteStatus,
  status,
}) => {
  // ** State **
  const [contactLoading, setContactLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [remainingStatus, setRemainingStatus] = useState([]);

  const getContacts = async ({ id, data, deleteStatus }) => {
    try {
      setContactLoading(true);
      if (deleteStatus) {
        const tempStatus = status?.filter(
          (s) => s._id !== id && s._id !== 'unassignedItem'
        );
        const temp = [];
        tempStatus.forEach((t) => {
          const obj = {};
          obj._id = t._id;
          obj.label = t?.statusName;
          obj.value = t?.statusCode;
          temp.push(obj);
        });
        setRemainingStatus(temp);
      } else {
        setModal((prev) => ({ ...prev, relatedContact: true }));
      }
      if (id !== 'unassignedItem') {
        const contact = await getContactDetails({
          'group.id': group._id,
          company: user.company._id,
          'status.id': id,
          select: 'firstName,lastName,email,phone',
          archived: false,
        });
        // If pass deleteStatus args then check for delete record conditions
        if (deleteStatus) {
          if (contact.data.data.length === 0) {
            deleteStatus(id);
            setModal((prev) => ({ ...prev, delete: false, id: null }));
          } else {
            handleDeleteStatus({ id, data });
          }
        }
        setContacts(contact.data.data);
        setContactLoading(false);
      } else {
        const contact = await getContactDetails({
          'group.id': group.value,
          company: user.company._id,
          status: null,
          select: 'firstName,lastName,email,phone,status',
          archived: false,
        });
        const temp = contact.data.data.filter(
          (contact) => contact.status === null
        );
        setContacts(temp);
        setContactLoading(false);
      }
    } catch (error) {
      setContactLoading(false);
    }
  };

  return { getContacts, contactLoading, remainingStatus, contacts };
};

export default useGetContacts;
