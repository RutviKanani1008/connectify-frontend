import React, { useEffect, useState } from 'react';
// ** React Imports
import { Link, useHistory, useParams } from 'react-router-dom';
// ** Reactstrap Imports
import { Form, Label, Spinner } from 'reactstrap';

// ** Styles
import '@styles/react/pages/page-authentication.scss';
import UILoader from '@components/ui-loader';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { getForms, submitFormResponse, uploadFormFile } from '../../api/forms';
import themeConfig from '../../configs/themeConfig';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { FormField } from '../../@core/components/form-fields';
import FileDropZone from '../../@core/components/form-fields/FileDropZone';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
} from '../../constant';
import '@src/assets/scss/iframe.scss';
import {
  setFieldBorderRadius,
  setQuestionSpacing,
} from '../../helper/design.helper';
import SyncfusionRichTextEditor from '../../components/SyncfusionRichTextEditor';

const Forms = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const params = useParams();
  const history = useHistory();
  const [currentForm, setCurrentForm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showFormNotFound, setShowFormNotFound] = useState(false);
  const [preview, setPreview] = useState(false);
  const [fileUpload, setFileUpload] = useState(false);
  const [fileUploadURL, setFileUploadURL] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    register,
    reset,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
  });

  const designFields = useWatch({
    control,
    name: `designField`,
  });

  useEffect(() => {
    setQuestionSpacing(designFields?.questionSpacing);
  }, [designFields?.questionSpacing]);

  useEffect(() => {
    setFieldBorderRadius(designFields?.fieldBorderRadius);
  }, [designFields?.fieldBorderRadius]);

  const { fields } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'fields', // unique name for your Field Array
  });

  useEffect(() => {
    document.body.classList.add('modal-open');
    const targetNode = document.body;
    const config = { attributes: true, childList: true, subtree: true };
    let old = 0;
    const observer = new MutationObserver(() => {
      if (old !== targetNode.scrollHeight) {
        old = targetNode.scrollHeight;
        window.parent.postMessage(
          { type: 'UI', payload: targetNode.scrollHeight },
          '*'
        );
      }
    });
    observer.observe(targetNode, config);
  }, []);

  useEffect(() => {
    getFormsDetails();
    if (history.location.pathname.includes('forms-preview')) {
      setPreview(true);
    }
  }, []);

  const getFormsDetails = () => {
    setLoading(true);
    getForms({ slug: params.id, active: true })
      .then((res) => {
        if (res.error) {
          history.push('/error');
        } else {
          if (res.data.data !== null) {
            setCurrentForm(res.data.data);
            reset(res.data.data);
          } else {
            setShowFormNotFound(true);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const checkForValidation = (data) => {
    let flag = 1;
    if (data && data.fields && data.fields.length > 0 && data.response) {
      data.fields.forEach((field) => {
        if (field.required) {
          if (
            field.type === 'file' &&
            field.required &&
            !fileUpload &&
            fileUploadURL?.length === 0
          ) {
            setError(
              `upload`,
              { type: 'required', message: `Upload is Required.` },
              { shouldFocus: true }
            );
            flag = 0;
          } else if (
            field.type !== 'file' &&
            (!data.response[field.label] ||
              data.response[field.label] === '' ||
              data.response[field.label] === null ||
              data.response[field.label] === undefined)
          ) {
            setError(
              `response[${field.label}]`,
              { type: 'focus', message: `${field.label} is Required.` },
              { shouldFocus: true }
            );
            flag = 0;
          }
        }
      });
    }
    return flag;
  };

  const onSubmit = async (data) => {
    const { response } = data;
    if (checkForValidation(data)) {
      if (fileUpload && fileUploadURL) {
        data.fields.forEach((field) => {
          if (field.type === 'file') {
            data.response[field.label] = fileUploadURL;
          }
        });
      }
      setSubmitting(true);
      if (data.allowReCaptcha) {
        const token = await executeRecaptcha('EMBEDED_FORM_RESPONSE');
        response['token'] = token;
      }
      // isEmbeddedFormResponce: true,
      submitFormResponse(params.id, {
        ...response,
      })
        .then((res) => {
          if (!res.error) {
            if (currentForm && currentForm.redirectLink) {
              if (window.location.pathname.startsWith('/embed/')) {
                window.parent.postMessage(
                  { type: 'link', payload: currentForm.redirectLink },
                  '*'
                );
              } else {
                window.location = currentForm.redirectLink;
              }
            } else {
              setShowThankYou(true);
              if (window.location.pathname.startsWith('/embed/')) {
                window.parent.postMessage({ type: 'scroll' }, '*');
              }
            }
          }
          setSubmitting(false);
        })
        .catch(() => {
          setSubmitting(false);
        });
    }
  };

  const onFileUpload = (files) => {
    if (currentForm?.company?._id) {
      const toastId = showToast(TOASTTYPES.loading);
      const file = files[0];
      const formData = new FormData();
      formData.append('filePath', `${currentForm.company._id}/forms`);
      formData.append('image', file);
      uploadFormFile(formData).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          if (res?.data?.data) {
            setFileUpload(true);
            setValue('response[Upload]', res?.data?.data);
            setFileUploadURL([res?.data?.data]);
            setValue('upload', res?.data?.data);
            clearErrors('upload');
          }
          showToast(TOASTTYPES.success, toastId, 'Image Upload');
        }
      });
    } else {
      console.log('error');
    }
  };

  const removeUploadFile = () => {
    setValue('upload', null);
    setFileUpload(false);
    setFileUploadURL([]);
    setValue('response[Upload]', null);
    setError(
      `upload`,
      { type: 'required', message: `Upload is Required.` },
      { shouldFocus: true }
    );
  };

  const FormDescription = () => {
    const bodyContent = currentForm?.description
      ? currentForm?.description
      : '';
    return (
      <>
        {bodyContent && (
          <>
            <SyncfusionRichTextEditor
              key={`form_description`}
              value={bodyContent}
              enabled={false}
              toolbarSettings={{ enable: false }}
              name={`rte_description`}
              list={`#rte_description_rte-edit-view`}
            />
          </>
        )}
      </>
    );
  };

  const ThankYou = () => {
    const bodyContent = currentForm?.thankyou ? currentForm?.thankyou : '';
    return (
      <>
        {currentForm && currentForm?.thankyou && bodyContent ? (
          <>
            <SyncfusionRichTextEditor
              key={`thank_you_detail`}
              value={bodyContent}
              enabled={false}
              toolbarSettings={{ enable: false }}
              id={`${currentForm._id}_thank_you`}
              name={`rte_thankyou`}
              list={`#rte_thankyou_rte-edit-view`}
            />
          </>
        ) : (
          <div className='w-100 text-center mb-1'>
            <h2 className='mb-1'>Thank You</h2>
            <p className='mb-3'>Your Form Details Submitted Successfully</p>
          </div>
        )}
      </>
    );
  };
  return (
    <UILoader blocking={loading} className=''>
      <div className='dynamic-form-main-sec'>
        <div
          className='dynamic-form-wrapper embed-form'
          id='aaaaaaaaaaaaaaaaaaaa'
          style={{
            width: `${currentForm?.designField?.formWidth}px`,
            maxWidth: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
            fontFamily: currentForm?.designField?.fontFamily,
            fontSize: `${currentForm?.designField?.fontSize}px`,
          }}
        >
          <span
            className='form-bg'
            style={{
              backgroundColor: currentForm?.designField?.pageBackgroundColor,
              opacity: (currentForm?.designField?.pageOpacity ?? 100) / 100,
            }}
          ></span>
          <div className='inner-wrapper'>
            {/* <span
            className='bg-wrapper'
            style={{
              backgroundColor: currentForm?.designField?.pageBackgroundColor,
              opacity: currentForm?.designField?.pageOpacity,
            }}
          ></span> */}
            {showFormNotFound ? (
              <>
                <Link
                  to='/'
                  onClick={(e) => e.preventDefault()}
                  className='mb-2 mt-2'
                >
                  <div className='text-center mb-1'>
                    <img
                      src={themeConfig.app.appLogoImage}
                      width='50'
                      alt='logo'
                    />
                  </div>
                  <h2 className='text-center brand-text text-primary ms-1'>
                    {process.env.REACT_APP_COMPANY_NAME}
                  </h2>
                  ui-loader
                </Link>
                <h4 className='mb-2 mt-2 text-center'>
                  Form you are looking for no longer exists
                </h4>
              </>
            ) : (
              fields &&
              fields.length > 0 && (
                <>
                  {(currentForm?.showLogo ||
                    currentForm?.showCompanyName ||
                    currentForm?.showTitle) && (
                    <div className='top-user-profile'>
                      <Link
                        className='profile-img'
                        to='/'
                        onClick={(e) => e.preventDefault()}
                      >
                        {currentForm?.showLogo ? (
                          <>
                            {currentForm &&
                            currentForm.company &&
                            currentForm.company.companyLogo ? (
                              <img
                                src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${currentForm?.company?.companyLogo}`}
                                width='50'
                                alt='logo'
                              />
                            ) : (
                              <img
                                src={themeConfig.app.appLogoImage}
                                width='50'
                                alt='logo'
                              />
                            )}
                          </>
                        ) : null}
                      </Link>
                      <div
                        className={`right-details ${
                          !currentForm?.showLogo && 'logo__not'
                        }`}
                      >
                        {currentForm?.showCompanyName && (
                          <h2
                            className='title'
                            style={{
                              color: currentForm?.designField?.fontColor,
                            }}
                          >
                            {currentForm &&
                            currentForm.company &&
                            currentForm.company.name
                              ? currentForm?.company?.name
                              : process.env.REACT_APP_COMPANY_NAME}
                          </h2>
                        )}
                        <p
                          className='text'
                          style={{ color: currentForm?.designField?.fontColor }}
                        >
                          {currentForm?.showTitle ? (
                            <>{getValues('title')}</>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  )}

                  <>
                    {showThankYou ? (
                      <ThankYou />
                    ) : (
                      <>
                        {currentForm?.showDescription && (
                          <div className='card-text'>
                            {currentForm.description ? <FormDescription /> : ''}
                          </div>
                        )}
                        <Form
                          className='auth-login-form'
                          onSubmit={handleSubmit(onSubmit)}
                          autoComplete='off'
                        >
                          {fields &&
                            fields.length > 0 &&
                            fields.map((field, index) => {
                              return (
                                <div className='form-field-wrapper' key={index}>
                                  <Label
                                    className='form-label'
                                    for={`${field?.label}`}
                                    style={{
                                      color:
                                        currentForm?.designField?.fontColor,
                                    }}
                                  >
                                    {field?.label}
                                    {field?.required ? (
                                      <>
                                        <span className='text-danger'>*</span>
                                      </>
                                    ) : null}
                                  </Label>
                                  {field?.type === 'file' ? (
                                    <div className='field-div fileDropZone-wrapper'>
                                      <FileDropZone
                                        setError={setError}
                                        filesUpload={onFileUpload}
                                        removeFile={removeUploadFile}
                                        fileURLArray={fileUploadURL}
                                        accept={AVAILABLE_FILE_FORMAT}
                                        fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
                                        fieldName='upload'
                                        propsBorder={`2px dashed ${currentForm?.designField?.fontColor}`}
                                        formDesignField={
                                          currentForm?.designField
                                        }
                                        propsBrowseLinkColor={
                                          currentForm?.designField?.fontColor
                                        }
                                      />
                                      {errors?.upload &&
                                        errors?.upload?.type === 'required' && (
                                          <span
                                            className='text-danger block'
                                            style={{
                                              fontSize: '0.857rem',
                                            }}
                                          >
                                            Upload is required
                                          </span>
                                        )}
                                    </div>
                                  ) : field.type === 'select' ? (
                                    <div className='field-div select-wrapper'>
                                      <FormField
                                        placeholder={field.placeholder}
                                        type={field?.type}
                                        errors={errors}
                                        options={field?.options}
                                        control={control}
                                        disabled={preview}
                                        onChange={(e) => {
                                          setValue(
                                            `response.${field.label}`,
                                            e
                                          );
                                        }}
                                        name={`response.${field.label}`}
                                      />
                                    </div>
                                  ) : (
                                    <div className='field-div'>
                                      <FormField
                                        placeholder={field.placeholder}
                                        type={field?.type}
                                        errors={errors}
                                        options={field?.options}
                                        control={control}
                                        disabled={preview}
                                        name={`response.${field.label}`}
                                        {...register(`response.${field.label}`)}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          <div className='submit-wrapper-no-border'>
                            <button
                              className='btn'
                              style={{
                                backgroundColor:
                                  currentForm?.designField?.submitButtonColor,
                                color:
                                  currentForm?.designField
                                    ?.submitButtonFontColor,
                                width: `${
                                  designFields?.submitButtonWidth ?? 20
                                }%`,
                              }}
                              type='submit'
                              name={'Submit'}
                            >
                              {submitting && (
                                <Spinner size={5} className='me-1' />
                              )}
                              Submit
                            </button>
                          </div>
                        </Form>
                      </>
                    )}
                  </>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </UILoader>
  );
};

const WrappedForm = () => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.REACT_APP_GOOGLE_RECAPTCHA_KEY}
    >
      <Forms />
    </GoogleReCaptchaProvider>
  );
};

export default WrappedForm;
