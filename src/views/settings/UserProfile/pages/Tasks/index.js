import React from 'react';
import UserTaskTab from '../../../UserTaskTab';
import { useSelector } from 'react-redux';
import { userData } from '../../../../../redux/user';

const Tasks = () => {
  // ** Redux **
  const user = useSelector(userData);

  return <UserTaskTab initialUserData={user} />;
};

export default Tasks;
