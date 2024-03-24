import { useState } from 'react';
import { useSelector } from 'react-redux';

import { userData } from '../../../../../redux/user';
import { getContactDetails } from '../../../../../api/contacts';

const useGetCustomPipelineStagesContacts = ({ group }) => {
  const user = useSelector(userData);

  // ** State **
  const [contactLoading, setContactLoading] = useState(false);
  const [contacts, setContacts] = useState([]);

  const getContacts = async ({ id }) => {
    try {
      setContactLoading(true);

      const contact = await getContactDetails({
        'group.id': group._id,
        company: user.company._id,
        'pipelineDetails.status.id': id,
        select: 'firstName,lastName,email,phone',
        archived: false,
      });

      setContacts(contact.data.data);
      setContactLoading(false);
    } catch (error) {
      setContactLoading(false);
    }
  };

  return { contacts, getContacts, contactLoading };
};

export default useGetCustomPipelineStagesContacts;
