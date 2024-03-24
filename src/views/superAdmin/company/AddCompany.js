import React, { useEffect, useState } from 'react';
import { LogIn } from 'react-feather';
import UILoader from '@components/ui-loader';

import { useHistory, useParams } from 'react-router-dom';

import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Form,
  UncontrolledTooltip,
  TabContent,
  TabPane,
  Spinner,
} from 'reactstrap';
import * as yup from 'yup';
import { minimum, required } from '../../../configs/validationConstant';
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
import { uploadFile, useVirtualAdminLogin } from '../../../api/auth';
import { store } from '../../../redux/store';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { storeUser } from '../../../redux/user';
import { isSuperAdmin } from '../../../helper/user.helper';
import { useDispatch } from 'react-redux';
import ImageUpload from '../../../@core/components/form-fields/ImageUpload';
import AddPermissions from '../../Admin/contact/components/AddPermissions';
import classnames from 'classnames';
import { CompanySenderEmail } from './components/CompanySenderEmail';
import { useGetPermission } from '../../Admin/users/hooks/userApis';
import CompanyNotes from '../../Admin/company/components/CompanyNotes';
import ContactNoteTab from '../../Admin/contact/components/ContactNoteTab';

const MySwal = withReactContent(Swal);

const adminSchema = {
  // relation: yup.string().required(required('Title')),
  email: yup.string().email().required(required('Email')),
  firstName: yup.string().required(required('firstname')),
  lastName: yup.string().required(required('lastname')),
  phone: yup.string().required(required('Phone Number')),
  password: yup
    .string()
    .required(required('Password'))
    .min(8, minimum('Password', 8)),
  confirm_password: yup
    .string()
    .oneOf(
      [yup.ref('password'), null],
      'Password and Confirm Password does not match'
    )
    .required(required('Confirm Password')),
};

const companyScheme = yup.object().shape({
  companyLogo: yup.string().required(required('Company Logo')).nullable(),
  name: yup.string().required(required('Company')),
  email: yup.string().email().required(required('Email')),
  phone: yup.string().required(required('Phone Number')),
  address1: yup.string().required(required('address 1')),
  address2: yup.string(),
  city: yup.string(),
  state: yup.string(),
  zipcode: yup.string(),
  admin: yup.object().shape(adminSchema),
});

