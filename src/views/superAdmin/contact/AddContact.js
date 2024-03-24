import React, { Fragment, useEffect, useState } from 'react';
import { ArrowRight, Edit2, Plus, X } from 'react-feather';
import UILoader from '@components/ui-loader';
import classnames from 'classnames';
import { useHistory, useParams } from 'react-router-dom';
import { selectThemeColors } from '@utils';
import Select from 'react-select';

import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Form,
  Input,
  Button,
  Modal,
  ModalFooter,
  ModalBody,
  ModalHeader,
} from 'reactstrap';
import * as yup from 'yup';
import { required } from '../../../configs/validationConstant';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { getCompany } from '../../../api/company';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import moment from 'moment';
import {
  getContact,
  saveCotanct,
  updateContact,
  updateContactStatus,
} from '../../../api/contacts';
import { store } from '../../../redux/store';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const companyScheme = yup.object().shape({
  firstName: yup.string().required(required('First Name')),
  lastName: yup.string().required(required('last Name')),
  email: yup.string().email().required(required('Email')),
  company: yup
    .array()
    .of(
      yup.object().shape({
        label: yup.string().required('Required'),
        value: yup.string().required('Required'),
      })
    )
    .required(required('Company')),
  phone: yup.string().required(required('Phone Number')),
  address1: yup.string().required(required('address 1')),
  address2: yup.string(),
  city: yup.string(),
  state: yup.string(),
  zipcode: yup.string(),
});

