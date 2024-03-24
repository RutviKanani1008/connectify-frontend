import React, { useState } from 'react';

import AllowedUsersList from '../../users/components/AllowedUsersList';
import { FormField } from '@components/form-fields';

const AddPermissionsItem = ({
  permissionsObj,
  errors,
  control,
  handlePermission,
  watch,
  getValues,
  setValue,
  showTaskUsers = false,
  parentObj,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isPermissionsDisabled = getValues('role') === 'admin';

  const hasChild = parentObj.children?.length > 0;
  const isTaskManger = parentObj?.slug === 'task-manager';
  const isInventory = parentObj?.slug === 'inventory';

  const inventoryRoles = [
    { label: 'Admin User', value: 'adminUser' },
    { label: 'Input User', value: 'inputUser' },
    { label: 'Storage User', value: 'storageUser' },
    { label: 'Product Details User', value: 'productDetailUser' },
    { label: 'Shipping User', value: 'shippingUser' },
    { label: 'Picker User', value: 'pickerUser' },
  ];

  return (
    <>
      <div className={`accordian-loyal-box ${isOpen ? 'active' : ''}`}>
        <div className='accordian-loyal-header'>
          <div
            className='inner-wrapper'
            onClick={() => {
              if (hasChild || isTaskManger) {
                setIsOpen((prev) => !prev);
              }
            }}
          >
            <h3 className='title'>{parentObj.name}</h3>
            {(hasChild || isTaskManger) && (
              <button className='down-arrow' type='button'></button>
            )}
          </div>
          <div className='switch-checkbox'>
            <FormField
              name={`permission_${parentObj?.slug}`}
              key={permissionsObj[parentObj?.slug]}
              defaultValue={permissionsObj[parentObj?.slug]}
              type='checkbox'
              errors={errors}
              control={control}
              disabled={isPermissionsDisabled}
              onChange={(e) => {
                handlePermission(e.target.checked, parentObj?.slug, true);
              }}
            />
            <span className='switch-design'></span>
          </div>
        </div>

        {isTaskManger && showTaskUsers ? (
          permissionsObj[parentObj?.slug] && (
            <div className='accordian-loyal-body'>
              <AllowedUsersList
                watch={watch}
                control={control}
                getValues={getValues}
                setValue={setValue}
                isPermissionsDisabled={isPermissionsDisabled}
              />
            </div>
          )
        ) : (
          <>
            {hasChild && (
              <div className='accordian-loyal-body'>
                <div className='permission-row-wrapper'>
                  {hasChild &&
                    parentObj.children
                      ?.filter((obj) => obj.slug !== 'users')
                      ?.map((obj, index) => (
                        <div className='permission-row' key={index}>
                          <div className='inner-wrapper'>
                            <div className='permission-title'>{obj.name}</div>
                            <div className='switch-checkbox'>
                              <FormField
                                key={permissionsObj[obj.slug]}
                                name={`permission_${obj.slug}`}
                                defaultValue={permissionsObj[obj.slug]}
                                type='checkbox'
                                errors={errors}
                                control={control}
                                disabled={isPermissionsDisabled}
                                onChange={(e) => {
                                  handlePermission(e.target.checked, obj.slug);
                                }}
                              />
                              <span className='switch-design'></span>
                            </div>
                          </div>
                        </div>
                      ))}
                  {isInventory && (
                    <>
                      <div className='permission-row inventory-row'>
                        <div className='heading'>Select role of Inventory</div>
                        <FormField
                          key={getValues('inventoryRole')}
                          name='inventoryRole'
                          options={inventoryRoles}
                          placeholder='Select Role'
                          type='radio'
                          errors={errors}
                          control={control}
                          isMulti={'true'}
                          className='flex-wrap'
                          defaultValue={
                            getValues('inventoryRole')
                              ? getValues('inventoryRole')
                              : 'inputUser'
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AddPermissionsItem;
