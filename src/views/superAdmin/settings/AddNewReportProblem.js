import React, { useEffect, useState } from 'react';
import UILoader from '@components/ui-loader';
import {
  Form,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  ModalFooter,
} from 'reactstrap';
import * as yup from 'yup';
import { required } from '../../../configs/validationConstant';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { saveSendeRequest, sendReqFileUpload } from '../../../api/profile';

import ImageUpload from '../../../@core/components/form-fields/ImageUpload';
import ProgressBar from '../../../components/ProgressBar';

const companyScheme = yup.object().shape({
  fileUpload: yup
    .array()
    .of(yup.string().required(required('File')))
    .nullable(),
  // fileUpload1: yup.string().required(required('File')).nullable(),
  firstName: yup.string().required(required('First Name')),
  lastName: yup.string().required(required('last Name')),
  email: yup.string().email().required(required('Email')),
  body: yup.string().required(required('body')),
});

const AddNewReportProblem = (props) => {
  const { openAddNewReport, handleCloseAddReportModal } = props;
  const {
    control,
    handleSubmit,
    register,
    setError,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(companyScheme),
  });

  const [loading] = useState(false);
  const [fileUpload, setFileUpload] = useState(false);
  const [fileUploadURL, setFileUploadURL] = useState(false);
  const [fileName, setFileName] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  //   const user = useSelector(userData);
  const [socketSessionId, setSocketSessionId] = useState(undefined);
  const [uploadProgress, setUploadProgress] = useState(null);

  const [buttonLoading, setButtonLoading] = useState({
    submitLoading: false,
  });

  const onSubmit = async (data) => {
    if (fileUpload) {
      const toastId = showToast(TOASTTYPES.loading);
      data['uploadFileURL'] = fileUploadURL;
      data['fileName'] = fileName;
      setButtonLoading({ submitLoading: true });
      saveSendeRequest(data)
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
            showToast(TOASTTYPES.success, toastId, 'Done');
            handleCloseAddReportModal(true);
          }
          setButtonLoading({ submitLoading: false });
        })
        .catch(() => {
          setButtonLoading({ submitLoading: false });
        });
    } else {
      setError(
        'fileUpload',
        { type: 'focus', message: 'File is required' },
        { shouldFocus: true }
      );
    }
  };

  const sendRequestfileUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    const formData = new FormData();
    formData.append('filePath', `super-admin/report-problem`);
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
            setFileUploadURL(res.data.data);
            setFileName(file.name);
            setFileUpload(true);
            setValue('fileUpload', res.data.data);
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
    setFileName(false);
    setFileUpload(false);
    setValue('fileUpload', null);
  };

  useEffect(() => {
    setFileUploadURL(false);
    setFileName(false);
    reset({});
  }, []);

  return (
    <UILoader blocking={loading}>
      <Modal
        isOpen={openAddNewReport}
        className={`add-support-ticket-modal`}
        toggle={() => handleCloseAddReportModal(null)}
        size={'lg'}
        backdrop='static'
      >
        <ModalHeader tag={'h5'} toggle={() => handleCloseAddReportModal(null)}>
          Add Support Ticket
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
          <ModalBody>
            <div className='mb-1'>
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
            </div>

            <div className='mb-1'>
              <Label for='lname'>Last Name</Label>
              <FormField
                placeholder='Last Name'
                type='text'
                errors={errors}
                control={control}
                {...register(`lastName`)}
              />
            </div>

            <div className='mb-1'>
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

            <div className='mb-1'>
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
            <div className='mb-1'>
              <Label for='body'>Message</Label>
              <FormField
                name='body'
                placeholder='Message'
                type='textarea'
                errors={errors}
                control={control}
                {...register(`body`)}
              />
            </div>

            <div className='mb-1'>
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
            </div>
          </ModalBody>
          <ModalFooter>
            <SaveButton
              width='148px'
              className='btn btn-primary'
              type='submit'
              loading={buttonLoading.submitLoading}
              name={'Submit'}
            ></SaveButton>
            <Button
              width='148px'
              className='btn btn-danger'
              onClick={() => handleCloseAddReportModal()}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </UILoader>
  );
};

export default AddNewReportProblem;
