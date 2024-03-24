import React from 'react';
import ContactChecklistTab from '../../../../Admin/contact/components/ContactChecklistTab';
import { useSelector } from 'react-redux';
import { userData } from '../../../../../redux/user';

const Checklists = () => {
  // ** Redux **
  const user = useSelector(userData);

  return <ContactChecklistTab contactId={user._id} type='Users' />;
};

export default Checklists;
