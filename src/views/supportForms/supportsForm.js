import React, { useState } from 'react';

// ** React Imports
import { Link } from 'react-router-dom';
// ** Reactstrap Imports
import {
  // Card,
  CardBody,
  CardTitle,
  Col,
  Form,
  Label,
  Row,
} from 'reactstrap';

// ** Styles
import '@styles/react/pages/page-authentication.scss';
import UILoader from '@components/ui-loader';
import themeConfig from '../../configs/themeConfig';
import { FormField } from '../../@core/components/form-fields';
import { useForm, useWatch } from 'react-hook-form';
import { SaveButton } from '../../@core/components/save-button';
import ProgressBar from '../../components/ProgressBar';
import {
  saveFeatureRequest,
  saveSendeRequest,
  sendReqFileUpload,
} from '../../api/profile';
import ImageUpload from '../../@core/components/form-fields/ImageUpload';
import * as yup from 'yup';
import { required } from '../../configs/validationConstant';
import { yupResolver } from '@hookform/resolvers/yup';
import { TOASTTYPES, showToast } from '../../utility/toast-helper';
import ThankYou from '../../components/ThankYou';
import NewTaskManagerFileDropZone from '../../@core/components/form-fields/NewTaskManagerFileSropZone';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
} from '../../constant';

const companyScheme = yup.object().shape({
  firstName: yup.string().required(required('First Name')),
  lastName: yup.string().required(required('last Name')),
  email: yup.string().email().required(required('Email')),
  requestMessage: yup.string().required(required('Message')),
});

const AVAILABLE_SUPPORTS_FORMS = {
  featureRequest: 'feature-request',
  reportProblem: 'report-problem',
};

