import React, { useEffect, useState } from 'react';

import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import * as yup from 'yup';
import logger from 'redux-logger';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { SaveButton } from '../../../save-button';
import { FormField } from '@components/form-fields';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { addStatus, updateStatus } from '../../../../../api/status';
import { required } from '../../../../../configs/validationConstant';

const validationSchema = yup.object().shape({
  statusName: yup.string().required(required('Status Name')),
});

export const AddEditStatus = ({
  group,
  id,
  open,
  setOpen,
  user,
  data,
  setRefreshData,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  // ** State **
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (id) {
      reset({ statusName: data.statusName, active: true });
    }
  }, [id, data]);

  const onSubmit = async (values) => {
    try {
      if (values?.statusName === data?.statusName) {
        return setOpen(false);
      }

      setSubmitLoading(true);
      const obj = {};
      obj.statusName = values?.statusName;
      obj.active = values?.active;
      obj.company = user.company._id;
      obj.groupId = group._id;
      if (id) {
        const res = await updateStatus(id, obj);
        if (res.error) {
          showToast(TOASTTYPES.error, '', res.error);
        } else {
          showToast(TOASTTYPES.success, '', 'Status Updated Successfully');
          setOpen(false);
          setRefreshData(true);
        }
        setSubmitLoading(false);
      } else {
        const obj = {};
        obj.statusName = values?.statusName;
        obj.active = true;
        obj.company = user.company._id;
        obj.groupId = group._id;
        const res = await addStatus(obj);
        if (res.error) {
          showToast(TOASTTYPES.error, '', res.error);
        } else {
          showToast(TOASTTYPES.success, '', 'Status Added Successfully');
          setOpen(false);
          setRefreshData(true);
        }
        setSubmitLoading(false);
      }
    } catch (error) {
      logger(error);
    }
  };

  return (
    <Modal
      isOpen={open}
      toggle={() => setOpen(!open)}
      className='modal-dialog-centered add-contact-status-modal'
      backdrop='static'
    >
      <ModalHeader toggle={() => setOpen(!open)}>
        {id ? 'Update Status' : 'Add Status'}
      </ModalHeader>
      <ModalBody>
        <div className='normal-text mb-1'>
          {id ? 'Updating' : 'Adding'} status {id ? 'of' : 'into'}
          <span className='text-primary'>{` ${group?.groupName}`} </span>
        </div>
        <Form
          className='auth-login-form'
          onSubmit={handleSubmit(onSubmit)}
          autoComplete='off'
        >
          <div className='mb-1'>
            <FormField
              label='Status Name'
              name='statusName'
              placeholder='Enter...'
              type='text'
              errors={errors}
              control={control}
            />
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <SaveButton
          onClick={handleSubmit(onSubmit)}
          color='primary'
          name={id ? 'Update Status' : 'Add Status'}
          width={'35%'}
          loading={submitLoading}
          type='submit'
        ></SaveButton>
        <Button color='danger' onClick={() => setOpen(!open)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
