import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import UILoader from '@components/ui-loader';
import {
  Row,
  Col,
  Form,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { userData } from '../../redux/user';
import ThankYou from '../../components/ThankYou';
import { required } from '../../configs/validationConstant';
import { saveFeatureRequest, sendReqFileUpload } from '../../api/profile';
import ImageUpload from '../../@core/components/form-fields/ImageUpload';
import ProgressBar from '../../components/ProgressBar';
import { useRemoveAttachment } from '../../api/auth';

const companyScheme = yup.object().shape({
  firstName: yup.string().required(required('First Name')),
  lastName: yup.string().required(required('last Name')),
  email: yup.string().email().required(required('Email')),
  requestMessage: yup.string().required(required('Message')),
});

const AddFeatureRequest = ({ open, onClose, onNewAdded }) => {
  const user = useSelector(userData);
  const isSuperAdmin = user?.role === 'superadmin';

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

  const [loading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [fileUploadURL, setFileUploadURL] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [socketSessionId, setSocketSessionId] = useState(undefined);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [buttonLoading, setButtonLoading] = useState({
    submitLoading: false,
  });
  const [removeAttachments, setRemoveAttachments] = useState([]);
  const { removeAttachment } = useRemoveAttachment();

  useEffect(() => {
    setShowThankYou(false);
    setFileUploadURL(false);

    if (!isSuperAdmin) {
      reset({
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        phone: user?.phone,
      });
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      const toastId = showToast(TOASTTYPES.loading);
      data['uploadFileURL'] = fileUploadURL;
      data.removeAttachments = removeAttachments;
      setButtonLoading({ submitLoading: true });
      saveFeatureRequest(data).then((res) => {
        setRemoveAttachments([]);
        setFileUploadURL(false);
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

          if (isSuperAdmin) {
            reset();
            setFileUploadURL([]);
            onNewAdded();
            onClose();
          } else {
            setShowThankYou(true);
            onNewAdded();
          }
        }
        setButtonLoading({ submitLoading: false });
      });
    } catch (error) {
      setButtonLoading({ submitLoading: false });
    }
  };

  const sendRequestfileUpload = (e) => {
    const file = e.target.files[0];

    e.target.value = null;
    const formData = new FormData();
    formData.append('filePath', `super-admin/feature-request`);
    formData.append('file', file);
    if (fileUploadURL) {
      setRemoveAttachments([...removeAttachments, fileUploadURL]);
    }
    setImageUploading(true);
    sendReqFileUpload(formData, socketSessionId)
      .then((res) => {
        setTimeout(() => {
          setUploadProgress(undefined);
        }, 1200);
        if (res.error) {
          setImageUploading(false);
        } else {
          if (res?.data?.data?.length) {
            setFileUploadURL(res.data.data[0]);
            setValue('fileUpload', res.data.data[0]);
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

  const handleImageReset = async () => {
    if (fileUploadURL) {
      setRemoveAttachments([...removeAttachments, fileUploadURL]);
    }
    setFileUploadURL(false);
    setValue('fileUpload', null);
  };

  const handleCloseModal = async () => {
    onClose(false);
    if (removeAttachments.length || fileUploadURL) {
      await removeAttachment({
        attachmentUrl: [...removeAttachments, fileUploadURL],
      });
      setRemoveAttachments([]);
    }
  };

  return (
    <UILoader blocking={loading}>
      <Modal
        scrollable={true}
        isOpen={open}
        className={`modal-dialog-centered ${
          showThankYou
            ? 'thankyou-modal'
            : 'add-feature-request-modal modal-dialog-mobile'
        }`}
        toggle={() => {
          handleCloseModal();
        }}
        size={'lg'}
        backdrop='static'
        fade={false}
      >
        <ModalHeader tag={'h5'} toggle={() => handleCloseModal()}>
          Add Feature Request
        </ModalHeader>

        <ModalBody>
          {showThankYou ? (
            <>
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
            </>
          ) : (
            <Form
              className='auth-login-form'
              onSubmit={handleSubmit(onSubmit)}
              autoComplete='off'
            >
              <div className='mobile-scroll hide-scrollbar'>
                <p className='title'>
                  Tell us what feature you would like to see added with future
                  updates.
                </p>
                <Row className=''>
                  <Col className='mb-1' sm='6'>
                    <Label className='' for='fname'>
                      First Name
                    </Label>
                    <FormField
                      placeholder='First Name'
                      type='text'
                      errors={errors}
                      control={control}
                      {...register(`firstName`)}
                    />
                  </Col>
                  <Col className='mb-1' sm='6'>
                    <Label for='fname'>Last Name</Label>
                    <FormField
                      placeholder='Last Name'
                      type='text'
                      errors={errors}
                      control={control}
                      {...register(`lastName`)}
                    />
                  </Col>
                </Row>

                <Row className=''>
                  <Col className='mb-1' sm='6'>
                    <Label for='email'>Email</Label>
                    <FormField
                      type='text'
                      name='email'
                      placeholder='john@example.com'
                      errors={errors}
                      control={control}
                      {...register(`email`)}
                    />
                  </Col>
                  <Col className='mb-1' sm='6'>
                    <Label for='mobile'>Phone Number</Label>
                    <FormField
                      type='phone'
                      name='phone'
                      placeholder='Phone Number'
                      errors={errors}
                      control={control}
                      {...register(`phone`)}
                    />
                  </Col>
                </Row>

                <Row className=''>
                  <Col className='mb-1' sm='12'>
                    <Label for='requestedMessage'>Message</Label>
                    <FormField
                      placeholder='What feature would you like to see with future updates? Please be as specific as possible and add screenshots if capable'
                      type='textarea'
                      errors={errors}
                      control={control}
                      {...register(`requestMessage`)}
                    />
                  </Col>
                </Row>
                <Row className=''>
                  <Col className='mb-1' sm='12'>
                    <Label for='body'>Upload Screenshot</Label>
                    <ImageUpload
                      url={
                        fileUploadURL?.length &&
                        `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${fileUploadURL}`
                      }
                      handleUploadImage={sendRequestfileUpload}
                      handleImageReset={handleImageReset}
                      loading={imageUploading}
                      isFileLogo={true}
                      uploadTitle='Upload Attachment'
                      fileSize={5}
                      filename='fileUpload'
                      setError={setError}
                      errors={errors}
                    />
                    <ProgressBar
                      progress={uploadProgress}
                      setProgress={setUploadProgress}
                      setSocketSessionId={setSocketSessionId}
                    />
                  </Col>
                </Row>
              </div>
              <div className='submit-btn-wrapper'>
                <SaveButton
                  type='submit'
                  loading={buttonLoading.submitLoading}
                  name={'Submit'}
                ></SaveButton>
              </div>
            </Form>
          )}
        </ModalBody>
      </Modal>
    </UILoader>
  );
};

export default AddFeatureRequest;