const AddContact = () => {
  const [initialValue, setInitialValue] = useState({
    questions: [
      {
        question: 'Are you male?',
        answer: '',
      },
      {
        question: 'What is your age?',
        answer: '',
      },
      {
        question: 'Do you believe in a Supreme Being?',
        answer: '',
      },
      {
        question: 'Do you have a felony arrest record?',
        answer: '',
      },
      {
        question: 'How did you learn about us?',
        answer: '',
      },
      {
        question: 'Tell us about yourself and your interest .',
        answer: '',
      },
    ],
    companyDetails: [],
  });
  const {
    control,
    handleSubmit,
    register,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(companyScheme),
    defaultValues: initialValue,
  });

  const { fields: companyField, append: companyAppend } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'companyDetails', // unique name for your Field Array
  });
  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'questions', // unique name for your Field Array
  });

  const storeState = store.getState();
  const user = storeState.user.userData;

  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [, setIsNoteEdit] = useState(null);
  const [companyName, setCompanyName] = useState([]);
  const [contactStages] = useState([]);
  const [, setStatusHistory] = useState([]);
  const [, setCurrentStatus] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isCompanyChange, setIsCompanyChange] = useState(true);
  const [buttonLoading, setButtonLoading] = useState({
    companyLoading: false,
    statusLoading: false,
    noteLoading: false,
    submitLoading: false,
  });
  const [paramsIds, setParamsIds] = useState(false);
  const [openAddQuestion, setOpenAddQuestion] = useState(false);
  const [showError, setShowError] = useState(false);
  const [currentQuestionText, setCurrentQuestionText] = useState({ text: '' });
  const [updateQuestion, setUpdateQuestion] = useState(false);

  const params = useParams();

  useEffect(() => {
    reset(initialValue);
  }, [initialValue]);

  const getSelectedCompany = async (selectedCompany) => {
    const getStage = await getCompany({
      select: 'contactStages,isGrandLodge',
      _id: selectedCompany.value,
    });
    const company = [];
    if (getStage && getStage.data.data && getStage.data.data.length > 0) {
      const sortStage = getStage.data?.data[0]?.contactStages.sort(
        ({ order: a }, { order: b }) => a - b
      );

      sortStage.forEach((stage) => {
        const obj = {};
        obj['value'] = stage?.code;
        obj['label'] = stage?.title;
        obj['id'] = stage?._id;
        company.push(obj);
      });

      companyAppend({
        company: selectedCompany,
        contactStages: company,
        status: '',
        currentNote: '',
        isExistingNote: false,
        notes: [],
        showMemberError: false,
        showStatusError: false,
      });
    }
    // return getStage
  };

  const handleCompanyChange = async (value) => {
    if (value && value.length > 0 && value.length > companyField.length) {
      const result = value.filter((o1) => {
        return !companyField.some((o2) => {
          return o1.value === o2.company.value; // return the ones with equal id
        });
      });
      if (result.length === 1) {
        getSelectedCompany(result[0]);
      }
    } else {
      return MySwal.fire({
        title: '',
        text: 'are you want to Delete this company detail?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Okay',
        allowOutsideClick: false,
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger ms-1',
        },
        buttonsStyling: false,
      }).then(function (result) {
        if (result.value) {
          const deleteCompany = companyField.filter((o1) => {
            return !value.some((o2) => {
              return o2.value === o1.company.value; // return the ones with equal id
            });
          });
          if (deleteCompany && deleteCompany.length === 1) {
            const remaining = companyField.filter(
              (company) =>
                company.company.value !== deleteCompany[0].company.value
            );
            setValue(`companyDetails`, remaining);
          }
        } else {
          const deleteCompany = companyField.filter((o1) => {
            return !value.some((o2) => {
              return o2.value === o1.company.value; // return the ones with equal id
            });
          });
          if (deleteCompany && deleteCompany.length === 1) {
            const companyDetail = getValues('company');
            companyDetail.push(deleteCompany[0].company);
            setValue(`company`, companyDetail);
          }
        }
      });
    }
  };

  const getCompanyDetails = async () => {
    setLoading(true);
    const contactDetail = await getContact(params.id);
    if (contactDetail?.data?.data) {
      const contact = contactDetail.data.data;
      if (contact.companyDetails && contact.companyDetails.length > 0) {
        const company = [];
        contact.companyDetails.forEach((companyObj) => {
          if (
            companyObj &&
            companyObj.company &&
            companyObj.company.id &&
            companyObj.company.name
          ) {
            const stages = [];
            const sortStage = companyObj?.company?.id?.contactStages.sort(
              ({ order: a }, { order: b }) => a - b
            );

            sortStage.forEach((stage) => {
              const obj = {};
              obj['value'] = stage?.code;
              obj['label'] = stage?.title;
              obj['id'] = stage?._id;
              stages.push(obj);
            });

            companyObj.contactStages = stages;
            const companyDetail = {};
            companyDetail['label'] = companyObj.company.name;
            companyDetail['value'] = companyObj.company.id._id;
            companyObj.company = companyDetail;
            company.push(companyDetail);
          }
          if (
            companyObj &&
            companyObj.status &&
            companyObj.status.title &&
            companyObj.status.code
          ) {
            const stageStatus = {};
            stageStatus['label'] = companyObj.status.title;
            stageStatus['value'] = companyObj.status.code;
            companyObj.status = stageStatus;
          }
          if (
            companyObj &&
            companyObj.statusHistory &&
            companyObj.statusHistory.length > 0
          ) {
            companyObj.statusHistory = companyObj.statusHistory.reverse();
          }

          companyObj.currentNote = '';
          companyObj.isExistingNote = false;
        });
        contact.company = company;
      }
      setInitialValue(contact);
    }
    setLoading(false);
  };

  // eslint-disable-next-line no-unused-vars
  const changeContactStatus = async () => {
    setButtonLoading({ ...buttonLoading, statusLoading: true });

    const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');

    const contactStatus = getValues('status');
    const status = {};
    status['code'] = contactStatus.value;
    status['title'] = contactStatus.label;

    await updateContactStatus(params.id, { status }).then((res) => {
      if (res.error) {
        showToast(TOASTTYPES.error, toastId, res.error);
      } else {
        const contact = res?.data?.data;
        if (contact && contact?.statusHistory?.length > 0) {
          setStatusHistory(contact.statusHistory.reverse());
        }
        setCurrentStatus(contact?.status);
        showToast(TOASTTYPES.success, toastId, 'Status Updated Successfully');
      }
    });
    setButtonLoading({ ...buttonLoading, statusLoading: false });
  };

  // eslint-disable-next-line no-unused-vars
  const changeCompany = async () => {
    setButtonLoading({ ...buttonLoading, companyLoading: true });
    const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');

    const companyStatus = getValues('companyDetail');
    const companyDetail = {};
    companyDetail['name'] = companyStatus.label;
    companyDetail['id'] = companyStatus.value;

    await updateContactStatus(params.id, { companyDetail }).then((res) => {
      if (res.error) {
        showToast(TOASTTYPES.error, toastId, res.error);
      } else {
        showToast(TOASTTYPES.success, toastId, 'Status Updated Successfully');
      }
    });
    setButtonLoading({ ...buttonLoading, companyLoading: false });
  };

  useEffect(() => {
    if (params.id !== 'add') {
      getCompanyDetails();
    } else {
      if (paramsIds) {
        const search = window.location.search;
        const searchValue = new URLSearchParams(search);
        const statusId = searchValue.get('status');
        const company = searchValue.get('company');
        if (statusId && company) {
          setParamsIds({ status: statusId, company });
          history.replace({
            pathname: '/contacts/add',
            status: history.location.state,
          });
        }
        setInitialValue({
          questions: [
            {
              question: 'Are you male?',
              answer: '',
            },
            {
              question: 'What is your age?',
              answer: '',
            },
            {
              question: 'Do you believe in a Supreme Being?',
              answer: '',
            },
            {
              question: 'Do you have a felony arrest record?',
              answer: '',
            },
            {
              question: 'How did you learn about us?',
              answer: '',
            },
            {
              question: 'Tell us about yourself and your interest .',
              answer: '',
            },
          ],
          companyDetails: [],
        });
      }
    }
  }, [params]);

  useEffect(() => {
    if (isFirstTime && companyName && companyName.length > 0) {
      let flag = 0;
      const initial = { status: '', companyDetail: '' };
      if (paramsIds && paramsIds.company) {
        const companyIdDetail = companyName.filter(
          (company) => company.value === paramsIds.company
        );
        if (companyIdDetail && companyIdDetail.length > 0) {
          const companyObj = {};
          companyObj['label'] = companyIdDetail[0].label;
          companyObj['value'] = companyIdDetail[0].value;
          if (isCompanyChange) {
            handleCompanyChange({ value: paramsIds.company });
          }
          initial.companyDetail = companyObj;
          setIsCompanyChange(false);
          flag = 1;
        }
      }
      if (contactStages && contactStages.length > 0 && flag) {
        if (paramsIds && paramsIds.status) {
          const statges = contactStages.filter(
            (stages) => stages.value === paramsIds?.status
          );
          if (statges && statges.length > 0) {
            const status = {};
            status['label'] = statges[0].label;
            status['value'] = statges[0].value;
            initial.status = status;
            flag = 2;
          }
        }
      }
      if (flag === 2) {
        setIsFirstTime(false);
        setInitialValue(initial);
      }
    }
  }, [paramsIds, companyName, contactStages]);

  const getCompanyNames = async () => {
    const companyName = await getCompany({ select: 'name' });
    const company = [];
    companyName?.data?.data?.forEach((companyName) => {
      const obj = {};
      obj['value'] = companyName._id;
      obj['label'] = companyName.name;
      company.push(obj);
    });
    setCompanyName(company);
  };

  useEffect(() => {
    getCompanyNames();
  }, []);

  const onSubmit = async (data) => {
    const rawData = data;
    let flag = 1;
    if (companyField && companyField.length > 0) {
      companyField.forEach((company) => {
        if (company.status === '' || Object.keys(company.status).length === 0) {
          flag = 0;
          company.showStatusError = true;
        }
      });
      setValue(`companyDetails`, companyField);
    }
    if (flag) {
      if (rawData.companyDetails && rawData.companyDetails.length > 0) {
        rawData.companyDetails.forEach((company) => {
          delete company.contactStages;
          delete company.currentNote;
          delete company.isExistingNote;
          delete company.memberStatus;
          delete company.currentNote;
          if (company?.status) {
            const status = {};
            status['code'] = company.status.value;
            status['title'] = company.status.label;
            company.status = status;
          }
          if (company?.company) {
            const companyDetail = {};
            companyDetail['id'] = company?.company.value;
            companyDetail['name'] = company?.company.label;
            company.company = companyDetail;
          }
        });
      }
      setButtonLoading({ ...buttonLoading, submitLoading: true });
      if (params.id !== 'add') {
        const toastId = showToast(TOASTTYPES.loading, '', 'Update Contact...');
        await updateContact(params.id, rawData).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(
              TOASTTYPES.success,
              toastId,
              'Contact Updated Successfully'
            );
            if (history?.location?.status?.from) {
              history.push(history?.location?.status?.from);
            } else {
              history.push(`/contacts/all`);
            }
          }
        });
      } else {
        const toastId = showToast(TOASTTYPES.loading, '', 'Save Contact...');
        await saveCotanct(rawData).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(TOASTTYPES.success, toastId, 'Contact Save Successfully');
            if (history?.location?.status?.from) {
              history.push(history?.location?.status?.from);
            } else {
              history.push(`/contacts/all`);
            }
          }
        });
      }
      setButtonLoading({ ...buttonLoading, submitLoading: false });
    }
  };

  const addNotes = async (currentIndex) => {
    companyField.forEach((company, index) => {
      if (index === currentIndex) {
        const currentCompany = getValues(`companyDetails[${currentIndex}]`);
        if (currentCompany.currentNote !== '') {
          if (!currentCompany.isExistingNote) {
            currentCompany.notes.push({
              text: currentCompany.currentNote,
              createdAt: moment().toLocaleString(),
              userId: { firstName: user?.firstName, lastName: user?.lastName },
            });
            currentCompany.currentNote = '';
            setValue(`companyDetails[${currentIndex}]`, currentCompany);
          } else {
            currentCompany.notes.forEach((note) => {
              if (note.createdAt === currentCompany.isExistingNote.createdAt) {
                note.text = currentCompany.currentNote;
              }
            });
            currentCompany.currentNote = '';
            currentCompany.isExistingNote = false;
            setValue(`companyDetails[${currentIndex}]`, currentCompany);
          }
        }
      }
    });
    setIsNoteEdit(null);
  };

  const removeNote = (currentIndex, noteIndex) => {
    companyField.forEach((company, index) => {
      if (index === currentIndex) {
        const currentCompany = getValues(`companyDetails[${currentIndex}]`);
        const notes = currentCompany.notes.filter(
          (note, index) => index !== noteIndex
        );

        currentCompany.notes = notes;
        currentCompany.currentNote = '';
        setValue(`companyDetails[${currentIndex}]`, currentCompany);
      }
    });
  };

  const editNote = (currentIndex, noteIndex) => {
    companyField.forEach((company, index) => {
      if (index === currentIndex) {
        const currentCompany = getValues(`companyDetails[${currentIndex}]`);
        const notes = currentCompany.notes.filter(
          (note, index) => index === noteIndex
        );

        currentCompany.isExistingNote = notes[0];
        currentCompany.currentNote = notes[0].text;
        setValue(`companyDetails[${currentIndex}]`, currentCompany);
      }
    });
  };

  const addQuestion = () => {
    if (currentQuestionText.text !== '' && updateQuestion !== false) {
      fields.forEach((field, index) => {
        if (index === updateQuestion) {
          fields[index].question = currentQuestionText.text;

          setValue(
            `questions[${updateQuestion}].question`,
            currentQuestionText.text
          );
        }
      });
      setCurrentQuestionText({ text: '' });
      setOpenAddQuestion(false);
      setUpdateQuestion(false);
    } else {
      append({ question: currentQuestionText.text, answer: '' });
      setCurrentQuestionText({ text: '' });
      setOpenAddQuestion(false);
    }
  };

  const removeQuestion = (pos) => {
    return MySwal.fire({
      title: '',
      text: 'are you want to Delete this question?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Okay',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        remove(pos);
      }
    });
  };

  const editQuestion = (key) => {
    if (fields && fields.length > 0) {
      fields.forEach((field, index) => {
        if (index === key) {
          setCurrentQuestionText({ text: fields[index].question });
          setUpdateQuestion(key);
          setOpenAddQuestion(true);
        }
      });
    }
  };

  const removeCompany = (index) => {
    return MySwal.fire({
      title: '',
      text: 'are you want to Delete this company detail?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Okay',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        if (index <= companyField.length) {
          const deleteCompany = companyField.filter(
            (company, companyIndex) => companyIndex === index
          );
          if (deleteCompany && deleteCompany.length > 0) {
            const companyDetail = deleteCompany[0].company;
            const selectedCompany = getValues('company').filter(
              (company) => company.value !== companyDetail.value
            );
            setValue(`company`, selectedCompany);
          }
          const remaining = companyField.filter(
            (company, companyIndex) => companyIndex !== index
          );
          setValue(`companyDetails`, remaining);
        }
      }
    });
  };

  const handleChange = (e, statusIndex, status) => {
    companyField?.forEach((company, index) => {
      if (index === statusIndex) {
        company[status] = e;
        if (status === 'status') {
          company.showStatusError = false;
        } else {
          company.showMemberError = false;
        }
        setValue(`companyDetails[${statusIndex}]`, company);
      }
    });
  };

  const changeStatus = async (statusIndex, status) => {
    setButtonLoading({ ...buttonLoading, statusLoading: true });

    const promise = [];
    companyField?.forEach((company, index) => {
      if (index === statusIndex) {
        const currentCompany = getValues(`companyDetails[${statusIndex}]`);
        currentCompany.updateField = status;
        if (currentCompany?.status) {
          const status = {};
          status['code'] = currentCompany.status.value;
          status['title'] = currentCompany.status.label;
          currentCompany.status = status;
        }
        if (currentCompany?.company) {
          const companyDetail = {};
          companyDetail['id'] = currentCompany?.company.value;
          companyDetail['name'] = currentCompany?.company.label;
          currentCompany.company = companyDetail;
        }
        promise.push(updateContactStatus(params.id, currentCompany));
      }
    });
    const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');
    Promise.all(promise).then((res) => {
      if (res.error) {
        showToast(TOASTTYPES.error, toastId, res.error);
      } else {
        if (res[0]?.data?.data) {
          const updatedData = res[0]?.data?.data;
          companyField?.forEach((company, index) => {
            if (index === statusIndex) {
              if (status === 'status') {
                const obj = {};
                obj['value'] = updatedData?.status?.code;
                obj['label'] = updatedData?.status?.title;
                obj['id'] = updatedData.status?._id;

                company.status = obj;
                company.statusHistory = updatedData.statusHistory.reverse();
              }
              setValue(`companyDetails[${statusIndex}]`, company);
            }
          });
        }
        showToast(TOASTTYPES.success, toastId, 'Status Updated Successfully');
      }
    });
    setButtonLoading({ ...buttonLoading, statusLoading: false });
  };

  return (
    <UILoader blocking={loading}>
      <Card>
        <CardHeader>
          <CardTitle className='text-primary'>
            {params.id !== 'add' ? 'Update Contacts' : 'Add Contact'}
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
                <div className='fw-bold my-2 h5 text-primary mt-0'>
                  Contact Details
                </div>
                <Row>
                  <Col md={4}>
                    <FormField
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
                      type='text'
                      label='Email'
                      name='email'
                      placeholder='john@example.com'
                      errors={errors}
                      control={control}
                      {...register(`email`)}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className='auth-inner m-0 mt-3'>
              <Col className='px-0' md='12'>
                <Row>
                  <Col md={4}>
                    <FormField
                      type='phone'
                      label='Phone Number'
                      name='phone'
                      placeholder='Phone Number'
                      errors={errors}
                      control={control}
                      {...register(`phone`)}
                    />
                  </Col>
                  <Col md={4}>
                    <FormField
                      label='Address Line 1'
                      placeholder='Address Line 1'
                      type='text'
                      errors={errors}
                      control={control}
                      {...register(`address1`)}
                    />
                  </Col>
                  <Col md={4}>
                    <FormField
                      label='Address 2'
                      placeholder='Address 2'
                      type='text'
                      errors={errors}
                      control={control}
                      {...register(`address2`)}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className='auth-inner m-0 mt-3'>
              <Col className='px-0' md='12'>
                <Row>
                  <Col md={4}>
                    <FormField
                      type='text'
                      label='City'
                      name='city'
                      placeholder='City'
                      errors={errors}
                      control={control}
                      {...register(`city`)}
                    />
                  </Col>
                  <Col md={4}>
                    <FormField
                      type='text'
                      label='State'
                      name='state'
                      placeholder='State'
                      errors={errors}
                      control={control}
                      {...register(`state`)}
                    />
                  </Col>
                  <Col md={4}>
                    <FormField
                      label='Country'
                      placeholder='country'
                      type='text'
                      errors={errors}
                      control={control}
                      {...register(`country`)}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className='auth-inner m-0 mt-3'>
              <Col className='px-0' md='12'>
                <Row>
                  <Col md={4}>
                    <FormField
                      type='text'
                      label='Zip'
                      placeholder='Zip'
                      errors={errors}
                      control={control}
                      {...register(`zip`)}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className='auth-inner m-0 mt-3'>
              <Col className='px-0' md='12'>
                <div className='fw-bold my-2 h5 text-primary'>Questions</div>
                <Row className='mt-1'>
                  {fields &&
                    fields.length > 0 &&
                    fields.map((questionObj, index) => {
                      return (
                        <Fragment key={index}>
                          <Col md={4} className='mt-1'>
                            <FormField
                              infoElement={
                                <div key={`${index}_btn`}>
                                  <Edit2
                                    className='text-primary cursor-pointer'
                                    size={12}
                                    onClick={() => editQuestion(index)}
                                  />
                                  <X
                                    size={14}
                                    className='text-primary cursor-pointer'
                                    onClick={() => {
                                      removeQuestion(index);
                                    }}
                                  />
                                </div>
                              }
                              label={questionObj.question}
                              name={`questions[${index}].answer`}
                              placeholder={questionObj.question}
                              type='text'
                              errors={errors}
                              control={control}
                              className='mt-1'
                              {...register(`questions[${index}].answer`)}
                            />
                          </Col>
                        </Fragment>
                      );
                    })}
                  <Col md={4} className='mt-3'>
                    <Button
                      type='button'
                      color='primary'
                      size='md'
                      onClick={() => setOpenAddQuestion(!openAddQuestion)}
                      outline
                    >
                      <Plus size={15} />
                      <span className='align-middle ms-25'>Add Question</span>
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className='auth-inner mt-1'>
              <Col md='12'>
                <div className='fw-bold h5 text-primary mt-1'>Contact Info</div>
              </Col>
              <Col md='4'>
                <FormField
                  label='Company'
                  name='company'
                  placeholder='Select Company'
                  type='select'
                  errors={errors}
                  control={control}
                  options={companyName}
                  isMulti={'true'}
                  onChange={handleCompanyChange}
                />
              </Col>
            </Row>
            {companyField &&
              companyField.length > 0 &&
              companyField.map((field, index) => {
                return (
                  <Fragment key={index}>
                    <Row className='auth-inner mt-4'>
                      <div className='d-flex justify-content-between'>
                        <div>
                          <h3 className=' text-primary '>
                            {field.company.label}
                          </h3>
                        </div>
                        <div>
                          <X
                            className='text-primary cursor-pointer'
                            size={20}
                            onClick={() => removeCompany(index)}
                          />
                        </div>
                      </div>

                      <Col md='4'>
                        <label className='form-label form-label'>
                          Current Status
                        </label>
                        <Select
                          theme={selectThemeColors}
                          className={classnames('react-select', {
                            'is-invalid': field.showStatusError && true,
                          })}
                          placeholder={'Select current Status'}
                          classNamePrefix='select'
                          options={field.contactStages}
                          isClearable={false}
                          onChange={(e) => {
                            handleChange(e, index, 'status');
                          }}
                          defaultValue={field?.status}
                        />
                        {field.showMemberError ? (
                          <>
                            <span className='invalid-feedback'>
                              Please select current Status
                            </span>
                          </>
                        ) : null}

                        {params.id !== 'add' ? (
                          <div className='mt-1 update-status-btn d-flex align-items-center justify-content-center'>
                            <SaveButton
                              type='button'
                              name='Update Current Status'
                              width='210px'
                              onClick={() => {
                                changeStatus(index, 'status');
                              }}
                              loading={buttonLoading.statusLoading}
                            ></SaveButton>
                          </div>
                        ) : null}
                        <div className='mt-1'>
                          {field.statusHistory &&
                          field.statusHistory.length > 0 ? (
                            field.statusHistory.map((status, index) => {
                              if (index === 0) {
                                return (
                                  <div key={index}>
                                    <div className='d-flex align-items-center'>
                                      <div className='weighted-text left-stage'>
                                        {/* |{" "} */}
                                        {field.statusHistory[index]
                                          ? `${field.statusHistory[index]?.status.title}`
                                          : ''}
                                      </div>
                                      <ArrowRight size={15} />
                                      <div className='weighted-text right-stage'>
                                        {field.status?.label}
                                      </div>
                                    </div>
                                    <span className='text-primary h5'>
                                      {status?.changedBy?.firstName}{' '}
                                      {status?.changedBy?.lastName}
                                    </span>{' '}
                                    <span className='text-primary '>
                                      {moment(
                                        new Date(status.createdAt)
                                      ).format(
                                        `${
                                          user?.company?.dateFormat
                                            ? user?.company?.dateFormat
                                            : 'MM/DD/YYYY'
                                        }, HH:mm A`
                                      )}
                                    </span>{' '}
                                  </div>
                                );
                              }
                              return (
                                <div className='mt-1' key={index}>
                                  <div className='d-flex align-items-center'>
                                    <div className='weighted-text left-stage'>
                                      <div>
                                        {field.statusHistory[index - 1]
                                          ? field.statusHistory[index - 1]
                                              ?.status.title
                                          : ''}
                                      </div>
                                    </div>
                                    <ArrowRight size={15} />
                                    <div className='weighted-text right-stage'>
                                      {field.statusHistory[index].status.title}
                                    </div>
                                  </div>
                                  <span className='text-primary h5'>
                                    {status?.changedBy?.firstName}{' '}
                                    {status?.changedBy?.lastName}
                                  </span>{' '}
                                  <span className='text-primary '>
                                    {moment(new Date(status.createdAt)).format(
                                      `${
                                        user?.company?.dateFormat
                                          ? user?.company?.dateFormat
                                          : 'MM/DD/YYYY'
                                      }, HH:mm A`
                                    )}
                                  </span>{' '}
                                </div>
                              );
                            })
                          ) : (
                            <div className='text-center'>No Status History</div>
                          )}
                        </div>
                      </Col>
                      <Col md='4'>
                        <div className='mb-1'>
                          <FormField
                            label='Notes'
                            name={`companyDetails[${index}].currentNote`}
                            placeholder='Note'
                            type='textarea'
                            errors={errors}
                            control={control}
                            {...register(
                              `companyDetails[${index}].currentNote`
                            )}
                          />
                        </div>
                        <div className='d-flex align-items-center justify-content-center'>
                          <SaveButton
                            color='primary'
                            type='button'
                            onClick={() => addNotes(index)}
                            name={
                              !field.isExistingNote ? 'Add Note' : 'Update Note'
                            }
                            width='190px'
                            loading={buttonLoading.noteLoading}
                            // block
                          />
                        </div>
                        {field.notes && field.notes.length > 0 ? (
                          field.notes.map((note, key) => {
                            return (
                              <div className='mt-2' key={key}>
                                <span>{note.text}</span> |{' '}
                                <span className='text-primary h5'>
                                  {note?.userId?.firstName}{' '}
                                  {note?.userId?.lastName}
                                </span>{' '}
                                |
                                <span className='text-primary'>
                                  {moment(new Date(note.createdAt)).format(
                                    `${
                                      user?.company?.dateFormat
                                        ? user?.company?.dateFormat
                                        : 'MM/DD/YYYY'
                                    }, HH:mm A`
                                  )}
                                </span>{' '}
                                |{' '}
                                <X
                                  className='text-primary cursor-pointer'
                                  size={20}
                                  onClick={() => removeNote(index, key)}
                                />
                                <Edit2
                                  className='text-primary cursor-pointer'
                                  size={18}
                                  onClick={() => editNote(index, key)}
                                />
                              </div>
                            );
                          })
                        ) : (
                          <div className='text-center'>No notes added</div>
                        )}
                      </Col>
                    </Row>
                  </Fragment>
                );
              })}
            <div className='mt-2 d-flex align-items-center justify-content-center'>
              <SaveButton
                width='230px'
                className='mt-1 align-items-center justify-content-center'
                type='submit'
                loading={buttonLoading.submitLoading}
                name={params.id !== 'add' ? 'Update Contact' : 'Create Contact'}
              ></SaveButton>
            </div>
          </Form>
        </CardBody>
      </Card>
      <div>
        <Modal
          isOpen={openAddQuestion}
          toggle={() => setOpenAddQuestion(!openAddQuestion)}
          className='modal-dialog-centered'
          backdrop='static'
        >
          <ModalHeader toggle={() => setOpenAddQuestion(!openAddQuestion)}>
            {updateQuestion !== false ? 'Update Question' : 'Add Question'}
          </ModalHeader>
          <ModalBody>
            <div className='mb-2'>
              <Input
                label='Question'
                name='question'
                placeholder='Enter Question'
                type='text'
                value={currentQuestionText.text}
                onChange={(e) => {
                  if (showError) {
                    setShowError(false);
                  }
                  setCurrentQuestionText({
                    ...currentQuestionText,
                    text: e.target.value,
                  });
                }}
              />
              {showError ? (
                <>
                  <div className='mt-1 text-danger'>Please Enter Question.</div>
                </>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color='primary'
              onClick={() => {
                if (currentQuestionText.text === '') {
                  setShowError(true);
                } else {
                  addQuestion();
                }
              }}
            >
              {updateQuestion !== false ? 'Update' : 'Add'}
            </Button>
            <Button
              color='danger'
              onClick={() => setOpenAddQuestion(!openAddQuestion)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </UILoader>
  );
};

export default AddContact;
