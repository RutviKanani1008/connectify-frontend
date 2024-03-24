import _ from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';

import AddPermissionsItem from './AddPermissionsItem';

const AddPermissions = (props) => {
  const { availablePermissions } = props;
  const user = useSelector(userData);
  const permissions = _.isArray(user.permissions) ? user.permissions : [];

  return (
    <div className='permission-wrapper'>
      <div className='header-wrapper'>
        <h4 className='heading'>Permissions</h4>
        <div className='text'>Give permissions to user.</div>
      </div>
      <div className='permissions-accordian-wrapper'>
        <div className='permissions-accordian-box-wrapper'>
          {availablePermissions
            ?.filter(
              (obj) =>
                permissions.includes(obj.slug) || user.role === 'superadmin'
            )
            .map((parentObj, index) => (
              <AddPermissionsItem
                key={index}
                {...props}
                parentObj={parentObj}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default AddPermissions;
