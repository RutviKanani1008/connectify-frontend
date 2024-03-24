import React, { useState, useEffect } from 'react';
import { Input } from 'reactstrap';
import Avatar from '@components/avatar';
import { useParams } from 'react-router-dom';

const UserCard = ({
  user,
  watch,
  setValue,
  allUsers,
  isPermissionsDisabled,
}) => {
  const { id } = useParams();

  const role = watch('role');
  const taskUsers = watch(`task-users`);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      if (role === 'admin') setValue('task-users', taskUsers || null);
      else setValue('task-users', taskUsers || []);
    } else {
      if (role === 'admin') setValue('task-users', null);
      else setValue('task-users', []);
    }

    setIsMounted(true);
  }, [role]);

  const isUserSelected = !taskUsers || taskUsers.includes(user._id);

  const handleUserSelectionChanged = (e) => {
    let prevTaskUsers = taskUsers || (allUsers || []).map((user) => user._id);

    if (e.target.checked) prevTaskUsers.push(user._id);
    else prevTaskUsers = prevTaskUsers.filter((id) => id !== user._id);

    setValue(`task-users`, prevTaskUsers);
  };

  return (
    <div className='company-task-manager-card'>
      <div className='inner-card'>
        <Avatar
          className=''
          img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${
            user?.userProfile && user?.userProfile !== 'false'
              ? user?.userProfile
              : 'super-admin/report-problem/1663400998470_avatar-blank.png'
          }`}
          imgHeight='42'
          imgWidth='42'
        />
        <div className='right-details'>
          <h3 className='title'>
            {`${
              user?.firstName || user?.firstName
                ? `${user?.firstName} ${user?.lastName}`
                : `-`
            }`}
          </h3>
          <p className='text'>{user?.email}</p>
        </div>
        <Input
          key={JSON.stringify(taskUsers)}
          type='checkbox'
          defaultChecked={id === user._id || isUserSelected}
          onChange={handleUserSelectionChanged}
          disabled={id === user._id || isPermissionsDisabled}
        />
      </div>
    </div>
  );
};

export default UserCard;
