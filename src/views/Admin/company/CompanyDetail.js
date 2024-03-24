import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import UILoader from '@components/ui-loader';

import { useHistory, useParams } from 'react-router-dom';

import { Card, CardBody, Row, Col, Form } from 'reactstrap';
import * as yup from 'yup';
import { required } from '../../../configs/validationConstant';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import {
  getCompanyDetail,
  saveCompany,
  updateCompany,
} from '../../../api/company';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';

import { uploadFile, useRemoveAttachment } from '../../../api/auth';
import {
  getCurrentUser,
  // isSuperAdmin,
} from '../../../helper/user.helper';
import { store } from '../../../redux/store';
import { storeUpdateUser } from '../../../redux/user';
import { useDispatch } from 'react-redux';
import ImageUpload from '../../../@core/components/form-fields/ImageUpload';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';
import CompanyNotes from './components/CompanyNotes';
import AddCompanyNavBar from './CompanyDetailHeader';
import ContactNoteTab from '../contact/components/ContactNoteTab';

const companyScheme = yup.object().shape({
  companyLogo: yup.string().required(required('Company Logo')).nullable(),
  name: yup.string().required(required('Company')),
  website: yup
    .string()
    .matches(
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/,
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

const CompanyList = () => {
  const { basicRoute } = useGetBasicRoute();
  const dispatch = useDispatch();
  const [initialValue, setInitialValue] = useState({
    status: false,
  });
  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(companyScheme),
    defaultValues: initialValue,
  });
  const { removeAttachment } = useRemoveAttachment();

  const history = useHistory();
  const [notes, setNotes] = useState([]);
  const [isCompanyFormVisible, setIsCompanyFormVisible] = useState(true);

  const [loading, setLoading] = useState(false);

  const [fileUpload, setFileUpload] = useState(false);
  const [fileUploadURL, setFileUploadURL] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const storeState = store.getState();
  const user = storeState.user.userData;
  const params = useParams();

  const [currentTab, setCurrentTab] = useState(params.tab || 'company-details');
  useEffect(() => {
    reset(initialValue);
  }, [initialValue]);
  const [currentId, setCurrentId] = useState(false);
  const [buttonLoading, setButtonLoading] = useState({
    submitLoading: false,
    noteLoading: false,
  });

  const availableDateFormat = [
    {
      label: 'MM/DD/YYYY',
      value: 'MM/DD/YYYY',
    },
    {
      label: 'DD MMM yyy',
      value: 'DD MMM YYYY',
    },
    {
      label: 'DD/MM/YYYY',
      value: 'DD/MM/YYYY',
    },
    {
      label: 'YYYY/MM/DD',
      value: 'YYYY/MM/DD',
    },
  ];

  const getCompanyDetails = async (company) => {
    setLoading(true);

    const companyDetails = await getCompanyDetail(
      company ? company : params.id
    );
    const obj = {};
    if (companyDetails?.data?.data) {
      companyDetails.data.data.forEach((companyDetail) => {
        if (companyDetail?.notes) {
          setNotes(companyDetail?.notes);
        }
        if (companyDetail.dateFormat) {
          obj['dateFormat'] = availableDateFormat.find(
            (format) => format.value === companyDetail.dateFormat
          );
        } else {
          obj['dateFormat'] = availableDateFormat[0];
        }
        // obj['dateFormat'] = available
        obj['name'] = companyDetail?.name;
        obj['companyUrl'] = companyDetail?.companyUrl;
        obj['email'] = companyDetail?.email;
        obj['phone'] = companyDetail?.phone;
        obj['massSmsPhone'] = companyDetail?.massSmsPhone;
        obj['address1'] = companyDetail?.address1;
        obj['address2'] = companyDetail?.address2;
        obj['city'] = companyDetail?.city;
        obj['state'] = companyDetail?.state;
        obj['zipcode'] = companyDetail?.zipcode;
        obj['status'] = companyDetail?.status;
        obj['website'] = companyDetail?.website;
        if (companyDetail?.companyLogo !== 'false') {
          setFileUpload(true);
          setFileUploadURL(companyDetail.companyLogo);
          obj['companyLogo'] = companyDetail.companyLogo;
        }
      });
    }
    setInitialValue(obj);
    setLoading(false);
  };

  useEffect(() => {
    // if (!isSuperAdmin()) {
    const user = getCurrentUser();
    setCurrentId(user.company._id);
    getCompanyDetails(user.company._id);
    history.replace({
      pathname: `${basicRoute}/company/${user.company._id}`,
      status: history.location.state,
    });
    // }
  }, []);

  const onSubmit = (data) => {
    try {
      let flag = 1;

      if (!fileUpload) {
        setError(
          'companyLogo',
          { type: 'focus', message: 'CompanyLogo is required' },
          { shouldFocus: true }
        );
        flag = 0;
      }
      if (flag) {
        data['companyLogo'] = fileUploadURL;
        data.notes = notes;
        data.isGrandLodge = false;
        data.dateFormat = data?.dateFormat?.value
          ? data?.dateFormat?.value
          : availableDateFormat[0];
        setButtonLoading({ ...buttonLoading, submitLoading: true });
        if (params.id !== 'add') {
          const toastId = showToast(TOASTTYPES.loading);

          updateCompany(currentId ? currentId : params.id, data).then((res) => {
            if (res.error) {
              showToast(TOASTTYPES.error, toastId, res.error);
            } else {
              const userObj = JSON.parse(JSON.stringify(user));
              if (userObj.company.companyLogo) {
                userObj.company.companyLogo = fileUploadURL;
              }
              userObj.company.name = data.name;
              userObj.company.dateFormat = data.dateFormat;
              dispatch(storeUpdateUser(userObj));
              showToast(
                TOASTTYPES.success,
                toastId,
                'Company Updated Successfully'
              );
            }
            setButtonLoading({ ...buttonLoading, submitLoading: false });
          });
        } else {
          const toastId = showToast(TOASTTYPES.loading);
          data.dateFormat = data?.dateFormat?.value
            ? data?.dateFormat?.value
            : availableDateFormat[0];
          saveCompany(data).then((res) => {
            if (res.error) {
              if (res.errorData) {
                res.errorData.forEach((error) => {
                  showToast(TOASTTYPES.error, toastId, error);
                });
              } else {
                showToast(TOASTTYPES.error, toastId, res.error);
              }
            } else {
              showToast(
                TOASTTYPES.success,
                toastId,
                'Company Added Successfully'
              );
            }
            setButtonLoading({ ...buttonLoading, submitLoading: false });
          });
        }
      }
    } catch (error) {
      setButtonLoading({ ...buttonLoading, submitLoading: false });
    }
  };

  const userProfileUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    const formData = new FormData();
    formData.append('filePath', `${user.company._id}/profile-pictures`);
    formData.append('model', 'company');
    formData.append('field', 'companyLogo');
    formData.append('id', user.company._id);
    formData.append('image', file);
    setImageUploading(true);
    if (fileUploadURL) {
      formData.append('removeAttachments', [fileUploadURL]);
    }

    uploadFile(formData).then((res) => {
      if (res.error) {
        setImageUploading(false);
      } else {
        if (res?.data?.data) {
          // if (!isSuperAdmin()) {
          const userObj = JSON.parse(JSON.stringify(user));
          if (userObj.company.companyLogo) {
            userObj.company.companyLogo = res?.data?.data;
          }
          dispatch(storeUpdateUser(userObj));
          setFileUploadURL(res?.data?.data);
          setFileUpload(true);
          setValue('companyLogo', res?.data?.data);
          clearErrors('companyLogo');
          // }
        }
        setImageUploading(false);
      }
    });
  };

  const handleImageReset = async () => {
    if (fileUploadURL) {
      await removeAttachment({
        attachmentUrl: [fileUploadURL],
        modelDetail: {
          model: 'company',
          id: currentId ? currentId : params.id,
        },
      });
    }
    setFileUploadURL(false);
    setFileUpload(false);
    setValue('companyLogo', null);
  };

  return (
    <UILoader blocking={loading}>
      <Card className='company-detail-card'>
        <AddCompanyNavBar
          currentTab={currentTab}
          params={currentId ? { id: currentId } : params}
          setCurrentTab={setCurrentTab}
        />
        <CardBody className='fancy-scrollbar'>
          {currentTab === 'company-details' && (
            <>
              <div className='company-detail-row'>
                <div
                  className={`company-info full-width ${
                    isCompanyFormVisible ? 'form-active' : ''
                  }`}
                >
                  <div className='inner-scroll-wrapper fancy-scrollbar'>
                    <h4 className='section-title-second-heading'>
                      <div
                        className='mobile-toggle-header-btn'
                        onClick={() => {
                          setIsCompanyFormVisible(!isCompanyFormVisible);
                        }}
                      >
                        {isCompanyFormVisible ? <ChevronUp /> : <ChevronDown />}{' '}
                      </div>
                    </h4>
                    <Form
                      className='auth-login-form mt-2'
                      onSubmit={handleSubmit(onSubmit)}
                      autoComplete='off'
                    >
                      <div className='mb-1'>
                        <ImageUpload
                          url={
                            fileUploadURL &&
                            `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${fileUploadURL}`
                          }
                          handleUploadImage={userProfileUpload}
                          handleImageReset={handleImageReset}
                          loading={imageUploading}
                        />
                        {errors?.companyLogo &&
                          errors?.companyLogo?.type === 'required' && (
                            <span
                              className='text-danger block'
                              style={{ fontSize: '0.857rem' }}
                            >
                              Company logo is required!
                            </span>
                          )}
                      </div>
                      <Row>
                        <Col sm={12} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                        </Col>
                        <Col sm={12} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12} md={6} xs={12} lg={6} xl={6} xxl={6}>
                          <div className='mb-1'>
                            <FormField
                              label='Email'
                              name='email'
                              placeholder='john@example.com'
                              type='text'
                              errors={errors}
                              control={control}
                            />
                          </div>
                        </Col>
                        <Col sm={12} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                        </Col>
                      </Row>
                      <div className='mb-1'>
                        <FormField
                          type='phone'
                          label='Mass SMS Phone Number'
                          name='massSmsPhone'
                          placeholder='Mass SMS Phone Number'
                          errors={errors}
                          control={control}
                        />
                        {/* )} */}
                      </div>
                      <Row>
                        <Col sm={12} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                        </Col>
                        <Col sm={12} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                        </Col>
                        <Col sm={12} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                        </Col>
                        <Col sm={12} md={6} xs={12} lg={6} xl={6} xxl={6}>
                          <div className='mb-1'>
                            <FormField
                              name='dateFormat'
                              label='Date Format'
                              placeholder='Select Date Format'
                              type='select'
                              errors={errors}
                              control={control}
                              options={availableDateFormat}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                  <div className='submit-btn-fixed-wrapper'>
                    <Form
                      className='auth-login-form mt-0'
                      onSubmit={handleSubmit(onSubmit)}
                      autoComplete='off'
                    >
                      <div className='d-flex align-items-center justify-content-center'>
                        <SaveButton
                          color='primary'
                          name={'Update Company'}
                          type='submit'
                          loading={buttonLoading.submitLoading}
                          width='200px'
                          className='mt-1 align-items-center justify-content-center'
                          // block
                        />
                      </div>
                    </Form>
                  </div>
                </div>
                {false && (
                  <CompanyNotes
                    notes={notes}
                    setNotes={setNotes}
                    companyId={currentId}
                  />
                )}
              </div>
              <div className='submit-btn-fixed-wrapper responsive-show'>
                <Form
                  className='auth-login-form mt-0'
                  onSubmit={handleSubmit(onSubmit)}
                  autoComplete='off'
                >
                  <div className='d-flex align-items-center justify-content-center'>
                    <SaveButton
                      color='primary'
                      name={'Update Company'}
                      type='submit'
                      loading={buttonLoading.submitLoading}
                      width='200px'
                      className='mt-1 align-items-center justify-content-center'
                      // block
                    />
                  </div>
                </Form>
              </div>
            </>
          )}
          {currentTab === 'notes' && (
            <div className='company-detail-notes'>
              <ContactNoteTab
                key={currentId ? currentId : params.id}
                notes={notes}
                setNotes={setNotes}
                params={currentId ? { id: currentId } : { id: params.id }}
                modelName={'company'}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </UILoader>
  );
};

export default CompanyList;
