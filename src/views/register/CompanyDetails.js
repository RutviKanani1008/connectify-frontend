// ** React Imports
import React, { useState } from 'react';

// ** Utils
import { isObjEmpty } from '@utils';

// ** Third Party Components
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ** Reactstrap Imports
import { Form, Button } from 'reactstrap';
import { required } from '../../configs/validationConstant';
// ** Styles
import '@styles/react/pages/page-authentication.scss';
import { FormField } from '@components/form-fields';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { uploadFile, useGetUser } from '../../api/auth';
import { ArrowRight } from 'react-feather';
import ImageUpload from '../../@core/components/form-fields/ImageUpload';
import defaultCompanyLogo from '@src/assets/images/blank/no-image.png';

const RegisterSchema = yup.object().shape({
  companyLogo: yup.string().required(required('Company Logo')).nullable(),
  name: yup.string().required(required('Company')),
  website: yup
    .string()
    .matches(
      /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?\/?$/,
      'Please enter valid website'
    )
    .required('Please enter website'),
  email: yup.string().email().required(required('Email')),
  phone: yup.string().required(required('Phone Number')),
  address1: yup.string().required(required('address 1')),
  address2: yup.string(),
  city: yup.string(),
  state: yup.string(),
  zipcode: yup.string(),
});

const CompanyDetails = ({ stepper, setFormData, formData }) => {
  const [isUserAlreadyRegistered, setIsUserAlreadyRegistered] = useState(false);
  const [fileUpload, setFileUpload] = useState(false);
  const [fileUploadURL, setFileUploadURL] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const { getUser } = useGetUser();

  const {
    control,
    setValue,
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
    let flag = 1;
    if (isUserAlreadyRegistered) {
      setError(
        'email',
        { type: 'focus', message: 'Email already exists' },
        { shouldFocus: true }
      );
      flag = 0;
    }
    if (!fileUpload) {
      setError(
        'companyLogo',
        { type: 'focus', message: 'Company Logo is required.' },
        { shouldFocus: true }
      );
      flag = 0;
    }
    if (isObjEmpty(errors) && flag) {
      data['companyLogo'] = fileUploadURL;
      data.role = 'admin';
      setFormData({ ...formData, company: data });
      stepper.next();
    }
  };

  const userProfileUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    const formData = new FormData();
    formData.append('filePath', `register/profile-pictures`);
    formData.append('image', file);
    setImageUploading(true);
    uploadFile(formData).then((res) => {
      if (res.error) {
        setImageUploading(false);
      } else {
        if (res?.data?.data) {
          setFileUpload(true);
          setFileUploadURL(res?.data?.data);
          setValue('companyLogo', res?.data?.data);
          clearErrors('companyLogo');
        }
        setImageUploading(false);
      }
    });
  };
  const handleImageReset = () => {
    setFileUploadURL(false);
    setValue('companyLogo', null);
    setFileUpload(false);
  };
  return (
    <>
      <Form
        className='auth-login-form mt-2'
        onSubmit={handleSubmit(onSubmit)}
        autoComplete='off'
      >
        <div className='mb-1'>
          <FormField
            label='Company Name'
            name='name'
            placeholder='Company Name'
            type='text'
            errors={errors}
            control={control}
          />
        </div>
        <div className='mb-1'>
          <FormField
            label='Website'
            name='website'
            placeholder='enter your website...'
            type='text'
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
            label='Address Line 1'
            name='address1'
            placeholder='Address Line 1'
            type='text'
            errors={errors}
            control={control}
          />
        </div>
        <div className='mb-1'>
          <FormField
            label='Address Line 2'
            name='address2'
            placeholder='Address Line 2'
            type='text'
            errors={errors}
            control={control}
          />
        </div>
        <div className='mb-1'>
          <FormField
            label='City'
            name='city'
            placeholder='City'
            type='text'
            errors={errors}
            control={control}
          />
        </div>
        <div className='mb-1'>
          <FormField
            label='State'
            name='state'
            placeholder='State'
            type='text'
            errors={errors}
            control={control}
          />
        </div>
        <div className='mb-1'>
          <FormField
            label='Zip Code'
            name='zipcode'
            placeholder='Zip Code'
            type='number'
            errors={errors}
            control={control}
          />
        </div>
        <div className='mb-1 mt-1'>
          <label className='form-label company-logo-label'>Company Logo</label>
          <ImageUpload
            url={
              fileUploadURL &&
              `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${fileUploadURL}`
            }
            handleUploadImage={userProfileUpload}
            handleImageReset={handleImageReset}
            loading={imageUploading}
            defaultImage={defaultCompanyLogo}
            supportedFileTypes={['jpg', 'jpeg', 'svg', 'png', 'heic']}
            setError={setError}
            filename='companyLogo'
            errors={errors}
          />
          {errors?.companyLogo && errors?.companyLogo?.type === 'required' && (
            <span
              className='text-danger block'
              style={{ fontSize: '0.857rem' }}
            >
              Profile logo is required
            </span>
          )}
        </div>

        <div className='submit-btn-wrapper'>
          <Button type='submit' color='primary' className='btn-next'>
            <span className='align-middle d-sm-inline-block'>Next</span>
            <ArrowRight size={14} className='align-middle ms-25'></ArrowRight>
          </Button>
        </div>
      </Form>
    </>
  );
};

export default CompanyDetails;
