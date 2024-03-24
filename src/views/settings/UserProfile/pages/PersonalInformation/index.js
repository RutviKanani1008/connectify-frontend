import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  Label,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import ImageUpload from '../../../../../@core/components/form-fields/ImageUpload';
import ProgressBar from '../../../../../components/ProgressBar';
import { FormField } from '../../../../../@core/components/form-fields';
import { SaveButton } from '../../../../../@core/components/save-button';
import { personalInfoSchema } from './validation-schema';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import {
  storeUpdateUser,
  storeUser,
  userData,
} from '../../../../../redux/user';
import {
  checkVerification,
  sendVerification,
  updateUser,
  uploadFile,
  useRemoveAttachment,
} from '../../../../../api/auth';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import VerifyEmailModal from './components/VerifyEmailModal';
import ResetPasswordModal from '../../../../Admin/contact/components/ResetPasswordModal';

const PersonalInformation = () => {
  // ** Redux **
  const user = useSelector(userData);
  const dispatch = useDispatch();

  // ** Form **
  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    clearErrors,
    setError,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(personalInfoSchema),
  });

  // ** State **
  const [verificationCode, setVerificationCode] = useState('');
  const [socketSessionId, setSocketSessionId] = useState(undefined);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageResetting, setImageResetting] = useState(false);
  const [profileURL, setProfileURL] = useState();
  const [openVerifyOtp, setOpenVerifyOtp] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);
  const [buttonLoading, setButtonLoading] = useState({
    submitLoading: false,
    verifyEmailLoading: false,
  });
  const { removeAttachment } = useRemoveAttachment();

  const onSubmit = async (data) => {
    if (data) {
      const oldEmail = user?.email;
      const newEmail = getValues('email');

      if (newEmail !== oldEmail) {
        const result = await showWarnAlert({
          title: 'Are you sure?',
          text: 'Are you sure you would like to update your email?',
          footer: (
            <>
              <div style={{ color: 'red' }}>
                You will need to verify your new email to confirm this change.
                Be sure to check your spam.
              </div>
              ,
            </>
          ),
        });
        if (result.isConfirmed === false) {
          return;
        }
        setButtonLoading({ ...buttonLoading, submitLoading: true });
        const res = await sendVerification({ _id: user?._id, email: newEmail });
        if (!res.error) {
          setButtonLoading({ ...buttonLoading, submitLoading: false });
          return setOpenVerifyOtp(true);
        } else {
          setButtonLoading({ ...buttonLoading, submitLoading: false });
          return showToast(TOASTTYPES.error, null, res.error);
        }
      }

      await updateUserDetails();
    }
  };

  useEffect(() => {
    if (user) {
      reset(user);
      setProfileURL(user?.userProfile);
    }
  }, [user]);

  const updateUserDetails = async () => {
    const updatedUser = {
      _id: user._id,
      firstName: getValues('firstName'),
      lastName: getValues('lastName'),
      email: getValues('email'),
      biograpy: getValues('biograpy'),
      userProfile: getValues('userProfile'),
      phone: getValues('phone'),
    };

    setButtonLoading({ ...buttonLoading, submitLoading: true });
    const toastId = showToast(TOASTTYPES.loading);
    updateUser(updatedUser)
      .then((res) => {
        if (res.error) {
          if (res.errorData) {
            res.errorData.forEach((error) => {
              showToast(TOASTTYPES.error, toastId, error);
            });
          } else {
            showToast(TOASTTYPES.error, toastId, res.error);
          }
        } else {
          reset(null);
          dispatch(storeUser({ ...user, ...updatedUser }));
          showToast(TOASTTYPES.success, toastId, 'Profile Updated.');
        }
        setButtonLoading({ ...buttonLoading, submitLoading: false });
      })
      .catch(() => {
        setButtonLoading({ ...buttonLoading, submitLoading: false });
      });
  };

  const handleImageReset = async () => {
    setImageResetting(true);
    if (profileURL) {
      await removeAttachment({
        attachmentUrl: [profileURL],
        modelDetail: {
          model: 'users',
          id: user?._id,
        },
      });
    }
    setImageResetting(false);
    setValue('userProfile', null);
    setProfileURL('');
  };

  const sendRequestFileUpload = (e) => {
    clearErrors('userProfile');
    const file = e.target.files[0];
    e.target.value = null;
    const formData = new FormData();
    if (user?.company?._id) {
      formData.append('filePath', `${user.company._id}/profile-pictures`);
    } else {
      formData.append('filePath', `super-admin/profile-pictures`);
    }
    formData.append('image', file);
    formData.append('model', 'users');
    formData.append('field', 'userProfile');
    formData.append('id', user._id);
    formData.append('type', 'userProfile');
    setImageUploading(true);
    uploadFile(formData, socketSessionId)
      .then((res) => {
        setTimeout(() => {
          setUploadProgress(undefined);
        }, 1200);
        if (res.error) {
          setImageUploading(false);
        } else {
          if (res?.data?.data) {
            const userObj = JSON.parse(JSON.stringify(user));
            userObj.userProfile = res?.data?.data;
            dispatch(storeUpdateUser(userObj));
            setValue('fileUpload', null);
            setValue('userProfile', res.data.data);
            clearErrors('userProfile');
            setProfileURL(res.data.data);
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

  const sendVerificationMail = async () => {
    const newEmail = getValues('email');
    await sendVerification({ _id: user?._id, email: newEmail });
  };

  const checkVerificationCode = async (e) => {
    e.preventDefault();
    setButtonLoading({ ...buttonLoading, verifyEmailLoading: true });

    const oldEmail = user?.email;
    const res = await checkVerification({
      email: oldEmail,
      verificationCode: +verificationCode,
    });
    if (res.error) {
      showToast(TOASTTYPES.error, null, res.error);
      setButtonLoading({ ...buttonLoading, verifyEmailLoading: false });
      return;
    }
    await updateUserDetails();
    setOpenVerifyOtp(false);
    setVerificationCode('');
    setButtonLoading({ ...buttonLoading, verifyEmailLoading: false });
  };

  return (
    <>
      <Card className='personal-info-tab'>
        <CardHeader>
          <CardTitle className='text-primary w-100 d-flex justify-content-between'>
            <div className={`add-contact-title`}>Update Profile</div>
            <div className='d-flex align-item-center'>
              <Button
                color='primary'
                onClick={() => {
                  setOpenResetPassword(!openResetPassword);
                }}
              >
                Reset Password
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Form
            className='auth-login-form update-profile-form'
            onSubmit={handleSubmit(onSubmit)}
            autoComplete='off'
          >
            <div className='field-wrapper mb-1 upload-profile'>
              <Label className='' for='body'>
                Upload Profile
              </Label>
              <ImageUpload
                key={profileURL}
                url={
                  getValues('userProfile') &&
                  `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${getValues(
                    'userProfile'
                  )}`
                }
                fileSize={5}
                loading={imageUploading}
                resetLoading={imageResetting}
                handleUploadImage={sendRequestFileUpload}
                handleImageReset={handleImageReset}
                setError={setError}
                filename={'userProfile'}
                supportedFileTypes={['jpg', 'jpeg', 'svg', 'png', 'heic']}
                errors={errors}
                errorMessages={{
                  fileSize:
                    'Selected file size is too large, please upload image below 5 mb in size',
                }}
                enableErrorOptions={false}
              />
              <ProgressBar
                progress={uploadProgress}
                setProgress={setUploadProgress}
                setSocketSessionId={setSocketSessionId}
              />
            </div>
            <div className='field-wrapper mb-1 first-name'>
              <Label for='fname'>First Name</Label>
              <FormField
                placeholder='First Name'
                type='text'
                errors={errors}
                control={control}
                {...register(`firstName`)}
              />
            </div>
            <div className='field-wrapper mb-1 last-name'>
              <Label for='lname'>Last Name</Label>
              <FormField
                placeholder='Last Name'
                type='text'
                errors={errors}
                control={control}
                {...register(`lastName`)}
              />
            </div>
            <div className='field-wrapper mb-1 email'>
              <Label for='Email'>Email</Label>
              <FormField
                type='text'
                name='email'
                placeholder='john@example.com'
                errors={errors}
                control={control}
                {...register(`email`)}
              />
            </div>
            <div className='field-wrapper mb-1 phone'>
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

            <div className='field-wrapper mb-1 biography'>
              <Label for='mobile'>Biography</Label>
              <FormField
                type='textarea'
                name='biograpy'
                placeholder='Enter Biograpy'
                errors={errors}
                control={control}
                {...register(`biograpy`)}
              />
            </div>
            <div className='submit-btn-wrapper mt-2'>
              <SaveButton
                width='180px'
                type='submit'
                loading={buttonLoading.submitLoading}
                name={'Update Profile'}
              ></SaveButton>
            </div>
          </Form>
        </CardBody>
      </Card>
      {openResetPassword && (
        <ResetPasswordModal
          email={user?.email}
          openResetPassword={openResetPassword}
          setOpenResetPassword={setOpenResetPassword}
        />
      )}
      <VerifyEmailModal
        buttonLoading={buttonLoading}
        checkVerificationCode={checkVerificationCode}
        openVerifyOtp={openVerifyOtp}
        sendVerificationMail={sendVerificationMail}
        setOpenVerifyOtp={setOpenVerifyOtp}
        setVerificationCode={setVerificationCode}
        verificationCode={verificationCode}
      />
    </>
  );
};

export default PersonalInformation;
