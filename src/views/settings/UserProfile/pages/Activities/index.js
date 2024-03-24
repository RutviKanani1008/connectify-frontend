import React from 'react';
import ContactActivities from '../../../../Admin/contact/components/ContactActivites';
import { useSelector } from 'react-redux';
import { userData } from '../../../../../redux/user';

const Activities = () => {
  // ** Redux **
  const user = useSelector(userData);

  return (
    <ContactActivities
      key={user._id}
      params={{ id: user._id }}
      modelType={'Users'}
      isUserProfile={true}
    />
  );
};

export default Activities;
