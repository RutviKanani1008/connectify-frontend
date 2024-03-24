// ==================== Packages =======================
import { useEffect, useState, useMemo } from 'react';
import * as yup from 'yup';
import { useForm, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Form,
  Col,
  Row,
  Spinner,
  UncontrolledTooltip,
  Label,
  Input,
  FormFeedback,
} from 'reactstrap';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eye } from 'react-feather';
import moment from 'moment';
import Swal from 'sweetalert2';
// ====================================================
import { FormField } from '@components/form-fields';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { SaveButton } from '@components/save-button';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import {
  addMassEmail,
  sendMassEmailWithoutSave,
  updateMassEmail,
} from '../../../../api/massEmail';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import ContactCard from '../../event/components/ContactCard';
import { userData } from '../../../../redux/user';
import useMassEmailHelper from './hooks/useMassEmailHelper';
import { SendMassEmailModal } from './components/SendMassEmailModal';
import { FORM_SCHEDULE_TIMER } from '../../../../constant';
import { useGetMassEmailInitialDetail } from './service/massEmail.services';
import { required } from '../../../../configs/validationConstant';
import { useGetEmailSenderAPI } from './service/emailSender.service';
import EmailTemplatePreviewModal from '../../../templates/components/EmailTemplatePreviewModal';
import { useGetContactsForMassEmail } from '../../contact/hooks/useContactService';
import MassContactFilter from './components/MassContactFilter';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';

const massEmailSendSchema = yup.object().shape({
  template: yup
    .object()
    .shape({
      label: yup.string().required('Required'),
      value: yup.string().required('Required'),
    })
    .required('Template is required.')
    .nullable(),
  fromEmail: yup
    .object()
    .shape({
      label: yup.string().email().required('Required'),
      value: yup.string().email().required('Required'),
    })
    .required(required('From Email'))
    .nullable(),
});

const massEmailSchema = yup.object().shape({
  template: yup
    .object()
    .shape({
      label: yup.string().required('Required'),
      value: yup.string().required('Required'),
    })
    .required('Template is required.')
    .nullable(),
});