const AddCompany = () => {
  const [initialValue, setInitialValue] = useState({
    admin: { relation: '', firstName: '', lastName: '', email: '', phone: '' },
    status: false,
  });

  const getRequiredField = () => {
    if (params.id !== 'add') {
      return yup.object().shape({
        companyLogo: yup.string().required(required('Company Logo')).nullable(),
        name: yup.string().required(required('Company')),
        email: yup.string().email().required(required('Email')),
        phone: yup.string().required(required('Phone Number')),
        address1: yup.string().required(required('address 1')),
        address2: yup.string(),
        city: yup.string(),
        state: yup.string(),
        zipcode: yup.string(),
      });
    } else {
      return companyScheme;
    }
  };

  const [buttonLoading, setButtonLoading] = useState({
    submitLoading: false,
    noteLoading: false,
  });
  const storeState = store.getState();
  const user = storeState.user.userData;

  const history = useHistory();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileUpload, setFileUpload] = useState(false);
  const [fileUploadURL, setFileUploadURL] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [currentTab, setCurrentTab] = useState('company_info');
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [tempPermissionsObj, setTempPermissionsObj] = useState({});

  // const tempPermissionsObj = {};
  // companyNavItems
  //   .filter((obj) => obj.id !== 'home' && obj.id !== 'setting')
  //   .forEach((obj) => {
  //     tempPermissionsObj[obj.id] = false;
  //     obj?.children?.forEach((obj) => {
  //       tempPermissionsObj[obj.id] = false;
  //     });
  //   });
  const [permissionsObj, setPermissionsObj] = useState(tempPermissionsObj);
  const { getPermission } = useGetPermission();
  const { virtualAdminLogin, isLoading: virtualLoginLoading } =
    useVirtualAdminLogin();
  const dispatch = useDispatch();
  const params = useParams();

  const {
    control,
    handleSubmit,
    clearErrors,
    register,
    setError,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(getRequiredField()),
    defaultValues: initialValue,
  });

  useEffect(() => {
    reset(initialValue);
  }, [initialValue]);

  const getCompanyDetails = async () => {
    setLoading(true);
    const companyDetails = await getCompanyDetail(params.id);

    const obj = {};
    if (companyDetails?.data?.data) {
      companyDetails.data.data.forEach((companyDetail) => {
        if (companyDetail.members) {
          const adminObj = {};
          companyDetail.members.forEach((member) => {
            if (member.role === 'admin') {
              adminObj.firstName = member.firstName;
              adminObj.lastName = member.lastName;
              adminObj.email = member.email;
              adminObj.phone = member.phone;
              adminObj.relation = member?.relation;
            }
          });
          obj['admin'] = adminObj;
        }

        if (companyDetail?.notes) {
          setNotes(companyDetail?.notes);
        }
        if (
          companyDetail?.grandLodgeId?.name &&
          companyDetail?.grandLodgeId?._id
        ) {
          const grandLodge = {};
          grandLodge['value'] = companyDetail?.grandLodgeId?._id;
          grandLodge['label'] = companyDetail?.grandLodgeId?.name;
          obj['grandLodgeId'] = grandLodge;
        }
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
        if (companyDetail?.companyLogo !== 'false') {
          setFileUpload(true);
          setFileUploadURL(companyDetail.companyLogo);
          obj['companyLogo'] = companyDetail.companyLogo;
        }
        const tempPermissionsArray = { ...permissionsObj };
        Object.keys(tempPermissionsArray).forEach((key) => {
          if (companyDetail.permissions?.includes(key))
            tempPermissionsArray[key] = true;
        });
        setPermissionsObj(tempPermissionsArray);
      });
    }
    setInitialValue(obj);
    setLoading(false);
  };

  const getPermissionsData = async () => {
    const { data, error } = await getPermission();
    if (!error) {
      const tempPermission = JSON.parse(JSON.stringify(data))
        .filter((obj) => obj.slug !== 'setting')
        .forEach((obj) => {
          tempPermissionsObj[obj.slug] = false;
          obj?.children?.forEach((obj) => {
            tempPermissionsObj[obj.slug] = false;
          });
        });
      setTempPermissionsObj(tempPermission);
      setAvailablePermissions(data);
    }
  };

  useEffect(async () => {
    await getPermissionsData();
    if (params.id !== 'add') {
      getCompanyDetails();
    } else {
      setInitialValue({
        admin: {
          relation: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        },
        status: true,
      });
    }
  }, [params]);

  const onSubmit = async (data) => {
    try {
      data.permissions = Object.keys(permissionsObj)
        .filter((key) => permissionsObj[key] === true)
        .map((key) => key);
      setButtonLoading({ ...buttonLoading, submitLoading: true });
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
        data.notes = [];
        if (params.id !== 'add') {
          const toastId = showToast(TOASTTYPES.loading);
          const res = await updateCompany(params.id, data);
          setButtonLoading({ ...buttonLoading, submitLoading: false });
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(
              TOASTTYPES.success,
              toastId,
              'Company Updated Successfully'
            );
            history.push(`/companies/all`);
          }
        } else {
          data.admin.role = 'admin';
          const toastId = showToast(TOASTTYPES.loading);
          const res = await saveCompany(data);

          setButtonLoading({ ...buttonLoading, submitLoading: false });
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(
              TOASTTYPES.success,
              toastId,
              'Company Added Successfully'
            );
            history.push(`/companies/all`);
          }
        }
      }

      setButtonLoading({ ...buttonLoading, submitLoading: false });
    } catch (error) {
      setButtonLoading({ ...buttonLoading, submitLoading: false });
    }
  };

  const userProfileUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    const formData = new FormData();
    formData.append('filePath', `super-admin/profile-pictures`);
    if (params.id !== 'add') {
      formData.append('model', 'company');
      formData.append('field', 'companyLogo');
      formData.append('id', params.id);
      formData.append('type', 'company');
    }
    formData.append('image', file);
    setImageUploading(true);
    uploadFile(formData).then((res) => {
      if (res.error) {
        setImageUploading(false);
      } else {
        if (res?.data?.data) {
          setFileUpload(true);
          if (!isSuperAdmin()) {
            const userObj = user;
            if (user.company.companyLogo) {
              user.company.companyLogo = res?.data?.data;
            }
            dispatch(storeUser(userObj));
          }
          setValue('companyLogo', res?.data?.data);
          clearErrors('companyLogo');
          setFileUploadURL(res?.data?.data);
        }
        setImageUploading(false);
      }
    });
  };

  const handleImageReset = () => {
    setFileUploadURL(false);
    setValue('companyLogo', null);
    setFileUpload(false);
  };

  const handleConfirmDelete = (status) => {
    return MySwal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you would like to change status?',
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Yes',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        //
      } else if (result.dismiss === MySwal.DismissReason.cancel) {
        status.target.checked = !status.target.checked;
        setValue('status', status.target.checked);
      }
    });
  };

  const handlePermission = (checked, slug, isParent = false) => {
    const tempPermissionsArray = { ...permissionsObj };
    if (isParent) {
      const parentData = availablePermissions?.find(
        (obj) => obj?.slug === slug
      );
      tempPermissionsArray[parentData?.slug] = checked;
      parentData?.children?.forEach((obj) => {
        tempPermissionsArray[obj?.slug] = checked;
      });
    } else {
      tempPermissionsArray[slug] = checked;
    }
    setPermissionsObj(tempPermissionsArray);
  };

  const handleVirtualLogin = async (id) => {
    const { data, error } = await virtualAdminLogin(id);

    if (!error) {
      if (data?.token && data?.userData) {
        localStorage.setItem('isSuperAdmin', true);
        localStorage.setItem('adminUserId', btoa(data?.userData?._id));
        localStorage.setItem('adminToken', data?.token);
        window.open(`${window.location.origin}/admin`, '_blank');
      }
    }
  };

  return (
    <UILoader blocking={loading}>
      <Card className='add-update-company-superAdmin'>
        <CardHeader className='top_header'>
          <CardTitle className='w-100 d-flex justify-content-between text-primary'>
            <div
              className='back-arrow'
              onClick={() => {
                history.push('/companies/all');
              }}
            ></div>
            <div className='title'>
              {params.id !== 'add' ? 'Update Company' : 'Add Company'}
            </div>
            <div className='right'>
              <div className='new-tab-details-design'>
                <div className='horizontal-new-tab-wrapper'>
                  <div className='horizontal-tabbing hide-scrollbar nav nav-tabs'>
                    <div className='nav-item'>
                      <div
                        className={classnames('nav-link', {
                          active: currentTab === 'company_info',
                        })}
                        onClick={() => {
                          setCurrentTab('company_info');
                        }}
                      >
                        Company Info
                      </div>
                    </div>
                    <div className='nav-item'>
                      <div
                        className={classnames('nav-link', {
                          active: currentTab === 'sender_email',
                        })}
                        onClick={() => {
                          if (params.id !== 'add') {
                            setCurrentTab('sender_email');
                          }
                        }}
                        id={`sender_email`}
                      >
                        Sender Emails
                      </div>
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={`sender_email`}
                      >
                        {params.id !== 'add'
                          ? 'Sender Emails'
                          : 'Please create a company first'}
                      </UncontrolledTooltip>
                    </div>
                    <div className='nav-item'>
                      <div
                        className={classnames('nav-link', {
                          active: currentTab === 'notes',
                        })}
                        onClick={() => {
                          if (params.id !== 'add') {
                            setCurrentTab('notes');
                          }
                        }}
                        id={`notes`}
                      >
                        Notes
                      </div>
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={`notes`}
                      >
                        {params.id !== 'add'
                          ? 'Notes'
                          : 'Please create a company first'}
                      </UncontrolledTooltip>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className='login__btn' id={`virtual_to`}> */}
              {/* <span className='me-1'>g</span> */}
              {params.id !== 'add' && (
                <div
                  id={`virtual_to`}
                  className='login__btn'
                  onClick={() => handleVirtualLogin(params.id)}
                >
                  {virtualLoginLoading ? (
                    <Spinner size='sm' />
                  ) : (
                    <LogIn size={15} className='cursor-pointer'></LogIn>
                  )}
                  <UncontrolledTooltip placement='top' target={`virtual_to`}>
                    Login as
                  </UncontrolledTooltip>
                </div>
              )}
              {/* </div> */}
            </div>
          </CardTitle>
        </CardHeader>
        <CardBody className='fancy-scrollbar'>
          <div className='company-detail-card add-new-user-card'>
            <div>
              <TabContent activeTab={currentTab}>
                {currentTab === 'company_info' && (
                  <TabPane tabId='company_info'>
                    <Form
                      className='company-detail-row'
                      onSubmit={handleSubmit(onSubmit)}
                      autoComplete='off'
                    >
                      <div className='company-info full-width'>
                        <div className='inner-scroll-wrapper fancy-scrollbar'>
                          <h4 className='section-title-second-heading'>
                            Company Info
                          </h4>
                          <div className='auth-login-form mt-2'>
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
                              <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                              <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                              <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                              <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
                                <div className='mb-1'>
                                  <FormField
                                    type='phone'
                                    label='Mass SMS Phone Number'
                                    name='massSmsPhone'
                                    placeholder='Mass SMS Phone Number'
                                    errors={errors}
                                    control={control}
                                  />
                                </div>
                              </Col>
                              <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                              <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                              <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                              <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                              <Col sm={6} md={6} xs={12} lg={6} xl={6} xxl={6}>
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
                              <Col
                                sm={6}
                                md={6}
                                xs={12}
                                lg={6}
                                xl={6}
                                xxl={6}
                                className='status_column'
                              >
                                <div className='mb-1'>
                                  <div className='inner-ci-field'>
                                    <FormField
                                      type='switch'
                                      label='Status'
                                      name='status'
                                      errors={errors}
                                      control={control}
                                      {...register(`status`)}
                                      onChange={(e) => {
                                        if (params.id !== 'add') {
                                          handleConfirmDelete(e);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </Col>
                            </Row>
                            {params.id === 'add' && (
                              <div className='mt-1'>
                                <h4 className='section-title-second-heading mb-1'>
                                  Admin User
                                </h4>
                                <Row>
                                  <Col
                                    sm={6}
                                    md={6}
                                    xs={12}
                                    lg={6}
                                    xl={6}
                                    xxl={6}
                                  >
                                    <div className='mb-1'>
                                      <FormField
                                        label='Title'
                                        placeholder='Title'
                                        type='text'
                                        errors={errors}
                                        control={control}
                                        {...register(`admin.relation`)}
                                      />
                                    </div>
                                  </Col>
                                  <Col
                                    sm={6}
                                    md={6}
                                    xs={12}
                                    lg={6}
                                    xl={6}
                                    xxl={6}
                                  >
                                    <div className='mb-1'>
                                      <FormField
                                        label='First Name'
                                        placeholder='First Name'
                                        type='text'
                                        errors={errors}
                                        control={control}
                                        {...register(`admin.firstName`)}
                                      />
                                    </div>
                                  </Col>
                                  <Col
                                    sm={6}
                                    md={6}
                                    xs={12}
                                    lg={6}
                                    xl={6}
                                    xxl={6}
                                  >
                                    <div className='mb-1'>
                                      <FormField
                                        label='Last Name'
                                        placeholder='Last Name'
                                        type='text'
                                        errors={errors}
                                        control={control}
                                        {...register(`admin.lastName`)}
                                      />
                                    </div>
                                  </Col>
                                  <Col
                                    sm={6}
                                    md={6}
                                    xs={12}
                                    lg={6}
                                    xl={6}
                                    xxl={6}
                                  >
                                    <div className='mb-1'>
                                      <FormField
                                        type='text'
                                        label='Email'
                                        name='admin_email'
                                        placeholder='john@example.com'
                                        errors={errors}
                                        control={control}
                                        {...register(`admin.email`)}
                                      />
                                    </div>
                                  </Col>
                                  <Col
                                    sm={6}
                                    md={6}
                                    xs={12}
                                    lg={6}
                                    xl={6}
                                    xxl={6}
                                  >
                                    <div className='mb-1'>
                                      <FormField
                                        name='admin_password'
                                        label='Password'
                                        placeholder='Enter Password'
                                        type='password'
                                        errors={errors}
                                        control={control}
                                        {...register(`admin.password`)}
                                      />
                                    </div>
                                  </Col>
                                  <Col
                                    sm={6}
                                    md={6}
                                    xs={12}
                                    lg={6}
                                    xl={6}
                                    xxl={6}
                                  >
                                    <div className='mb-1'>
                                      <FormField
                                        name='admin_cpassword'
                                        label='Confirm Password'
                                        placeholder='Enter Confirm Password'
                                        type='password'
                                        errors={errors}
                                        control={control}
                                        {...register(`admin.confirm_password`)}
                                      />
                                    </div>
                                  </Col>
                                  <Col
                                    sm={6}
                                    md={6}
                                    xs={12}
                                    lg={6}
                                    xl={6}
                                    xxl={6}
                                  >
                                    <div className='mb-1'>
                                      <FormField
                                        type='phone'
                                        label='Phone Number'
                                        name='admin_phone'
                                        placeholder='Phone Number'
                                        errors={errors}
                                        control={control}
                                        {...register(`admin.phone`)}
                                      />
                                    </div>
                                  </Col>
                                </Row>
                              </div>
                            )}
                          </div>
                          <AddPermissions
                            permissionsObj={permissionsObj}
                            getValues={getValues}
                            control={control}
                            errors={errors}
                            handlePermission={handlePermission}
                            availablePermissions={availablePermissions}
                          />
                        </div>
                        <div className='submit-btn-fixed-wrapper'>
                          <div className='d-flex align-items-center justify-content-center'>
                            <SaveButton
                              color='primary'
                              loading={buttonLoading.submitLoading}
                              name={
                                params.id !== 'add'
                                  ? 'Update Company'
                                  : 'Save Company'
                              }
                              type='submit'
                              className='mt-1 align-items-center justify-content-center'
                              width='230px'
                            />
                          </div>
                        </div>
                      </div>
                      {false && (
                        <CompanyNotes
                          notes={notes}
                          setNotes={setNotes}
                          companyId={params.id}
                        />
                      )}
                    </Form>
                  </TabPane>
                )}
                {currentTab === 'sender_email' && (
                  <div className='sender-emails'>
                    <CompanySenderEmail company={params.id} />
                  </div>
                )}
                {currentTab === 'notes' && params.id !== 'add' && (
                  <div className='superadmin-company-detail-notes'>
                    <ContactNoteTab
                      key={params.id}
                      notes={notes}
                      setNotes={setNotes}
                      params={{ id: params.id }}
                      modelName={'company'}
                    />
                  </div>
                )}
              </TabContent>
            </div>
            {currentTab === 'company_info' && (
              <div className='submit-btn-fixed-wrapper responsive-show'>
                <Form
                  className='auth-login-form mt-0'
                  onSubmit={handleSubmit(onSubmit)}
                  autoComplete='off'
                >
                  <div className='d-flex align-items-center justify-content-center'>
                    <SaveButton
                      color='primary'
                      loading={buttonLoading.submitLoading}
                      name={
                        params.id !== 'add' ? 'Update Company' : 'Save Company'
                      }
                      type='submit'
                      className='mt-1 align-items-center justify-content-center'
                      width='200px'
                    />
                  </div>
                </Form>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </UILoader>
  );
};

export default AddCompany;