const SupportForms = () => {
  const [loading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [socketSessionId, setSocketSessionId] = useState(undefined);
  const [fileUploadURL, setFileUploadURL] = useState([]);
  const [buttonLoading, setButtonLoading] = useState({
    submitLoading: false,
  });
  const [showThankYou, setShowThankYou] = useState(false);

  const {
    control,
    handleSubmit,
    register,
    reset,
    setError,
    getValues,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(companyScheme),
    defaultValues: {
      formType: 'feature-request',
    },
  });

  const onSubmit = (values) => {
    //
    try {
      if (values?.formType === AVAILABLE_SUPPORTS_FORMS.featureRequest) {
        //
        const toastId = showToast(TOASTTYPES.loading);
        setButtonLoading({ submitLoading: true });
        saveFeatureRequest({
          email: values?.email,
          fileUpload: values?.attachments?.[0]?.fileUrl || null,
          firstName: values?.firstName,
          lastName: values?.lastName,
          phone: values?.phone,
          requestMessage: values?.requestMessage,
        }).then((res) => {
          reset({
            formType: 'feature-request',
          });
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
            reset({
              formType: 'feature-request',
            });
            setFileUploadURL([]);
          }
          setShowThankYou(!showThankYou);
          setButtonLoading({ submitLoading: false });
        });
      } else if (values?.formType === 'report-problem') {
        //
        const toastId = showToast(TOASTTYPES.loading);
        setButtonLoading({ submitLoading: true });
        saveSendeRequest({
          uploadFileURL: fileUploadURL,
          email: values?.email,
          body: values?.requestMessage,
          firstName: values?.firstName,
          lastName: values?.lastName,
          phone: values?.phone,
        })
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
              reset({
                formType: 'feature-request',
              });
              setFileUploadURL([]);
            }
            setShowThankYou(!showThankYou);
            setButtonLoading({ submitLoading: false });
          })
          .catch(() => {
            setButtonLoading({ submitLoading: false });
          });
      }
    } catch (error) {
      setButtonLoading({ submitLoading: false });
    }
  };

  const sendRequestfileUpload = (uploadFiles) => {
    try {
      const formData = new FormData();
      let files = [];
      if (formTypeWatch === 'feature-request') {
        files = [...uploadFiles.target.files];
        const file = uploadFiles.target.files[0];
        uploadFiles.target.value = null;
        formData.append('filePath', `super-admin/feature-request`);
        formData.append('attachments', file);
        setImageUploading(true);
      } else {
        formData.append('filePath', `super-admin/report-problem`);
        files = [...uploadFiles];
        uploadFiles?.forEach((file) => {
          if (!file?.url) {
            formData.append('attachments', file);
          }
        });
        setImageUploading(true);
      }
      if (
        formTypeWatch === 'feature-request' ||
        (files.length && files.filter((file) => !file?.url)?.length)
      ) {
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
    } catch (error) {
      // console.log({ error });
    }
  };

  const handleImageReset = () => {
    setFileUploadURL(false);
    setValue('fileUpload', null);
  };

  const formTypeWatch = useWatch({
    control,
    name: `formType`,
  });

  const removeUploadFile = (removeIndex) => {
    if (formTypeWatch === AVAILABLE_SUPPORTS_FORMS.featureRequest) {
      setValue('attachments', []);
      setFileUploadURL([]);
    } else {
      setFileUploadURL(
        removeIndex > -1
          ? fileUploadURL.filter((url, index) => index !== removeIndex)
          : []
      );
    }
  };

  return (
    <UILoader blocking={loading} className=''>
      {showThankYou ? (
        <ThankYou
          message='We will review your request and let you know if we have any questions!'
          btnText='Submit Another Feature Request'
          onClickEvent={() => {
            reset({
              formType: 'feature-request',
            });
            setShowThankYou(!showThankYou);
            setImageUploading(false);
            setFileUploadURL(false);
          }}
        />
      ) : (
        <Row className='my-2 d-flex justify-content-center'>
          <CardBody>
            <Link
              to='/'
              onClick={(e) => e.preventDefault()}
              className='mb-2 mt-2'
            >
              <div className='text-center mb-1'>
                <img
                  src={themeConfig.app.connectifyLogo}
                  width='50'
                  alt='logo'
                />
              </div>
              <h2 className='text-center brand-text text-primary ms-1'>
                {process.env.REACT_APP_COMPANY_NAME}
              </h2>
            </Link>
            <CardTitle tag='h4' className='mb-2 mt-2 text-center'></CardTitle>
            <div>
              <Form
                className='report-problem-form'
                onSubmit={handleSubmit(onSubmit)}
                autoComplete='off'
              >
                <div className='scroll-wrapper'>
                  <div className='inner-wrapper'>
                    <Row>
                      <Col>
                        <FormField
                          type='radio'
                          error={errors}
                          control={control}
                          options={[
                            {
                              label: 'I have a feature request',
                              value: 'feature-request',
                            },
                            {
                              label: 'I want to report a bug',
                              value: 'report-problem',
                            },
                          ]}
                          name='formType'
                          defaultValue={getValues('formType')}
                          key={getValues('formType')}
                          onChange={() => {
                            // const { value } = e.target;
                            setValue('attachments', []);
                            setFileUploadURL([]);
                          }}
                        />
                      </Col>
                    </Row>

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
                        <Label for='requestMessage'>Message</Label>
                        <FormField
                          name='requestMessage'
                          placeholder='Message'
                          type='textarea'
                          errors={errors}
                          control={control}
                          {...register(`requestMessage`)}
                        />
                      </Col>
                    </Row>

                    {formTypeWatch ===
                    AVAILABLE_SUPPORTS_FORMS.featureRequest ? (
                      <>
                        <Row className=''>
                          <Col className='mb-1' sm='12'>
                            <Label for='requestMessage'>
                              Upload Screenshot
                            </Label>
                            <ImageUpload
                              url={
                                fileUploadURL?.length &&
                                fileUploadURL?.[0]?.fileUrl &&
                                `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${fileUploadURL?.[0]?.fileUrl}`
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
                      </>
                    ) : (
                      <>
                        {errors?.attachments ? (
                          <span className='text-danger block'>
                            File upload max upto 5mb
                            {errors?.attachments?.message}
                          </span>
                        ) : null}
                        <div className='attachment-save-btn-wrapper'>
                          <NewTaskManagerFileDropZone
                            setError={setError}
                            filesUpload={sendRequestfileUpload}
                            removeFile={removeUploadFile}
                            fileURLArray={fileUploadURL}
                            accept={AVAILABLE_FILE_FORMAT}
                            fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
                            fieldName='attachments'
                            loading={imageUploading}
                            multiple={true}
                          />
                        </div>
                      </>
                    )}
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
            </div>
          </CardBody>
        </Row>
      )}
    </UILoader>
  );
};

export default SupportForms;