const MassEmailTools = () => {
  // ========================== Hooks =========================
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(massEmailSchema),
  });

  const {
    control: sendMailControl,
    handleSubmit: sendMailHandleSubmit,
    reset: sendMailReset,
    getValues: sendMailGetValues,
    setValue: sendMailSetValue,
    setError: sendMailSetError,
    clearErrors: sendMailClearErrors,
    formState: { errors: sendMailErrors },
  } = useForm({
    resolver: yupResolver(massEmailSendSchema),
    mode: 'onChange',
  });
  const { basicRoute } = useGetBasicRoute();
  const history = useHistory();
  const params = useParams();
  const user = useSelector(userData);

  // ============================== states ============================
  const [openSendMassEmail, setOpenSendMassEmail] = useState(false);
  const [sendingMassEmail, setSendingMassEmail] = useState(false);
  const [saveAsLoading, setSaveAsLoading] = useState(false);
  const [templatePreview, setTemplatesPreview] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [isMassEmailSent, setIsMassEmailSent] = useState('');
  const [selectedContact, setSelectedContact] = useState({
    checkAll: false,
    checkAllPages: false,
    selectedContact: {},
    unSelectedContact: {},
  });

  const unAssignFilter = {
    id: 'UnassignedItem',
    value: 'Unassigned',
    label: 'Unassigned',
  };
  const [filterValue, setFilterValue] = useState({
    group: [],
    status: [unAssignFilter],
    category: [unAssignFilter],
    tags: [unAssignFilter],
    pipeline: [unAssignFilter],
    stage: [],
  });

  // ========================== Custom Hooks =========================
  const { getEmailSenderAPI, isLoading: checkingSendingMail } =
    useGetEmailSenderAPI();

  const { getContacts, contactsData, isLoading } = useGetContactsForMassEmail({
    initialQuery: {
      select: 'firstName,lastName,email,group,hasUnsubscribed',
      archived: false,
      limit: 9,
      ...(params.id !== 'add' && { massTemplate: params.id }),
    },
    previousDataStore: true,
  });

  const {
    availableEmails,
    availableEmailTemplates,
    loading: emailTemplateLoading,
  } = useGetMassEmailInitialDetail({
    reset,
    setFilterValue,
    unAssignFilter,
    params,
    setSelectedContact,
  });

  const { handleChangeFilter, currentFilter, setCurrentFilter } =
    useMassEmailHelper({
      // availableContacts,
      filterValue,
      setFilterValue,
      unAssignFilter,
    });

  const selectedCheckedContactIds = useMemo(() => {
    return Object.keys(selectedContact.selectedContact).filter(
      (key) => selectedContact.selectedContact[key]
    );
  }, [selectedContact]);

  const unSelectedContactIds = useMemo(() => {
    if (!selectedContact.checkAllPages) {
      return [];
    }
    return Object.keys(selectedContact.unSelectedContact).filter(
      (key) => selectedContact.unSelectedContact[key]
    );
  }, [selectedContact]);

  const selectedCount = useMemo(() => {
    if (!selectedContact.checkAllPages) {
      return selectedCheckedContactIds.length;
    }

    return (
      contactsData.total -
      contactsData.unsSubscribedCount -
      unSelectedContactIds.length
    );
  }, [
    contactsData,
    selectedContact,
    selectedCheckedContactIds,
    unSelectedContactIds,
  ]);

  const isAllNotSelected = useMemo(() => {
    if (
      !selectedCheckedContactIds.length ||
      selectedCheckedContactIds.length === contactsData.total
    ) {
      return false;
    }

    if (!selectedContact.checkAllPages) {
      return true;
    }

    return !!unSelectedContactIds.length;
  }, [
    contactsData,
    selectedContact,
    selectedCheckedContactIds,
    unSelectedContactIds,
  ]);

  const selectedContactsFilters = useMemo(() => {
    const tableFilters = {
      company: user.company._id,
      hasUnsubscribed: false,
      page: 1,
    };

    // =====================================================
    Object.keys(currentFilter).forEach((key) => {
      if (currentFilter[key] !== null) {
        tableFilters[key] = currentFilter[key];
      }
    });

    tableFilters.mainSearch = currentFilter.search || '';
    delete tableFilters.search;

    return {
      is_all_selected: selectedContact.checkAllPages,
      selected_contacts: selectedCheckedContactIds,
      exceptions_contacts: unSelectedContactIds,
      ...tableFilters,
    };
  }, [
    user,
    currentFilter,
    selectedContact,
    selectedCheckedContactIds,
    unSelectedContactIds,
  ]);

  useEffect(() => {
    const currentCount = contactsData.results.filter(
      (obj) => !obj?.hasUnsubscribed
    ).length;

    if (currentCount === selectedCheckedContactIds.length) {
      if (selectedContact.checkAll === false) {
        setSelectedContact((prev) => ({ ...prev, checkAll: true }));
      }
    } else {
      if (selectedContact.checkAll === true) {
        setSelectedContact((prev) => ({ ...prev, checkAll: false }));
      }
    }
  }, [contactsData.results, selectedCheckedContactIds]);

  useEffect(() => {
    const filter = {};
    Object.keys(currentFilter).forEach((key) => {
      if (currentFilter[key] !== null) {
        if (_.isArray(currentFilter[key])) {
          currentFilter[key] = currentFilter?.[key].reduce(
            (previousVal, currentVal) => {
              // if (currentVal !== 'UnassignedItem')
              return [...previousVal, currentVal];
              // else return [...previousVal, 'UnassignedItem'];
            },
            []
          );
        }
        if (key === 'pipeline') {
          filter[key] = currentFilter[key]?.id;
        } else {
          filter[key] = currentFilter[key];
        }
      }
    });
    delete filter.page;

    if (currentFilter.page === 1) {
      setSelectedContact({
        checkAll: false,
        checkAllPages: false,
        selectedContact: {},
        unSelectedContact: {},
      });
    }
    getContacts({
      page: currentFilter.page,
      search: currentFilter.search || '',
      filters: { ...filter },
    });
  }, [currentFilter]);

  // here handle if checked selectAll that time new data arrival checked
  useEffect(() => {
    if (selectedContact.checkAllPages) {
      setSelectedContact((prev) => ({
        ...prev,
        selectedContact: {
          ...contactsData.results
            .filter((obj) => !obj.hasUnsubscribed)
            .reduce(
              (prevValue, obj) => ({ ...prevValue, [obj._id]: true }),
              {}
            ),
          ...prev.selectedContact,
        },
      }));
    }
  }, [contactsData.results]);

  const onSaveAs = async (values) => {
    const massEmail = JSON.parse(JSON.stringify(values));

    if (!selectedCheckedContactIds.length) {
      await showWarnAlert({
        title: '',
        text: 'Please select one or more contact.',
        icon: 'warning',
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
        customClass: {
          confirmButton: 'btn btn-primary',
        },
        buttonsStyling: false,
      });
    } else {
      if (params.id !== 'add') {
        if (!values.title) {
          setError(
            `title`,
            { type: 'focus', message: `Title is Required.` },
            { shouldFocus: true }
          );
          return;
        }
        const toastId = showToast(TOASTTYPES.loading, '', 'Processing...');
        setSaveAsLoading(true);
        if (!values.title) {
          setError(
            `title`,
            { type: 'focus', message: `Title is Required.` },
            { shouldFocus: true }
          );
          return;
        }
        massEmail.contacts = selectedCheckedContactIds;
        massEmail.company = user.company._id;
        massEmail.template = massEmail.template.value;

        // =====================================================
        massEmail.selected = selectedContact.checkAllPages
          ? 'All'
          : 'currentContacts';
        massEmail.exceptionsContacts = unSelectedContactIds;
        massEmail.massCreatedAt = new Date();
        const filter = {};
        Object.keys(currentFilter).forEach((key) => {
          if (currentFilter[key] !== null) {
            filter[key] = currentFilter[key];
          }
        });
        delete filter.page;
        delete filter.search;
        massEmail.filters = { ...filter };
        massEmail.search = currentFilter.search || '';

        updateMassEmail(params.id, massEmail).then((res) => {
          setSaveAsLoading(false);
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(
              TOASTTYPES.success,
              toastId,
              'Mass email update successfully!'
            );
            reset({});
            if (user.role === 'superadmin') {
              history.push(`${basicRoute}/mass-email`);
            } else if (user.role === 'admin') {
              history.push(`${basicRoute}/mass-email`);
            }
          }
        });
      } else {
        const result = await showWarnAlert({
          input: 'text',
          inputPlaceholder: 'Enter title',
          text: 'Enter title to save mass email.',
          showCancelButton: true,
          confirmButtonText: 'Save',
          allowOutsideClick: false,
          customClass: {
            cancelButton: 'btn btn-danger',
            confirmButton: 'btn btn-primary',
            input: 'form-control mt-1',
          },
          buttonsStyling: false,
          preConfirm: () => {
            if (!document.getElementsByClassName('swal2-input')?.[0]?.value) {
              Swal.showValidationMessage('Title is Required.');
            }
          },
          reverseButtons: true,
        });
        if (result.isConfirmed) {
          const toastId = showToast(TOASTTYPES.loading, '', 'Processing...');
          setSaveAsLoading(true);
          const obj = {};
          const template = getValues()?.template?.value;
          obj.contactsIds = selectedCheckedContactIds;
          obj.template = template;
          obj.company = user.company._id;
          // =====================================================
          obj.selected = selectedContact.checkAllPages
            ? 'All'
            : 'currentContacts';
          obj.contacts = selectedCheckedContactIds;
          obj.exceptionsContacts = unSelectedContactIds;
          obj.massCreatedAt = new Date();
          const filter = {};
          Object.keys(currentFilter).forEach((key) => {
            if (currentFilter[key] !== null) {
              // if (currentFilter[key] === 'UnassignedItem') {
              //   filter[key] = 'UnassignedItem';
              // } else {
              filter[key] = currentFilter[key];
              // }
            }
          });
          delete filter.page;
          delete filter.search;
          obj.title = result.value;
          obj.filters = { ...filter };
          obj.search = currentFilter.search || '';

          addMassEmail(obj).then((res) => {
            setSaveAsLoading(false);
            if (res?.error) {
              showToast(TOASTTYPES.error, toastId, res.error);
            } else {
              showToast(
                TOASTTYPES.success,
                toastId,
                'Mass email save as successfully!'
              );
              reset({});
              if (user.role === 'superadmin') {
                history.push(`${basicRoute}/mass-email`);
              } else if (user.role === 'admin') {
                history.push(`${basicRoute}/mass-email`);
              }
            }
          });
        }
      }
    }
  };

  const onSendMassEmail = async () => {
    const values = getValues();
    if (!values.template) {
      setError(
        `template`,
        { type: 'focus', message: `Template is required.` },
        { shouldFocus: true }
      );
    } else {
      if (!selectedCheckedContactIds.length) {
        await showWarnAlert({
          title: '',
          text: 'Please select one or more contact.',
          icon: 'warning',
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
          customClass: {
            confirmButton: 'btn btn-primary',
          },
          buttonsStyling: false,
        });
      } else {
        sendMailSetValue('template', getValues('template'));
        setOpenSendMassEmail(true);
      }
    }
  };

  const confirmedSendMassEmail = async (values) => {
    if (
      [...FORM_SCHEDULE_TIMER, { label: 'custom', value: 'custom' }].find(
        (obj) => obj.value === values.delay?.value
      ) &&
      !values.title
    ) {
      sendMailSetError(
        `title`,
        { type: 'focus', message: `Scheduled Job Title.` },
        { shouldFocus: true }
      );
    } else {
      const { data } = await getEmailSenderAPI({
        email: values.fromEmail.value,
        company: user.company?._id,
      });

      if (!(data[0].status === 'Verified')) {
        sendMailSetError(
          `fromEmail`,
          {
            type: 'focus',
            message: `Email is not verified,Please verify first.`,
          },
          { shouldFocus: true }
        );
        return;
      }

      if (values.delay.value === 'custom' && values.delayTime) {
        values.sendAfter =
          moment(values.delayTime).valueOf() - moment().valueOf();
      } else {
        values.sendAfter =
          moment().add(values.delay.value, 'minutes').valueOf() -
          moment().valueOf();
        values.delayTime = moment().add(values.delay.value, 'minutes').toDate();
      }

      if (values.sendAfter < 0) {
        values.sendAfter = 0;
      }

      const template = sendMailGetValues()?.template?.value;
      values.contactsIds = selectedCheckedContactIds;
      values.template = template;
      values.company = user.company._id;
      values.fromEmail = values.fromEmail.value;

      // =====================================================
      values.selected = selectedContact.checkAllPages
        ? 'All'
        : 'currentContacts';

      values.contacts = selectedCheckedContactIds;
      values.exceptionsContacts = unSelectedContactIds;
      values.massCreatedAt = new Date();

      const filter = {};
      Object.keys(currentFilter).forEach((key) => {
        if (currentFilter[key] !== null) {
          // if (currentFilter[key] === 'UnassignedItem') {
          //   filter[key] = 'UnassignedItem';
          // } else {
          filter[key] = currentFilter[key];
          // }
        }
      });
      delete filter.page;
      delete filter.search;
      values.filters = { ...filter };
      values.search = currentFilter.search || '';
      // =====================================================

      setSendingMassEmail(true);
      try {
        const res = await sendMassEmailWithoutSave(values);
        if (res.error) {
          showToast(TOASTTYPES.error, '', res.error);
        } else {
          showToast(TOASTTYPES.success, '', 'Mail Send Successfully!');
        }
        setIsMassEmailSent(
          values.delay?.value === 0
            ? 'Email sent successfully.'
            : 'Emails scheduled successfully.'
        );
        setSendingMassEmail(false);
      } catch (error) {
        setSendingMassEmail(false);
      }
      // onMassEmailSendClose();
    }
  };

  const onMassEmailSendClose = () => {
    setOpenSendMassEmail(false);
    sendMailReset({});
  };

  const getSelectContactValue = (key) => {
    return selectedContact.selectedContact?.[key];
  };

  const previewTemplate = () => {
    const selectedTemplate = getValues('template');

    const template = availableEmailTemplates.find(
      (temp) => temp._id === selectedTemplate.value
    );

    setTemplatesPreview(template);
    setPreviewModal(true);
  };

  const delayStatus = useWatch({ control: sendMailControl, name: 'delay' });

  const showTemplateError = () => {
    let tempError = { ...errors };
    {
      'template'.split('.').map((obj) => {
        if (tempError) {
          tempError = tempError[obj];
        }
      });
    }
    return tempError;
  };

  return (
    <div className='create__mass__email__page'>
      <Form
        className='auth-login-form create__mass__email__form'
        onSubmit={handleSubmit(onSaveAs)}
        autoComplete='off'
      >
        <Card>
          <CardHeader>
            <div className='left'>
              <span
                className='back-arrow'
                onClick={() => {
                  if (user.role === 'superadmin') {
                    history.push(`${basicRoute}/mass-email`);
                  } else {
                    history.push(`${basicRoute}/mass-email`);
                  }
                }}
                id={'goback'}
              >
                {/* <ArrowLeft
                  color='#a3db59'
                  className='cursor-pointer header-back-btn'
                /> */}
                <UncontrolledTooltip placement='top' target={`goback`}>
                  Go Back
                </UncontrolledTooltip>
              </span>
              <CardTitle>
                {params.id !== 'add'
                  ? 'Update Mass Email'
                  : 'Create Mass Email'}
              </CardTitle>
            </div>
            <div className='right'>
              <div className='btns-wrapper'>
                {params.id === 'add' ? (
                  <>
                    <SaveButton
                      id='send-mass-email-btn'
                      loading={sendingMassEmail}
                      width='165px'
                      type='button'
                      name='Prepare To Send'
                      onClick={() => {
                        selectedCheckedContactIds.length && onSendMassEmail();
                        const selectedTemplate = getValues('template');
                        const template = availableEmailTemplates.find(
                          (temp) => temp._id === selectedTemplate.value
                        );
                        sendMailSetValue(
                          'title',
                          `${template?.name} - ${moment(new Date()).format(
                            'MM-DD-YYYY HH:mm'
                          )}`
                        );
                        setIsMassEmailSent('');
                      }}
                      className={`prepare-btn ${
                        selectedCheckedContactIds.length ? '' : 'opacity-50'
                      }`}
                    ></SaveButton>

                    {!selectedCheckedContactIds.length && (
                      <UncontrolledTooltip
                        placement='top'
                        target='send-mass-email-btn'
                      >
                        Please select at least one contact
                      </UncontrolledTooltip>
                    )}
                    <SaveButton
                      id='save-as-mass-email-btn'
                      onClick={(e) =>
                        selectedCheckedContactIds.length &&
                        handleSubmit(onSaveAs)(e)
                      }
                      loading={saveAsLoading}
                      width={'100px'}
                      type='button'
                      name={'Save As'}
                      className={`save-as-btn ${
                        selectedCheckedContactIds.length ? '' : 'opacity-50'
                      }`}
                    ></SaveButton>
                    {!selectedCheckedContactIds.length && (
                      <UncontrolledTooltip
                        placement='top'
                        target='save-as-mass-email-btn'
                      >
                        Please select at least one contact
                      </UncontrolledTooltip>
                    )}
                  </>
                ) : (
                  <SaveButton
                    loading={saveAsLoading}
                    width={'185px'}
                    type='submit'
                    name='Update Mass Email'
                    className='submit-btn update-mass-email-btn'
                    disabled={!selectedCheckedContactIds.length}
                  ></SaveButton>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody className='custom-card-body'>
            <div className='title-template-row-wrapper'>
              <Row className='title-template-row'>
                {params.id !== 'add' && (
                  <Col className='title-field' md='6'>
                    <FormField
                      name='title'
                      label='Title'
                      placeholder='Enter Title'
                      type='text'
                      errors={errors}
                      control={control}
                    />
                  </Col>
                )}
                <Col className='select-template-field' md='6'>
                  <Label className='form-label max-w-90' for='template'>
                    Select Templates
                  </Label>
                  <div className='form-field-wrapper'>
                    <FormField
                      loading={emailTemplateLoading}
                      className='w-100'
                      name='template'
                      placeholder='Select Email template'
                      type='select'
                      errors={errors}
                      control={control}
                      options={availableEmails}
                    />
                    {getValues('template') && (
                      <span className='preview-icon' onClick={previewTemplate}>
                        <Eye size={20} />
                      </span>
                    )}
                  </div>
                  <FormFeedback style={{ display: 'block' }}>
                    {showTemplateError()?.message}
                  </FormFeedback>
                </Col>
              </Row>
            </div>
            <div className='contact-filters-wrapper'>
              <MassContactFilter
                setCurrentFilter={setCurrentFilter}
                currentFilter={currentFilter}
                filterValue={filterValue}
                handleChangeFilter={handleChangeFilter}
              />
            </div>
            {(isLoading && !contactsData.results?.length) ||
            (isLoading && currentFilter.page === 1) ||
            emailTemplateLoading ? (
              <div className='d-flex justify-content-center mt-2 mb-2'>
                <Spinner color='primary' />
              </div>
            ) : (
              <>
                <div className='create-mass-email-contact-header'>
                  <div className='left'>
                    <h3 className='heading'>Contacts</h3>
                    <span className='list-counter'>
                      ( <span className='label'>Total:</span>{' '}
                      <span className='value'>{contactsData.total}</span> ,{' '}
                      <span className='label'>Unsubscribe:</span>
                      <span className='value'>
                        {contactsData.unsSubscribedCount}
                      </span>{' '}
                      )
                    </span>
                  </div>
                  <div className='right'>
                    {(() => {
                      return selectedCheckedContactIds.length ? (
                        <div className='selected-contact-info'>
                          <span className='inner-wrapper'>
                            {selectedCount} contacts selected.{' '}
                            {isAllNotSelected ? (
                              <>
                                Do you want to{' '}
                                <span
                                  className='text-primary cursor-pointer'
                                  onClick={() => {
                                    setSelectedContact((prev) => ({
                                      ...prev,
                                      checkAllPages: true,
                                      unSelectedContact: {},
                                      selectedContact: {
                                        ...contactsData.results
                                          .filter((obj) => !obj.hasUnsubscribed)
                                          .reduce(
                                            (prevValue, obj) => ({
                                              ...prevValue,
                                              [obj._id]: true,
                                            }),
                                            {}
                                          ),
                                      },
                                    }));
                                  }}
                                >
                                  select all
                                </span>{' '}
                                {contactsData.total -
                                  contactsData.unsSubscribedCount}{' '}
                                records?
                              </>
                            ) : null}
                          </span>
                        </div>
                      ) : null;
                    })()}
                    <Input
                      className='ms-1'
                      type='checkbox'
                      checked={contactsData.total && selectedContact.checkAll}
                      onChange={(e) => {
                        if (selectedContact.checkAllPages && e.target.checked) {
                          setSelectedContact((prev) => ({
                            ...prev,
                            selectedContact: {
                              ...contactsData.results
                                .filter((obj) => !obj.hasUnsubscribed)
                                .reduce(
                                  (prevValue, obj) => ({
                                    ...prevValue,
                                    [obj._id]: true,
                                  }),
                                  {}
                                ),
                            },
                            unSelectedContact: {},
                            checkAll: e.target.checked,
                          }));
                        } else {
                          setSelectedContact((prev) => ({
                            ...prev,
                            selectedContact: e.target.checked
                              ? {
                                  ...contactsData.results
                                    .filter((obj) => !obj.hasUnsubscribed)
                                    .reduce(
                                      (prevValue, obj) => ({
                                        ...prevValue,
                                        [obj._id]: true,
                                      }),
                                      {}
                                    ),
                                }
                              : {},
                            unSelectedContact: {},
                            checkAllPages: false,
                            checkAll: e.target.checked,
                          }));
                        }
                      }}
                    />
                  </div>
                </div>
                <Row className='create-mass-email-contact-list'>
                  {contactsData.results?.length ? (
                    contactsData.results.map((contact, index) => (
                      <Col className='contact-col' md='4' key={index}>
                        <ContactCard
                          selectedContact={selectedContact}
                          setSelectedContact={setSelectedContact}
                          showUnsubscribe
                          label='invite'
                          index={index}
                          contact={contact}
                          errors={errors}
                          control={control}
                          getValues={getSelectContactValue}
                          setValue={(id, checked) => {
                            if (selectedContact.checkAllPages) {
                              setSelectedContact((prev) => ({
                                ...prev,
                                selectedContact: {
                                  ...prev.selectedContact,
                                  [id]: checked,
                                },
                                unSelectedContact: {
                                  ...prev.unSelectedContact,
                                  [id]: !checked,
                                },
                                checkAll: false,
                              }));
                            } else {
                              setSelectedContact((prev) => ({
                                ...prev,
                                selectedContact: {
                                  ...prev.selectedContact,
                                  [id]: checked,
                                },
                                checkAll: false,
                                checkAllPages: false,
                              }));
                            }
                          }}
                        />
                      </Col>
                    ))
                  ) : (
                    <>
                      <NoRecordFound />
                    </>
                  )}
                  {contactsData.total > contactsData.results?.length && (
                    <div className='text-center mt-1'>
                      <SaveButton
                        loading={isLoading}
                        outline
                        name='Load More'
                        width='150px'
                        onClick={() => {
                          const page = contactsData.results.length / 9;
                          setCurrentFilter((prev) => ({
                            ...prev,
                            page: page + 1,
                          }));
                          // getContacts({ page: page + 1 });
                        }}
                      />
                    </div>
                  )}
                </Row>
              </>
            )}
          </CardBody>
        </Card>
      </Form>
      {/* send mass email modal with it's detail */}
      {openSendMassEmail ? (
        <SendMassEmailModal
          getValues={getValues}
          availableEmailTemplates={availableEmailTemplates}
          isMassEmailSent={isMassEmailSent}
          getValue={sendMailGetValues}
          openSendMassEmail={openSendMassEmail}
          contactsData={contactsData}
          selectedCheckedContactIds={selectedCheckedContactIds}
          unSelectedContactIds={unSelectedContactIds}
          onMassEmailSendClose={onMassEmailSendClose}
          onSendMassEmail={confirmedSendMassEmail}
          handleSubmit={sendMailHandleSubmit}
          delayStatus={delayStatus}
          clearErrors={sendMailClearErrors}
          setValue={sendMailSetValue}
          control={sendMailControl}
          errors={sendMailErrors}
          fetchLoading={false}
          sendingMassEmail={sendingMassEmail || checkingSendingMail}
          initialFilters={selectedContactsFilters}
          selectedCount={selectedCount}
          emailTemplateLoading={emailTemplateLoading}
          availableEmails={availableEmails}
        />
      ) : null}

      {/* Preview Mass Email Template */}
      <EmailTemplatePreviewModal
        templatePreview={templatePreview}
        previewModal={previewModal}
        setPreviewModal={setPreviewModal}
        setTemplatesPreview={setTemplatesPreview}
      />
    </div>
  );
};

export default MassEmailTools;
