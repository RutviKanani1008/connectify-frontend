import React from 'react';
import { FormField } from '@components/form-fields';

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
];

const AddRoles = ({ errors, control, getValues }) => {
  return (
    <>
      <div className='permission-wrapper'>
        <div className='header-wrapper'>
          <h4 className='heading'>Roles</h4>
          <div className='text'>Select role of the user</div>
        </div>
        <div className='role-chekcbox-wrapper'>
          <FormField
            key={getValues('role')}
            name='role'
            options={roles}
            label='Role'
            placeholder='Select Role'
            type='radio'
            errors={errors}
            control={control}
            isMulti={'true'}
            defaultValue={getValues('role') ? getValues('role') : 'user'}
          />
        </div>
      </div>
    </>
  );
};

export default AddRoles;
