// ** Packages
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';

import { SaveButton } from '../../../save-button';
import { userData } from '../../../../../redux/user';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { addCategory, updateCategory } from '../../../../../api/category';

const AddEditCategory = ({
  id,
  open,
  setOpen,
  group,
  data,
  setRefreshData,
}) => {
  const user = useSelector(userData);

  // ** State **
  const [submitLoading, setSubmitLoading] = useState(false);
  const [categoryName, setCategoryName] = useState({ text: '', error: null });

  useEffect(() => {
    if (id) {
      setCategoryName((prev) => ({ ...prev, text: data?.categoryName || '' }));
    }
  }, [id, data]);

  const createCategory = async () => {
    setSubmitLoading(true);
    if (id) {
      if (categoryName?.text === data?.categoryName) {
        setCategoryName({ text: '', error: null });
        return setOpen(false);
      }

      const obj = {};
      obj.categoryName = categoryName?.text;
      obj.active = data?.active;
      obj.company = data?.company;
      obj.groupId = data?.groupId;
      obj.type = 'updateName';
      obj.type = data.type;

      const res = await updateCategory(id, obj);
      if (res.error) {
        setCategoryName((prev) => ({ ...prev, error: res.error }));
        showToast(TOASTTYPES.error, '', res.error);
      } else {
        showToast(TOASTTYPES.success, '', 'Category Updated Successfully');
        setCategoryName({ text: '', error: null });
        setRefreshData(true);
        setOpen(false);
      }
      setSubmitLoading(false);
    } else {
      const obj = {};
      obj.categoryName = categoryName.text;
      obj.active = true;
      obj.company = user.company._id;
      obj.groupId = group._id;

      const res = await addCategory(obj);

      if (res.error) {
        setCategoryName((prev) => ({ ...prev, error: res.error }));
        showToast(TOASTTYPES.error, '', res.error);
      } else {
        showToast(TOASTTYPES.success, '', 'Category added successfully!');
        setCategoryName({ text: '', error: null });
        console.log('HELLO AFTER UPDATE');
        setRefreshData(true);
        setOpen(false);
      }
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <Modal
        isOpen={open}
        toggle={() => setOpen(!open)}
        className='modal-dialog-centered add-contact-category-modal'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            setCategoryName({ text: '', error: null });
            setOpen(false);
          }}
        >
          {id ? 'Update Category' : 'Add Category'}
        </ModalHeader>
        <ModalBody>
          <div className='normal-text mb-1'>
            {id ? 'Updating' : 'Adding'} category {id ? 'of' : 'into'}
            <span className='text-primary'>{` ${group?.groupName}`} </span>
          </div>
          <div className='mb-1'>
            <Input
              label='Category Name'
              name='category'
              placeholder='Category Name'
              type='text'
              value={categoryName.text}
              onChange={(e) => {
                setCategoryName({ text: e.target.value, error: null });
              }}
            />
            {categoryName.error ? (
              <>
                <div className='mt-1 text-danger'>
                  {categoryName.error || 'Please Enter Category Name.'}
                </div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <SaveButton
            color='primary'
            loading={submitLoading}
            name={id ? 'Update Category' : 'Add Category'}
            onClick={() => {
              if (categoryName.text === '') {
                setCategoryName((prev) => ({
                  ...prev,
                  error: 'Please Enter Category Name.',
                }));
              } else {
                createCategory();
              }
            }}
            width={id ? '40%' : '32%'}
          ></SaveButton>
          <Button
            color='danger'
            onClick={() => {
              setCategoryName({ text: '', error: null });
              setOpen(false);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AddEditCategory;
