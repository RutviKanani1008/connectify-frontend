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
import { required } from '../../configs/validationConstant';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { saveSendeRequest, sendReqFileUpload } from '../../api/profile';

import { useSelector } from 'react-redux';
import { userData } from '../../redux/user';
import ThankYou from '../../components/ThankYou';
import ProgressBar from '../../components/ProgressBar';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
} from '../../constant';
import NewTaskManagerFileDropZone from '../../@core/components/form-fields/NewTaskManagerFileSropZone';
import { useRemoveAttachment } from '../../api/auth';
// import ImageUpload from '../../@core/components/form-fields/ImageUpload';

const companyScheme = yup.object().shape({
  firstName: yup.string().required(required('First Name')),
  lastName: yup.string().required(required('last Name')),
  email: yup.string().email().required(required('Email')),
  body: yup.string().required(required('body')),
});

const AddReportProblem = ({ open, onClose, onNewAdded }) => {
  const user = useSelector(userData);
  const isSuperAdmin = user?.role === 'superadmin';

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
  const [showThankYou, setShowThankYou] = useState(false);
  const [fileUploadURL, setFileUploadURL] = useState([]);
  const [fileName, setFileName] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [socketSessionId, setSocketSessionId] = useState(undefined);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [buttonLoading, setButtonLoading] = useState({
    submitLoading: false,
  });
  const { removeAttachment } = useRemoveAttachment();
  const [removeAttachments, setRemoveAttachments] = useState([]);

  useEffect(() => {
    setShowThankYou(false);
    setFileUploadURL([]);
    setFileName(false);

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
    const toastId = showToast(TOASTTYPES.loading);
    data['uploadFileURL'] = fileUploadURL;
    data['fileName'] = fileName;
    data.removeAttachments = removeAttachments;
    setButtonLoading({ submitLoading: true });
    saveSendeRequest(data)
      .then((res) => {
        setRemoveAttachments([]);
        setFileUploadURL([]);
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
          if (isSuperAdmin) {
            reset();
            setFileUploadURL([]);
            setFileName(false);
            onNewAdded();
            onClose();
          } else {
            setShowThankYou(true);
            onNewAdded();
          }
        }
        setButtonLoading({ submitLoading: false });
      })
      .catch(() => {
        setButtonLoading({ submitLoading: false });
      });
  };

  const onFileUpload = (files) => {
    const formData = new FormData();
    formData.append('filePath', `super-admin/report-problem`);
    files?.forEach((file) => {
      if (!file?.url) {
        formData.append('attachments', file);
      }
    });
    setImageUploading(true);
    if (files.length && files.filter((file) => !file?.url)?.length) {
      sendReqFileUpload(formData, socketSessionId)
        .then((res) => {
          setTimeout(() => {
            setUploadProgress(undefined);
          }, 1200);
          if (res.error) {
            setImageUploading(false);
          } else {
            if (res?.data?.data) {
              const fileObj = [];
              const latestUpdate = files.filter((f) => f.lastModified);
              res?.data?.data.map((data, index) => {
                const obj = {};
                obj.fileUrl = data;
                obj.fileName = latestUpdate[index].name;
                fileObj.push(obj);
              });
              setValue('attachments', [...fileUploadURL, ...fileObj]);
              setFileUploadURL([...fileUploadURL, ...fileObj]);
              clearErrors('attachments');
            }
            setImageUploading(false);
          }
        })
        .catch(() => {
          setTimeout(() => {
            setUploadProgress(undefined);
          }, 1200);
        });
    }
  };

  const removeUploadFile = (removeIndex) => {
    setRemoveAttachments([
      ...removeAttachments,
      ...(removeIndex > -1
        ? [fileUploadURL[removeIndex].fileUrl]
        : [...fileUploadURL.map((attachment) => attachment?.fileUrl)]),
    ]);

    setFileUploadURL(
      removeIndex > -1
        ? fileUploadURL.filter((url, index) => index !== removeIndex)
        : []
    );
  };

  const handleCloseModal = async () => {
    onClose(false);
    if (removeAttachments.length || fileUploadURL.length) {
      const tempCurrentAttachments = [
        ...fileUploadURL.map((attachment) => attachment?.fileUrl),
      ];
      await removeAttachment({
        attachmentUrl: [...removeAttachments, ...tempCurrentAttachments],
      });
    }
  };

  return (
    <UILoader blocking={loading}>
      <>
        <Modal
          fade={false}
          isOpen={open}
          toggle={() => handleCloseModal()}
          className={`modal-dialog-centered ${
            showThankYou
              ? 'thankyou-modal'
              : 'report-problem-modal modal-dialog-mobile'
          }`}
          backdrop='static'
          size='lg'
        >
          <ModalHeader tag={'h5'} toggle={() => handleCloseModal()}>
            Add Support Ticket
          </ModalHeader>
          <ModalBody>
            {showThankYou ? (
              <ThankYou
                message='We will review your submission and let you know if we have any questions.'
                btnText='Report Another Problem'
                onClickEvent={() => {
                  reset();
                  setFileUploadURL([]);
                  setFileName(false);
                  setShowThankYou(!showThankYou);
                }}
              />
            ) : (
              <Form
                className='report-problem-form'
                onSubmit={handleSubmit(onSubmit)}
                autoComplete='off'
              >
                <div className='scroll-wrapper'>
                  <div className='inner-wrapper'>
                    {!isSuperAdmin && (
                      <>
                        <div className='report-problem-header'>
                          <p className='title'>
                            Here's some general troubleshooting steps you can do
                            before reporting a problem to us.
                          </p>
                          <ul className='fancy-ul with-number'>
                            <li className='item'>Try relogin to CRM</li>
                            <li className='item'>
                              Clear cache of browser by ctrl + shift + R (on
                              chrome) or cmd + shift + R (on safari)
                            </li>
                          </ul>
                        </div>
                        <div className='report-problem-form-info-text mb-2 mt-2'>
                          <p className='text'>
                            Tell us what problem you have encountered.
                          </p>
                          <p className='text'>
                            Be specific and upload a screenshot if possible.
                          </p>
                        </div>
                      </>
                    )}
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
                        <Label for='lname'>Last Name</Label>
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
                        <Label for='Email'>Email</Label>
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
                        <Label for='body'>Message</Label>
                        <FormField
                          name='body'
                          placeholder='Message'
                          type='textarea'
                          errors={errors}
                          control={control}
                          {...register(`body`)}
                        />
                      </Col>
                    </Row>

                    <ProgressBar
                      progress={uploadProgress}
                      setProgress={setUploadProgress}
                      setSocketSessionId={setSocketSessionId}
                    />
                  </div>
                  {errors?.attachments ? (
                    <span className='text-danger block'>
                      File upload max upto 5mb
                      {errors?.attachments?.message}
                    </span>
                  ) : null}
                  <div className='attachment-save-btn-wrapper'>
                    <NewTaskManagerFileDropZone
                      setError={setError}
                      filesUpload={onFileUpload}
                      removeFile={removeUploadFile}
                      fileURLArray={fileUploadURL}
                      accept={AVAILABLE_FILE_FORMAT}
                      fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
                      fieldName='attachments'
                      loading={imageUploading}
                      multiple={true}
                    />
                  </div>
                </div>
                <div className='d-flex align-items-center justify-content-end mt-0 submit-btn-wrapper'>
                  <SaveButton
                    width=''
                    className='align-items-center justify-content-center'
                    type='submit'
                    loading={buttonLoading.submitLoading}
                    name={'Submit'}
                  ></SaveButton>
                </div>
              </Form>
            )}
          </ModalBody>
        </Modal>
      </>
    </UILoader>
  );
};

export default AddReportProblem;
