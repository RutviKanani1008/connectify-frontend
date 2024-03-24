import React, { useEffect, useState } from 'react';
import UILoader from '@components/ui-loader';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  // Row,
  // Col,
  Form,
  Label,
} from 'reactstrap';
import * as yup from 'yup';
import { required } from '../../configs/validationConstant';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { saveFeatureRequest, sendReqFileUpload } from '../../api/profile';
import { useSelector } from 'react-redux';
import { userData } from '../../redux/user';
import ImageUpload from '../../@core/components/form-fields/ImageUpload';
import ThankYou from '../../components/ThankYou';
import ProgressBar from '../../components/ProgressBar';

const companyScheme = yup.object().shape({
  firstName: yup.string().required(required('First Name')),
  lastName: yup.string().required(required('last Name')),
  email: yup.string().email().required(required('Email')),
  requestMessage: yup.string().required(required('Message')),
});

const FeatureRequest = () => {
  const [showThankYou, setShowThankYou] = useState(false);
  const [fileUploadURL, setFileUploadURL] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(companyScheme),
  });

  const user = useSelector(userData);

  const [loading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState({
    submitLoading: false,
  });
  const [socketSessionId, setSocketSessionId] = useState(undefined);
  const [uploadProgress, setUploadProgress] = useState(null);

  const onSubmit = async (data) => {
    try {
      setButtonLoading({ submitLoading: true });
      const toastId = showToast(TOASTTYPES.loading);
      saveFeatureRequest(data).then((res) => {
        if (res.error) {
          if (res?.errorData) {
            res.errorData.forEach((error) => {
              showToast(TOASTTYPES.error, toastId, error);
            });
          } else {
            showToast(TOASTTYPES.error, toastId, res.error);
          }
        } else {
          showToast(TOASTTYPES.success, toastId, 'Done');
          setShowThankYou(true);
        }
        setButtonLoading({ submitLoading: false });
      });
    } catch (error) {
      setButtonLoading({ submitLoading: false });
    }
  };

  useEffect(() => {
    setShowThankYou(false);
    reset({
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      phone: user?.phone,
    });
  }, []);

  const sendRequestfileUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    const formData = new FormData();
    formData.append('filePath', `super-admin/feature-request`);
    formData.append('file', file);
    setImageUploading(true);
    sendReqFileUpload(formData, socketSessionId)
      .then((res) => {
        setTimeout(() => {
          setUploadProgress(undefined);
        }, 1200);
        if (res.error) {
          setImageUploading(false);
        } else {
          if (res?.data?.data) {
            setFileUploadURL(res?.data?.data);
            setValue('fileUpload', res?.data?.data);
            clearErrors('fileUpload');
          }
          setImageUploading(false);
        }
      })
      .catch(() => {
        setTimeout(() => {
          setUploadProgress(undefined);
        }, 1200);
      });
  };

  const handleImageReset = () => {
    setFileUploadURL(false);
    setValue('fileUpload', null);
  };

  return (
    <UILoader blocking={loading}>
      <Card className='feature-request-card'>
        <CardHeader>
          <CardTitle className='text-primary'>Feature Request</CardTitle>
        </CardHeader>
        <CardBody>
          {showThankYou ? (
            <ThankYou
              message='We will review your request and let you know if we have any questions!'
              btnText='Submit Another Feature Request'
              onClickEvent={() => {
                reset();
                setShowThankYou(!showThankYou);
                setImageUploading(false);
                setFileUploadURL(false);
              }}
            />
          ) : (
            <Form
              className='auth-login-form mt-2 feature-request-form'
              onSubmit={handleSubmit(onSubmit)}
              autoComplete='off'
            >
              <p className='normal-text'>
                Tell us what feature you would like to see added with future
                updates.
              </p>
              <div className='field-wrapper mb-1'>
                <Label for='fname'>First Name</Label>
                <FormField
                  placeholder='First Name'
                  type='text'
                  errors={errors}
                  control={control}
                  {...register(`firstName`)}
                />
              </div>

              <div className='field-wrapper mb-1'>
                <Label for='lname'>Last Name</Label>
                <FormField
                  placeholder='Last Name'
                  type='text'
                  errors={errors}
                  control={control}
                  {...register(`lastName`)}
                />
              </div>

              <div className='field-wrapper mb-1'>
                <Label for='email'>Email</Label>
                <FormField
                  type='text'
                  name='email'
                  placeholder='john@example.com'
                  errors={errors}
                  control={control}
                  {...register(`email`)}
                />
              </div>

              <div className='field-wrapper mb-1'>
                <Label for='mobile'>Phone Number</Label>
                <FormField
                  type='phone'
                  name='phone'
                  placeholder='Phone Number'
                  errors={errors}
                  control={control}
                  {...register(`phone`)}
                />
              </div>

              <div className='field-wrapper mb-1'>
                <Label for='requestedMessage'>Message</Label>
                <FormField
                  placeholder='What feature would you like to see with future updates? Please be as specific as possible and add screenshots if capable'
                  type='textarea'
                  errors={errors}
                  control={control}
                  {...register(`requestMessage`)}
                />
              </div>
              <div className='field-wrapper mb-1'>
                <Label for='body'>Upload Screenshot</Label>
                <ImageUpload
                  url={
                    fileUploadURL &&
                    `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${fileUploadURL}`
                  }
                  handleUploadImage={sendRequestfileUpload}
                  handleImageReset={handleImageReset}
                  loading={imageUploading}
                  isFileLogo={true}
                  fileSize={5}
                  filename='fileUpload'
                  setError={setError}
                  errors={errors}
                />
                {errors?.fileUpload &&
                  errors?.fileUpload?.type === 'required' && (
                    <span
                      className='text-danger block'
                      style={{ fontSize: '0.857rem' }}
                    >
                      File is required!
                    </span>
                  )}

                <ProgressBar
                  progress={uploadProgress}
                  setProgress={setUploadProgress}
                  setSocketSessionId={setSocketSessionId}
                />
              </div>
              <div className='submit-btn-wrapper mt-2'>
                <SaveButton
                  width='180px'
                  type='submit'
                  loading={buttonLoading.submitLoading}
                  name={'Submit'}
                ></SaveButton>
              </div>
            </Form>
          )}
        </CardBody>
      </Card>
    </UILoader>
  );
};

export default FeatureRequest;
