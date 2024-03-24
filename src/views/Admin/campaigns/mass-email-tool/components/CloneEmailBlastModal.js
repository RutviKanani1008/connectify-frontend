import {
  Button,
  Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Row,
  Label,
  FormFeedback,
  Input,
  UncontrolledTooltip,
} from 'reactstrap';
import _ from 'lodash';
import { useWatch } from 'react-hook-form';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { FORM_SCHEDULE_TIMER } from '../../../../../constant';
import CustomDatePicker from '../../../../../@core/components/form-fields/CustomDatePicker';
import { validateEmail } from '../../../../../utility/Utils';
import { selectThemeColors } from '@utils';
import {
  useAddEmailSenderAPI,
  useGetEmailSenderAPI,
  useReSendEmailSenderAPI,
} from '../service/emailSender.service';
import { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { SenderEmailOptionComponent } from './SenderEmailOptionComponent';
import { useSelector } from 'react-redux';
import { userData } from '../../../../../redux/user';
import { CheckCircle, Eye } from 'react-feather';
import { useHistory } from 'react-router-dom';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';
import {
  useGetEmailTemplates,
  useGetMassEmailContactFilterData,
} from '../service/massEmail.services';
import EmailTemplatePreviewModal from '../../../../templates/components/EmailTemplatePreviewModal';
import MassContactFilter from './MassContactFilter';
import ContactCard from '../../../event/components/ContactCard';
import { useGetScheduleMailContacts } from '../service/scheduledMassEmail.services';

export const CloneEmailBlast = (props) => {
  const {
    isMassEmailSent,
    selectedCheckedContactIds,
    onMassEmailSendClose,
    openSendMassEmail,
    onSendMassEmail,
    handleSubmit,
    clearErrors,
    setValue,
    control,
    errors,
    fetchLoading,
    getValue,
    sendingMassEmail,
    selectedCount,
    reFetchScheduledMassEmailJobs,
    setSelectedContact,
    setCurrentFilter,
    currentFilter,
    isAllNotSelected,
    handleChangeFilter,
    getSelectContactValue,
    selectedContact,
    filterValue,
    contactsData,
    isLoading,
    getContacts,
    cloneMailBlastId,
    unAssignFilter,
    setFilterValue,
  } = props;
  const minDate = new Date();

  const history = useHistory();
  const user = useSelector(userData);
  const currentCompanyName = user?.company?.name;
  const currentCompanyEmail = user?.company?.email;
  const selectedEmail = useWatch({ control, name: `fromEmail` });
  const title = useWatch({ control, name: `title` });
  const template = useWatch({ control, name: `template` });
  const delayStatus = useWatch({ control, name: 'delay' });

  const [templatePreview, setTemplatesPreview] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [showMessage, seShowMessage] = useState(false);
  const [fromEmailOptions, setFromEmailOptions] = useState([]);

  // ** Custom Hooks **
  const { basicRoute } = useGetBasicRoute();
  const {
    getEmailTemplates,
    templateOption,
    emailTemplates,
    isLoading: mailTemplateLoading,
  } = useGetEmailTemplates();
  // here get filter data
  useGetMassEmailContactFilterData({
    setFilterValue,
    unAssignFilter,
  });

  // API Service
  const { addEmailSenderAPI, isLoading: addingEmail } = useAddEmailSenderAPI();
  const { reSendEmailSenderAPI } = useReSendEmailSenderAPI();
  const { getEmailSenderAPI, getSendMailListLoading } = useGetEmailSenderAPI();
  const { getScheduleMailContacts } = useGetScheduleMailContacts();

  useEffect(() => {
    const filter = {};
    Object.keys(currentFilter).forEach((key) => {
      if (currentFilter[key] !== null) {
        if (_.isArray(currentFilter[key])) {
          currentFilter[key] = currentFilter?.[key].reduce(
            (previousVal, currentVal) => {
              return [...previousVal, currentVal];
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
      cloneMailBlastId,
    });
  }, [currentFilter]);

  useEffect(() => {
    getEmailSender();
    getEmailTemplates();
    getMassEmailContacts();
  }, []);

  useEffect(() => {
    let timeOut;
    if (showMessage) {
      timeOut = setTimeout(() => {
        seShowMessage(false);
      }, 10000);
    }
    return () => {
      clearTimeout(timeOut);
    };
  }, [showMessage]);

  useEffect(() => {
    setValue('title', title);
  }, [title]);

  const handleChangeEmail = async (email) => {
    if (email) {
      const isValid = validateEmail(email.value);
      if (email?.__isNew__) {
        setFromEmailOptions((prev) => [
          {
            value: email.value,
            label: email.label,
            verified: false,
            isDisabled: true,
          },
          ...prev,
        ]);
      }
      if (isValid) {
        const { data, error } = await addEmailSenderAPI({
          email: email.value,
          company: user.company?._id,
        });
        if (data?.length === 0 && !error) {
          seShowMessage(true);
        }
      }

      setValue('fromEmail', isValid ? email : null);
    }
  };

  const getEmailSender = async () => {
    const { data, error } = await getEmailSenderAPI({
      company: user.company?._id,
    });
    if (_.isArray(data) && !error) {
      const emailOptions = data.map((obj) => ({
        value: obj.email,
        label: obj.email,
        verified: obj.status === 'Verified',
        isDisabled: !(obj.status === 'Verified'),
      }));

      setFromEmailOptions(emailOptions);
      setInitialSender(emailOptions);
    }
  };

  const getMassEmailContacts = async () => {
    const { data, error } = await getScheduleMailContacts(cloneMailBlastId, {
      select: '_id',
    });

    if (_.isArray(data) && !error) {
      setSelectedContact((prev) => ({
        ...prev,
        selectedContact: data.reduce(
          (prevValue, obj) => ({ ...prevValue, [obj._id]: true }),
          {}
        ),
      }));
    }
  };

  const setInitialSender = async (emailOptions) => {
    /* If Company Email */
    const hasCompanyEmail = emailOptions.find(
      (c) => c.value === currentCompanyEmail
    );

    if (currentCompanyEmail && !hasCompanyEmail) {
      const newOpt = {
        value: currentCompanyEmail,
        label: currentCompanyEmail,
        verified: 'Verified',
        isDisabled: false,
      };
      emailOptions.push(newOpt);

      const { error } = await addEmailSenderAPI({
        email: currentCompanyEmail,
        company: user.company?._id,
      });

      if (!error) {
        setValue('fromName', currentCompanyName);
        setValue('fromEmail', newOpt);
        return;
      }
    }

    setValue('fromName', currentCompanyName);
    setValue('fromEmail', hasCompanyEmail);
  };

  const handleSendReverifyMail = async (obj) => {
    await reSendEmailSenderAPI({ email: obj }, 'Sending email');
  };

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

  const previewTemplate = () => {
    const selectedTemplate = getValue('template');

    const template = emailTemplates.find(
      (temp) => temp._id === selectedTemplate.value
    );

    setTemplatesPreview(template);
    setPreviewModal(true);
  };

  return (
    <>
      <Modal
        isOpen={openSendMassEmail}
        toggle={() => {
          onMassEmailSendClose();
        }}
        backdrop='static'
        className='modal-dialog-centered clone-mass-email modal-dialog-mobile'
        size='xl'
      >
        <ModalHeader
          toggle={() => {
            onMassEmailSendClose();
          }}
        >
          Clone Mass Mail
        </ModalHeader>
        <ModalBody>
          {isMassEmailSent ? (
            <div className='w-100 text-center mb-1'>
              <CheckCircle size={150} className='mt-3' color='green' />
              <p className='mt-3 h4'>{isMassEmailSent}</p>
            </div>
          ) : fetchLoading ? (
            <div className='d-flex align-items-center justify-content-center h-100'>
              <Spinner />
            </div>
          ) : (
            <div>
              <Form
                className='auth-login-form create__mass__email__form'
                onSubmit={handleSubmit(onSendMassEmail)}
                autoComplete='off'
              >
                <div className='info-normal-text'>
                  Are you sure you want to send this email to all the contacts ?
                </div>

                <Row className='mt-1 job-title-row'>
                  <Col lg='3' md='3' sm='6'>
                    <FormField
                      name='title'
                      label='Scheduled Job Title'
                      placeholder='Enter Title'
                      type='text'
                      errors={errors}
                      control={control}
                    />
                  </Col>
                </Row>
                <Row className='mt-1 cloneMass-mail-topHeader-fields-wrapper'>
                  <Col className='select-template-field' lg='3' md='3' sm='6'>
                    <Label className='form-label max-w-90' for='template'>
                      Select Templates
                    </Label>
                    <div className='form-field-wrapper'>
                      <FormField
                        key={template}
                        loading={mailTemplateLoading}
                        className='w-100'
                        name='template'
                        placeholder='Select Email template'
                        type='select'
                        errors={errors}
                        control={control}
                        options={templateOption}
                      />
                      {getValue('template') && (
                        <span
                          className='preview-icon'
                          onClick={previewTemplate}
                        >
                          <Eye size={20} />
                        </span>
                      )}
                    </div>
                    <FormFeedback style={{ display: 'block' }}>
                      {showTemplateError()?.message}
                    </FormFeedback>
                  </Col>
                  <Col lg='3' md='3' sm='6'>
                    <FormField
                      name='delay'
                      label='Delay'
                      placeholder='Select Timer'
                      type='select'
                      errors={errors}
                      control={control}
                      defaultValue={{ value: 0, label: 'Instantly' }}
                      options={[
                        ...FORM_SCHEDULE_TIMER,
                        { label: 'custom', value: 'custom' },
                      ]}
                    />
                  </Col>
                  {delayStatus && delayStatus?.value === 'custom' && (
                    <Col lg='3' md='3' sm='6'>
                      <CustomDatePicker
                        value={getValue('delayTime') || minDate}
                        errors={errors}
                        name='delayTime'
                        label='Start Date'
                        options={{ minDate }}
                        onChange={(date) => {
                          clearErrors('delayTime');
                          setValue('delayTime', date[0]);
                        }}
                      />
                    </Col>
                  )}

                  {/* <Col lg='3' md='3' sm='6'>
                      <FormField
                        name='preHeader'
                        label='Pre Header Title'
                        placeholder='Enter Pre Header Title'
                        type='text'
                        errors={errors}
                        control={control}
                      />
                    </Col> */}
                  <Col lg='3' md='3' sm='6'>
                    <FormField
                      name='fromName'
                      label='Sender Name'
                      placeholder='Enter Sender Name'
                      type='text'
                      errors={errors}
                      control={control}
                    />
                  </Col>
                  <Col lg='3' md='3' sm='6' className='sender__email__dd__wp'>
                    <Label className='form-label max-w-90'>Sender Email</Label>
                    <CreatableSelect
                      key={selectedEmail}
                      isOptionDisabled={(option) => option.isDisabled}
                      onFocus={getEmailSender}
                      className='react-select'
                      isLoading={getSendMailListLoading || addingEmail}
                      name='fromEmail'
                      placeholder='Sender Email'
                      label='Sender Email'
                      classNamePrefix='custom-select'
                      options={fromEmailOptions}
                      value={selectedEmail}
                      onChange={(value) => {
                        handleChangeEmail(value);
                      }}
                      theme={selectThemeColors}
                      components={{
                        Option: (propsDetails) => {
                          const { data, ...props } = propsDetails;
                          return (
                            <SenderEmailOptionComponent
                              handleSendReverifyMail={handleSendReverifyMail}
                              optionsProps={props}
                              data={data}
                            />
                          );
                        },
                      }}
                    />
                    {errors?.['fromEmail'] && (
                      <FormFeedback style={{ display: 'block' }}>
                        From email is required
                      </FormFeedback>
                    )}
                    {showMessage && (
                      <div className='is-invalid invalid-feedback d-block'>
                        Please verify your email address,mail send to be your
                        this mail address.
                      </div>
                    )}
                  </Col>
                </Row>
                <div className='contact-filters-wrapper'>
                  <MassContactFilter
                    setCurrentFilter={setCurrentFilter}
                    currentFilter={currentFilter}
                    filterValue={filterValue}
                    handleChangeFilter={handleChangeFilter}
                  />
                </div>
                {(isLoading && !contactsData.results?.length) ||
                (isLoading && currentFilter.page === 1) ? (
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
                          <span className='label'>Unsubscribe:</span>{' '}
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
                              <div className='inner-wrapper'>
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
                                              .filter(
                                                (obj) => !obj.hasUnsubscribed
                                              )
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
                              </div>
                            </div>
                          ) : null;
                        })()}
                        <Input
                          className='ms-1'
                          type='checkbox'
                          checked={
                            contactsData.total && selectedContact.checkAll
                          }
                          onChange={(e) => {
                            if (
                              selectedContact.checkAllPages &&
                              e.target.checked
                            ) {
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
                          <div className='mt-2 mb-3 h5 text-center'>
                            Contact Not Found!
                          </div>
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
                            }}
                          />
                        </div>
                      )}
                    </Row>
                  </>
                )}
              </Form>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {isMassEmailSent ? (
            <Button
              color='primary'
              onClick={() => {
                if (reFetchScheduledMassEmailJobs) {
                  reFetchScheduledMassEmailJobs();
                  onMassEmailSendClose();
                } else {
                  history.push(`${basicRoute}/mass-email`);
                }
              }}
            >
              Okay
            </Button>
          ) : (
            <>
              <Button
                color='danger'
                onClick={() => {
                  onMassEmailSendClose();
                }}
              >
                Close
              </Button>
              <Form
                className='auth-login-form'
                onSubmit={handleSubmit(onSendMassEmail)}
                autoComplete='off'
              >
                <SaveButton
                  id='send-mass-email-btn'
                  loading={sendingMassEmail}
                  width='180px'
                  // outline={true}
                  type='button'
                  color='primary'
                  name={'Send Mass Email'}
                  onClick={() => {
                    selectedCheckedContactIds.length &&
                      handleSubmit(onSendMassEmail)();
                  }}
                  className='align-items-center justify-content-center'
                ></SaveButton>
                {!selectedCheckedContactIds.length && (
                  <UncontrolledTooltip
                    placement='top'
                    target='send-mass-email-btn'
                  >
                    Please select at least one contact
                  </UncontrolledTooltip>
                )}
              </Form>
            </>
          )}
        </ModalFooter>
      </Modal>

      {/* Preview Mass Email Template */}
      {templatePreview && previewModal && (
        <EmailTemplatePreviewModal
          templatePreview={templatePreview}
          previewModal={previewModal}
          setPreviewModal={setPreviewModal}
          setTemplatesPreview={setTemplatesPreview}
        />
      )}
    </>
  );
};
