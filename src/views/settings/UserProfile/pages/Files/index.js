import React from 'react';
import ContactFilesTab from '../../../../Admin/contact/components/ContactFilesTab';
import { useSelector } from 'react-redux';
import { userData } from '../../../../../redux/user';

const Files = () => {
  // ** Redux **
  const user = useSelector(userData);

  return <ContactFilesTab contactId={user._id} modelType='Users' />;
};

export default Files;
