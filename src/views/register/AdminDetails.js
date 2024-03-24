// ** React Imports
import React, { Fragment, useState } from 'react';

// ** Utils
import { isObjEmpty } from '@utils';

// ** Third Party Components
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ** Reactstrap Imports
import { Form, Label, Input, Button } from 'reactstrap';
import { required } from '../../configs/validationConstant';
// ** Styles
import '@styles/react/pages/page-authentication.scss';
import { FormField } from '@components/form-fields';

import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { useGetUser } from '../../api/auth';
import { ArrowLeft } from 'react-feather';
import { SaveButton } from '@components/save-button';

const RegisterSchema = yup.object().shape({
  firstName: yup.string().required(required('First Name')),
  lastName: yup.string().required(required('Last Name')),
  email: yup.string().email().required(required('Email')),
  phone: yup.string().required(required('Phone Number')),
  terms: yup.boolean().oneOf([true], 'Message').default(false),
});

const AdminDetails = ({ stepper, setFormData, formData, loading }) => {
  const [, setIsUserAlreadyRegistered] = useState(false);
  const { getUser } = useGetUser();

  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(RegisterSchema),
  });

  const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  const checkForEmail = async (e) => {
    if (
      e?.target?.value !== '' &&
      e?.target?.value !== null &&
      e?.target?.value !== undefined &&
      validateEmail(e.target.value)
    ) {
      const toastId = showToast(TOASTTYPES.loading);

      const res = await getUser({ email: e?.target?.value });
      if (res.error) {
        setError(
          'email',
          { type: 'focus', message: res.error },
          { shouldFocus: true }
        );
        showToast(TOASTTYPES.error, toastId, res.error);
        setIsUserAlreadyRegistered(true);
      } else {
        clearErrors('email');
        setIsUserAlreadyRegistered(false);
        showToast(TOASTTYPES.success, toastId, 'Email is available');
      }
    }
  };

  const onSubmit = (data) => {
    if (isObjEmpty(errors)) {
      data.isVerified = false;
      setFormData({ ...formData, admin: data });
      stepper.next();
    }
  };

  return (
    <>
      <div className='h5'>
        This information can be same or different than the company details
      </div>
      <Form
        className='auth-login-form mt-2'
        onSubmit={handleSubmit(onSubmit)}
        autoComplete='off'
      >
        <div className='mb-1'>
          <FormField
            label='First Name'
            name='firstName'
            placeholder='First Name'
            type='text'
            errors={errors}
            control={control}
          />
        </div>
        <div className='mb-1'>
          <FormField
            label='Last Name'
            name='lastName'
            placeholder='Last Name'
            type='text'
            errors={errors}
            control={control}
          />
        </div>
        <div className='mb-1'>
          <FormField
            label='Email'
            name='email'
            placeholder='john@example.com'
            type='text'
            onBlur={checkForEmail}
            errors={errors}
            control={control}
          />
        </div>
        <div className='mb-1'>
          <FormField
            type='phone'
            label='Phone Number'
            name='phone'
            placeholder='Phone Number'
            errors={errors}
            control={control}
          />
        </div>
        <div className='form-check mb-1'>
          <Controller
            name='terms'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type='checkbox'
                id='terms'
                invalid={errors.terms && true}
              />
            )}
          />
          <Label className='form-check-label' for='terms'>
            I accept the
            <a
              href={`https://xyz.com/terms`}
              className='ms-25'
              target='_blank'
              rel='noreferrer'
            >
              terms & conditions.
            </a>
          </Label>
        </div>
        <div className='submit-btn-prev-submit-wrapper'>
          <Button
            type='button'
            color='primary'
            className='btn-prev'
            onClick={() => stepper.previous()}
          >
            <ArrowLeft size={14} className='align-middle me-25'></ArrowLeft>
            <span className='align-middle d-sm-inline-block'>Previous</span>
          </Button>
          <SaveButton
            className='admin-detail-save-btn'
            type='submit'
            block
            name='Submit'
            loading={loading}
          />
        </div>
      </Form>
    </>
  );
};

export default AdminDetails;
