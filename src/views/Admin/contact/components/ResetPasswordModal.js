import * as yup from 'yup';
import React, { useState } from 'react';
import { minimum, required } from '../../../../configs/validationConstant';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import { resetPassword } from '../../../../api/auth';
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { SaveButton } from '@components/save-button';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { FormField } from '@components/form-fields';

const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required(required('Password'))
    .min(8, minimum('Password', 8)),
  cpassword: yup
    .string()
    .oneOf(
      [yup.ref('password'), null],
      'Password and Confirm Password does not match'
    )
    .required(required('Confirm Password'))
    .min(8, minimum('Confirm Password', 8)),
});

const ResetPassword = ({ email, openResetPassword, setOpenResetPassword }) => {
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const {
    control: rpControl,
    handleSubmit: rpHandleSubmit,
    reset: rpReset,
    formState: { errors: rpError },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(resetPasswordSchema),
  });

  const onResetPasswordSubmit = async (data) => {
    const result = await showWarnAlert({
      text: 'Are you want to reset password?',
    });
    if (result.value) {
      const obj = {};
      obj.password = data.password;
      obj.confirmPassword = data.cpassword;
      obj.code = 'resetFromContact';
      obj.email = email;
      setResetPasswordLoading(true);
      resetPassword(obj, 'resetFromContact')
        .then((res) => {
          if (res.error) {
            setResetPasswordLoading(false);
            showToast(
              TOASTTYPES.error,
              '',
              res?.error ? res?.error : 'Something went wrong.'
            );
          }
          if (res?.data?.response_type === 'success') {
            showToast(TOASTTYPES.success, '', res.data.message);
            setOpenResetPassword(false);
            setResetPasswordLoading(false);
            rpReset(null);
          }
          // setLoading(false);
        })
        .catch(() => {
          setResetPasswordLoading(false);
        });
    }
  };

  return (
    <Modal
      isOpen={openResetPassword}
      toggle={() => setOpenResetPassword(!openResetPassword)}
      className='modal-dialog-centered reset-password-modal'
      backdrop='static'
    >
      <ModalHeader toggle={() => setOpenResetPassword(!openResetPassword)}>
        Reset Password
      </ModalHeader>
      <ModalBody>
        <div className='mb-2'>
          <Form
            className='auth-login-form'
            onSubmit={rpHandleSubmit(onResetPasswordSubmit)}
            autoComplete='off'
          >
            <div>
              <FormField
                name='password'
                label='Password'
                placeholder='Enter Password'
                type='password'
                errors={rpError}
                control={rpControl}
              />
            </div>
            <div className='mt-1'>
              <FormField
                name='cpassword'
                label='Confirm Password'
                placeholder='Enter Confirm Password'
                type='password'
                errors={rpError}
                control={rpControl}
              />
            </div>
          </Form>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color='danger'
          onClick={() => setOpenResetPassword(!openResetPassword)}
        >
          Cancel
        </Button>
        <Form
          className='auth-login-form'
          onSubmit={rpHandleSubmit(onResetPasswordSubmit)}
          autoComplete='off'
        >
          <SaveButton
            width='180px'
            className='align-items-center justify-content-center'
            type='submit'
            loading={resetPasswordLoading}
            name={'Reset Password'}
          ></SaveButton>
        </Form>
      </ModalFooter>
    </Modal>
  );
};

export default ResetPassword;
