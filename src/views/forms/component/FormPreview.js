import { Link } from 'react-router-dom';
import { CardText, Form, Label } from 'reactstrap';
import themeConfig from '@configs/themeConfig';
import FileDropZone from '../../../@core/components/form-fields/FileDropZone';
import { FormField } from '@components/form-fields';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
} from '../../../constant';
import { useWatch } from 'react-hook-form';
import { FormDesignFields } from '../formDesignFields';
import { ChevronLeft, Settings, X } from 'react-feather';
import { useEffect, useState } from 'react';
import {
  setFieldBorderRadius,
  setQuestionSpacing,
} from '../../../helper/design.helper';
import SyncfusionRichTextEditor from '../../../components/SyncfusionRichTextEditor';

const FormPreview = (props) => {
  const {
    getValues,
    setValue,
    user,
    showThankYou,
    fields,
    onFormPreviewSubmit,
    errors,
    control,
    register,
    setShowThankYou,
  } = props;
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

  const FormDescription = () => {
    const bodyContent = getValues('description')
      ? getValues('description')
      : '';

    return (
      <>
        {bodyContent && (
          <SyncfusionRichTextEditor
            key={`form_description`}
            value={bodyContent}
            enabled={false}
            toolbarSettings={{ enable: false }}
            name={`rte_description`}
            list={`#rte_description_rte-edit-view`}
          />
          //  style={{ color: designFields?.fontColor }}
        )}
      </>
    );
  };

  const ThankYouPage = () => {
    const bodyContent = getValues('thankyou') ? getValues('thankyou') : '';
    return (
      <>
        {getValues('thankyou') && bodyContent ? (
          <SyncfusionRichTextEditor
            key={`form_thankyou`}
            value={bodyContent}
            enabled={false}
            toolbarSettings={{ enable: false }}
            name={`rte_thankyou`}
            list={`#rte_thankyou_rte-edit-view`}
          />
        ) : (
          <div className='w-100 text-center mb-1'>
            <h2 className='mb-1'>Thank You</h2>
            <p className='mb-3'>Your Form Details Submitted Successfully</p>
          </div>
        )}
      </>
    );
  };
  const [isFormdesign, setFormdesign] = useState('false');
  const formDesignhandleToggle = () => {
    setFormdesign(!isFormdesign);
  };
  console.log({ fields });
  return (
    <>
      {/* <div className='company-form-preview'> */}
      <div
        className='dynamic-form-wrapper'
        style={{
          width: `${designFields?.formWidth}px`,
          maxWidth: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          fontFamily: designFields?.fontFamily?.value,
          fontSize: `${designFields?.fontSize}px`,
        }}
      >
        <span
          className='form-bg'
          style={{
            backgroundColor: designFields?.pageBackgroundColor,
            opacity: (designFields?.pageOpacity ?? 100) / 100,
          }}
        ></span>
        <div className='inner-wrapper'>
          {/* <span
              className='bg-wrapper'
              style={{ backgroundColor: 'red', opacity: '0.78' }}
            ></span> */}
          {(getValues('showLogo') ||
            getValues('showCompanyName') ||
            getValues('showTitle')) && (
            <div className='top-user-profile'>
              <Link
                className='profile-img'
                to='/'
                onClick={(e) => e.preventDefault()}
              >
                {getValues('showLogo') && (
                  <>
                    {user?.company?.companyLogo ? (
                      <img
                        src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${user?.company?.companyLogo}`}
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
                )}
              </Link>
              <div
                className={`right-details ${
                  !getValues('showLogo') && 'logo__not'
                }`}
              >
                {getValues('showCompanyName') && (
                  <h2
                    className='title'
                    style={{ color: designFields?.fontColor }}
                  >
                    {user?.company?.name
                      ? user?.company?.name
                      : process.env.REACT_APP_COMPANY_NAME}
                  </h2>
                )}
                {getValues('showTitle') && (
                  <p
                    className='text'
                    style={{ color: designFields?.fontColor }}
                  >
                    {getValues('title')}
                  </p>
                )}
              </div>
            </div>
          )}

          {!showThankYou ? (
            <>
              <CardText className=''>
                {getValues('showDescription') && getValues('description') ? (
                  <FormDescription />
                ) : (
                  ''
                )}
              </CardText>

              <Form
                className='auth-login-form'
                onSubmit={onFormPreviewSubmit}
                autoComplete='off'
              >
                {fields &&
                  fields.length > 0 &&
                  fields.map((field, index) => {
                    return (
                      <div className='form-field-wrapper' key={index}>
                        <Label
                          style={{
                            color: designFields?.fontColor,
                            // fontSize: `${designFields?.fontSize}px`,
                          }}
                          className='form-label'
                          for={`${field?.label}`}
                        >
                          {field?.label}
                          {field?.required ? (
                            <>
                              <span className='text-danger'>*</span>
                            </>
                          ) : null}
                        </Label>
                        {field?.type?.value === 'file' ? (
                          <div className='field-div fileDropZone-wrapper'>
                            <FileDropZone
                              accept={AVAILABLE_FILE_FORMAT}
                              fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
                              fieldName='upload'
                              // disabled={true}
                              formDesignField={designFields}
                              propsBorder={`2px dashed ${designFields?.fontColor}`}
                              propsBrowseLinkColor={`${designFields?.fontColor}`}
                            />
                          </div>
                        ) : ['multiSelect', 'select'].includes(
                            field.type?.value
                          ) ? (
                          <div className='field-div select-wrapper'>
                            <FormField
                              placeholder={field.placeholder}
                              type={'select'}
                              isMulti={field.type?.value === 'multiSelect'}
                              errors={errors}
                              options={field?.options}
                              control={control}
                              name={`response.${field.label}`}
                            />
                          </div>
                        ) : (
                          <div className='field-div'>
                            <FormField
                              placeholder={field.placeholder}
                              // type={field.type.value}
                              type={field?.type.value}
                              errors={errors}
                              options={field?.options}
                              control={control}
                              // disabled={true}
                              name={`response.${field.label}`}
                              {...register(`response.${field.label}`)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                {/* <div className='submit-btn-wrapper'> */}
                <div className='d-flex justify-content-center submit-btn-wrapper'>
                  <button
                    className='btn'
                    style={{
                      backgroundColor: designFields?.submitButtonColor,
                      color: designFields?.submitButtonFontColor,
                      width: `${designFields?.submitButtonWidth ?? 20}%`,
                    }}
                    // width='100%'
                    type='submit'
                    name={'Submit'}
                  >
                    <span>Submit</span>
                  </button>
                </div>
              </Form>
            </>
          ) : (
            <>
              <div className='thankYou-wrapper'>
                {getValues('thankyou') ? (
                  <ThankYouPage />
                ) : (
                  <div className='thankYou-default-wrapper'>
                    <h2
                      className='title'
                      style={{ color: designFields?.fontColor }}
                    >
                      Thank You
                    </h2>
                    <p
                      className='text'
                      style={{ color: designFields?.fontColor }}
                    >
                      Your Form Details Submitted Successfully
                    </p>
                  </div>
                )}
              </div>
              <div className='go-back-btn-wrapper'>
                <a
                  onClick={() => {
                    setShowThankYou(!showThankYou);
                  }}
                  style={{ color: designFields?.fontColor }}
                  // name={'Go Back'}
                >
                  <ChevronLeft fontSize={`${designFields?.fontSize}px`} />
                  Go Back
                </a>
              </div>
            </>
          )}
        </div>
      </div>
      {/* </div> */}
      <span className='form-design-wrapper-mobile-overllay'></span>
      <button
        onClick={formDesignhandleToggle}
        type='button'
        className='button-sticky'
        style={{ display: 'none' }}
      >
        <Settings />
      </button>
      <div
        className={`form-design-wrapper-fixed ${!isFormdesign ? 'open' : ''}`}
      >
        <button
          onClick={formDesignhandleToggle}
          type='button'
          className='button-sticky'
        >
          <Settings />
        </button>
        <div className='inner-wrapper'>
          <div className='header-wrapper'>
            <h3 className='title'>Form Designer</h3>
            <button onClick={formDesignhandleToggle} className='close-btn'>
              <X />
            </button>
          </div>
          <FormDesignFields
            errors={errors}
            control={control}
            getValues={getValues}
            setValue={setValue}
          />
        </div>
      </div>
    </>
  );
};

export default FormPreview;
