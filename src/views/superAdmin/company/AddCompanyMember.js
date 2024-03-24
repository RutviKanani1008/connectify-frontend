import React, { useEffect, useState } from 'react';
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
  Input,
  Label,
  Button,
} from 'reactstrap';
import * as yup from 'yup';
import { required } from '../../../configs/validationConstant';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import {
  createCompanyMemberDetail,
  getCompany,
  companyUser,
  updateCompanyMemberDetail,
} from '../../../api/company';
import queryString from 'query-string';
import { uploadFile } from '../../../api/auth';
import ImageUpload from '../../../@core/components/form-fields/ImageUpload';
import ResetPasswordModal from '../../../views/settings/ResetPasswordModal';

const companyScheme = yup.object().shape({
  userProfile: yup.string().required(required('Profile Logo')).nullable(),
  relation: yup.string().required(required('Title')).nullable(),
  firstName: yup.string().required(required('First Name')),
  lastName: yup.string().required(required('last Name')),
  email: yup.string().email().required(required('Email')),
  phone: yup.string().required(required('Phone Number')),
  company: yup
    .object()
    .shape({
      label: yup.string().required('Required'),
      value: yup.string().required('Required'),
    })
    .required(required('Company'))
    .nullable(),
});

const MemberDetail = () => {
  const [initialValue, setInitialValue] = useState({
    relation: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    tags: [],
    category: [],
  });
  const [companyName, setCompanyName] = useState([]);
  const params = useParams();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [roles] = useState([
    { label: 'Admin', value: 'admin' },
    { label: 'Member', value: 'user' },
  ]);
  // const [selectedCompany, setSelectedCompany] = useState({});
  const [fileUploadURL, setFileUploadURL] = useState(false);
  const [fileUpload, setFileUpload] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [renderKey, setRenderKey] = useState(Math.random());
  const [openResetPassword, setOpenResetPassword] = useState(false);

  const {
    control,
    handleSubmit,
    register,
    clearErrors,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(companyScheme),
  });

  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState({
    submitLoading: false,
    statusLoading: false,
  });

  const onSubmit = async (data) => {
    let flag = 1;
    setButtonLoading({ ...buttonLoading, submitLoading: true });

    if (!fileUpload) {
      setError(
        'userProfile',
        { type: 'focus', message: 'Profile logo is required' },
        { shouldFocus: true }
      );
      flag = 0;
    }
    if (flag) {
      data.company = data?.company?.value;
      data.role = selectedRole;
      data.userProfile = fileUploadURL;

      if (params.id !== 'add') {
        const toastId = showToast(TOASTTYPES.loading);
        updateCompanyMemberDetail(params.id, data).then((res) => {
          setButtonLoading({ ...buttonLoading, submitLoading: false });

          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            history.push(`/company-member`);
            showToast(
              TOASTTYPES.success,
              toastId,
              'Company Member Updated Successfully'
            );
          }
        });
      } else {
        const toastId = showToast(TOASTTYPES.loading);
        createCompanyMemberDetail(data).then((res) => {
          setButtonLoading({ ...buttonLoading, submitLoading: false });

          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            history.push(`/company-member`);
            showToast(
              TOASTTYPES.success,
              toastId,
              'Company Member Added Successfully'
            );
          }
        });
      }
    }
  };

  const getUserDetails = async () => {
    setLoading(true);
    companyUser({ _id: params.id })
      .then((res) => {
        if (res && res.data && res.data.data) {
          const user = res.data.data;
          const obj = {};
          obj['relation'] = user.relation;
          obj['firstName'] = user.firstName;
          obj['lastName'] = user.lastName;
          obj['email'] = user.email;
          obj['phone'] = user.phone;
          setFileUploadURL(user?.userProfile);
          obj['userProfile'] = user?.userProfile;
          if (user?.userProfile !== null) {
            setFileUpload(true);
          }
          if (user.company && user.company.name) {
            const temp = {};
            temp['label'] = user.company.name;
            temp['value'] = user.company._id;
            obj['company'] = temp;
          }
          setSelectedRole(user.role);
          setInitialValue(obj);
          reset(obj);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getCompanyNames = async () => {
    const companyName = await getCompany({ select: 'name,isGrandLodge' });
    const company = [];
    companyName?.data?.data?.forEach((companyData) => {
      const obj = {};
      obj['value'] = companyData._id;
      obj['label'] = companyData.name;
      obj['isGrandLodge'] = companyData.isGrandLodge;
      company.push(obj);
    });
    setCompanyName(company);
  };

  useEffect(() => {
    const company = queryString.parse(history.location.search);
    getCompanyNames();
    if (params.id !== 'add') {
      getUserDetails();
    } else if (company.company && company.name) {
      setValue('company', { label: company.name, value: company.company });
    }
    if (params.id === 'add') {
      reset({});
      setFileUploadURL(false);
      setRenderKey(Math.random());
    }

    history.replace({
      pathname: `/member/${params.id}`,
      status: history.location.state,
    });
  }, [params.id]);

  const userProfileUpload = (e) => {
    // const toastId = showToast(TOASTTYPES.loading);
    const file = e.target.files[0];
    e.target.value = null;
    const formData = new FormData();
    formData.append('filePath', `super-admin/profile-pictures`);
    formData.append('image', file);
    if (params.id !== 'add') {
      formData.append('model', 'users');
      formData.append('field', 'userProfile');
      formData.append('id', params.id);
      formData.append('type', 'userProfile');
    }
    setImageUploading(true);
    uploadFile(formData).then((res) => {
      if (res.error) {
        setImageUploading(false);
        // showToast(TOASTTYPES.error, toastId, res.error);
      } else {
        if (res?.data?.data) {
          setFileUpload(true);
          setFileUploadURL(res?.data?.data);
          setValue('userProfile', res?.data?.data);
          clearErrors('userProfile');
        }
        setImageUploading(false);
        // showToast(TOASTTYPES.success, toastId, 'Image Upload');
      }
    });
  };

  const handleImageReset = () => {
    setFileUploadURL(false);
    setFileUpload(false);
    setValue('userProfile', null);
  };

  return (
    <UILoader blocking={loading}>
      <Card>
        <CardHeader>
          <CardTitle className='text-primary w-100 d-flex justify-content-between'>
            {params.id !== 'add' ? 'Update Member' : 'Add Member'}
            {params.id !== 'add' && (
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
            )}
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Form
            className='auth-login-form mt-2'
            onSubmit={handleSubmit(onSubmit)}
            autoComplete='off'
          >
            <Row className='auth-inner m-0 mt-1'>
              <Col className='px-0' md='12'>
                <Row className='mb-1'>
                  <Col sm='6'>
                    <ImageUpload
                      url={
                        fileUploadURL &&
                        `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${fileUploadURL}`
                      }
                      handleUploadImage={userProfileUpload}
                      handleImageReset={handleImageReset}
                      loading={imageUploading}
                    />
                    {errors?.userProfile &&
                      errors?.userProfile?.type === 'required' && (
                        <span
                          className='text-danger block'
                          style={{ fontSize: '0.857rem' }}
                        >
                          Profile logo is required
                        </span>
                      )}
                  </Col>
                </Row>
                <Row className='mb-1'>
                  <Col md={4}>
                    <Label
                      sm='3'
                      for='message'
                      className='form-label form-label'
                    >
                      Role
                    </Label>
                    <div className='d-flex flex-inline'>
                      {roles.map(({ label, value }, index) => (
                        <div className='form-check me-2' key={index}>
                          <Input
                            type='radio'
                            id={`${label}`}
                            value={value}
                            checked={selectedRole === value}
                            name={'role'}
                            onChange={(e) => {
                              setSelectedRole(e.target.value);
                            }}
                          />
                          <Label
                            className='d-flex form-check-label'
                            for={`${label}`}
                          >
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </Col>
                  <Col md={4}>
                    <FormField
                      key={renderKey}
                      placeholder='Select Company'
                      label='Company'
                      type='select'
                      options={companyName}
                      errors={errors}
                      control={control}
                      name='company'
                    />
                  </Col>
                  <Col md={4}>
                    <FormField
                      key={renderKey}
                      label='Title'
                      placeholder='Title'
                      type='text'
                      errors={errors}
                      control={control}
                      {...register(`relation`)}
                    />
                  </Col>
                </Row>
                <Row className='mb-1'>
                  <Col md={4}>
                    <FormField
                      key={renderKey}
                      label='First Name'
                      placeholder='First Name'
                      type='text'
                      errors={errors}
                      control={control}
                      {...register(`firstName`)}
                    />
                  </Col>
                  <Col md={4}>
                    <FormField
                      key={renderKey}
                      label='Last Name'
                      placeholder='Last Name'
                      type='text'
                      errors={errors}
                      control={control}
                      {...register(`lastName`)}
                    />
                  </Col>
                  <Col md={4}>
                    <FormField
                      key={renderKey}
                      label='Email'
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
                  <Col md={4}>
                    <FormField
                      key={renderKey}
                      label='Phone Number'
                      type='phone'
                      name='phone'
                      placeholder='Phone Number'
                      errors={errors}
                      control={control}
                      {...register(`phone`)}
                    />
                  </Col>
                  {/* <Col md={4}>
                    <FormField
                      key={renderKey}
                      label='Category'
                      name='category'
                      placeholder='Select Category'
                      type='creatableselect'
                      errors={errors}
                      control={control}
                      options={category}
                      isMulti={'true'}
                      onChange={handleCategoryChange}
                    />
                  </Col>
                  <Col md={4}>
                    <FormField
                      key={renderKey}
                      name='tags'
                      label='Tag'
                      placeholder='Select Tag'
                      type='creatableselect'
                      errors={errors}
                      control={control}
                      options={tags}
                      isMulti={'true'}
                      onChange={handleTagsChange}
                    />
                  </Col> */}
                </Row>
                {/* <Row className='mb-3'>
                  <Col md={4}>
                    <FormField
                      key={renderKey}
                      name='memberShipStatus'
                      label='Membership Status'
                      placeholder='Select Membership Status'
                      type='select'
                      errors={errors}
                      control={control}
                      options={memberShipStatus}
                      onChange={(e) => {
                        setValue(`memberShipStatus`, e);
                      }}
                    />
                    {params.id !== 'add' ? (
                      <div className='mt-1 update-status-btn'>
                        <SaveButton
                          type='button'
                          name='Update Membership Status'
                          width='100%'
                          onClick={() => {
                            changeMembershipStatus();
                          }}
                          loading={buttonLoading.statusLoading}
                        ></SaveButton>
                      </div>
                    ) : null}
                    <div className='mt-1'>
                      <MemberShipHistory />
                    </div>
                  </Col>
                </Row> */}
              </Col>
            </Row>

            <div className='d-flex align-items-center justify-content-center'>
              <SaveButton
                width='20%'
                type='submit'
                loading={buttonLoading.submitLoading}
                name={params.id !== 'add' ? 'Update Member' : 'Add Member'}
                className='mt-1 align-items-center justify-content-center'
              ></SaveButton>
            </div>
          </Form>
        </CardBody>
      </Card>
      {openResetPassword && (
        <ResetPasswordModal
          email={initialValue?.email}
          openResetPassword={openResetPassword}
          setOpenResetPassword={setOpenResetPassword}
        />
      )}
    </UILoader>
  );
};

export default MemberDetail;
