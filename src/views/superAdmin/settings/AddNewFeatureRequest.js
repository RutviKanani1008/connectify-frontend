import React, { useEffect, useState } from 'react';
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
import { required } from '../../../configs/validationConstant';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { saveFeatureRequest, sendReqFileUpload } from '../../../api/profile';
import ImageUpload from '../../../@core/components/form-fields/ImageUpload';
import ProgressBar from '../../../components/ProgressBar';

const companyScheme = yup.object().shape({
  firstName: yup.string().required(required('First Name')),
  lastName: yup.string().required(required('last Name')),
  email: yup.string().email().required(required('Email')),
  requestMessage: yup.string().required(required('Message')),
});

const AddNewFeatureRequest = (props) => {
  const { openAddNewFeatureRequest, handleCloseAddFeatureRequest } = props;
  const [fileUpload, setFileUpload] = useState(false);
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

  const [loading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState({
    submitLoading: false,
  });
  const [socketSessionId, setSocketSessionId] = useState(undefined);
  const [uploadProgress, setUploadProgress] = useState(null);

  const onSubmit = async (data) => {
    try {
      if (fileUpload) {
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
            handleCloseAddFeatureRequest(true);
            showToast(TOASTTYPES.success, toastId, 'Done');
          }
          setButtonLoading({ submitLoading: false });
        });
      } else {
        setError(
          'fileUpload',
          { type: 'required', message: 'File is required' },
          { shouldFocus: true }
        );
      }
    } catch (error) {
      setButtonLoading({ submitLoading: false });
    }
  };

  useEffect(() => {
    reset({});
  }, []);

  const sendRequestfileUpload = (e) => {
    const file = e.target.files[0];

    console.log({ socketSessionId });

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
            setFileUpload(true);
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
    setFileUpload(false);
    setValue('fileUpload', null);
  };

  return (
    <UILoader blocking={loading}>
      <Modal
        scrollable={true}
        isOpen={openAddNewFeatureRequest}
        className={`modal-dialog-centered feature-request-preview`}
        toggle={() => handleCloseAddFeatureRequest(null)}
        size={'lg'}
        backdrop='static'
      >
        <ModalHeader
          tag={'h5'}
          toggle={() => handleCloseAddFeatureRequest(null)}
        >
          Add Feature Request
        </ModalHeader>

        <ModalBody>
          <Form
            className='auth-login-form mt-2'
            onSubmit={handleSubmit(onSubmit)}
            autoComplete='off'
          >
            <Row className='mb-1'>
              <div className='fw-bold my-2 h5 text-primary mt-0'>
                Tell us what feature you would like to see added with future
                updates.
              </div>
              <Label sm='4' for='fname'>
                First Name
              </Label>
              <Col sm='8'>
                <FormField
                  placeholder='First Name'
                  type='text'
                  errors={errors}
                  control={control}
                  {...register(`firstName`)}
                />
              </Col>
            </Row>

            <Row className='mb-1'>
              <Label sm='4' for='lname'>
                Last Name
              </Label>
              <Col sm='8'>
                <FormField
                  placeholder='Last Name'
                  type='text'
                  errors={errors}
                  control={control}
                  {...register(`lastName`)}
                />
              </Col>
            </Row>

            <Row className='mb-1'>
              <Label sm='4' for='email'>
                Email
              </Label>
              <Col sm='8'>
                <FormField
                  type='text'
                  name='email'
                  placeholder='john@example.com'
                  errors={errors}
                  control={control}
                  {...register(`email`)}
                />
              </Col>
            </Row>

            <Row className='mb-1'>
              <Label sm='4' for='mobile'>
                Phone Number
              </Label>
              <Col sm='8'>
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

            <Row className='mb-1'>
              <Label sm='4' for='requestedMessage'>
                Message
              </Label>
              <Col sm='8'>
                <FormField
                  placeholder='What feature would you like to see with future updates? Please be as specific as possible and add screenshots if capable'
                  type='textarea'
                  errors={errors}
                  control={control}
                  {...register(`requestMessage`)}
                />
              </Col>
            </Row>
            <Row className='mb-1'>
              <Label sm='4' for='body'>
                Upload Screenshot
              </Label>
              <Col sm='8'>
                <ImageUpload
                  url={
                    fileUploadURL &&
                    `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${fileUploadURL}`
                  }
                  handleUploadImage={sendRequestfileUpload}
                  handleImageReset={handleImageReset}
                  loading={imageUploading}
                  isFileLogo={true}
                  uploadTitle='Upload Attachment'
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
              </Col>
            </Row>

            <Row>
              <Col
                className='mt-2 d-flex align-items-center justify-content-center'
                md={{ size: 6, offset: 3 }}
              >
                <SaveButton
                  width='40%'
                  type='submit'
                  loading={buttonLoading.submitLoading}
                  name={'Submit'}
                ></SaveButton>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>
    </UILoader>
  );
};

export default AddNewFeatureRequest;
