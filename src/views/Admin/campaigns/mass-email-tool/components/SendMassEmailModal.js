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
import { useEffect, useRef, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { SenderEmailOptionComponent } from './SenderEmailOptionComponent';
import { useSelector } from 'react-redux';
import { userData } from '../../../../../redux/user';
import { CheckCircle, Eye } from 'react-feather';
import { useGetSelectedContactsForMassEmail } from '../../../contact/hooks/useContactService';
import ServerSideTable from '../../../../../@core/components/data-table/ServerSideTable';
import useContactColumns from '../../../contact/hooks/useContactColumns';
import { useHistory } from 'react-router-dom';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';
import { useGetEmailTemplates } from '../service/massEmail.services';
import EmailTemplatePreviewModal from '../../../../templates/components/EmailTemplatePreviewModal';

export const SendMassEmailModal = (props) => {
  const {
    isMassEmailSent,
    massEmailId = null,
    selectedCheckedContactIds,
    onMassEmailSendClose,
    openSendMassEmail,
    onSendMassEmail,
    handleSubmit,
    delayStatus,
    clearErrors,
    setValue,
    control,
    errors,
    fetchLoading,
    getValue,
    sendingMassEmail,
    initialFilters = {},
    selectedCount,
    reFetchScheduledMassEmailJobs,
    emailTemplateLoading,
    availableEmails,
    availableEmailTemplates,
    fromEmailList = false,
  } = props;
  const minDate = new Date();
  const tableRef = useRef(null);

  const history = useHistory();
  const user = useSelector(userData);
  const currentCompanyName = user?.company?.name;
  const currentCompanyEmail = user?.company?.email;
  const selectedEmail = useWatch({ control, name: `fromEmail` });
  const title = useWatch({ control, name: `title` });
  const template = useWatch({ control, name: `template` });

  const [templatePreview, setTemplatesPreview] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [showMessage, seShowMessage] = useState(false);
  const [fromEmailOptions, setFromEmailOptions] = useState([]);
  const [showContacts, setShowContacts] = useState(false);

  // ** Custom Hooks **
  const { basicRoute } = useGetBasicRoute();
  const {
    getEmailTemplates,
    templateOption,
    emailTemplates,
    isLoading: mailTemplateLoading,
  } = useGetEmailTemplates();

  // API Service
  const { addEmailSenderAPI, isLoading: addingEmail } = useAddEmailSenderAPI();
  const { reSendEmailSenderAPI } = useReSendEmailSenderAPI();
  const { getEmailSenderAPI, isLoading } = useGetEmailSenderAPI();

  const { columns } = useContactColumns({
    handleConfirmDeleteAndArchive: () => {},
    user,
    showActions: false,
  });

  const {
    getSelectedContacts,
    contactsData: contactsTableData,
    isLoading: contactsLoading,
  } = useGetSelectedContactsForMassEmail({
    initialQuery: initialFilters,
    massEmailId,
  });

  useEffect(() => {
    getEmailSender();
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
    fromEmailList && getEmailTemplates();
  }, [fromEmailList]);

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
        setValue('fromEmail', null);
      } else {
        setValue('fromEmail', isValid ? email : null);
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

    const template = fromEmailList
      ? emailTemplates
      : availableEmailTemplates.find(
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
        className='modal-dialog-centered send-mass-email send-mass-email-modal modal-dialog-mobile'
        size='xl'
      >
        <ModalHeader
          toggle={() => {
            onMassEmailSendClose();
          }}
        >
          Send Mass Mail
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
                className='auth-login-form'
                onSubmit={handleSubmit(onSendMassEmail)}
                autoComplete='off'
              >
                <div className='normal-text'>
                  Are you sure you want to send this email to all the contacts ?
                </div>
                <Row className='top-header mt-1'>
                  <Col md='3'>
                    <FormField
                      name='title'
                      label='Scheduled Job Title'
                      placeholder='Enter Title'
                      type='text'
                      errors={errors}
                      control={control}
                    />
                  </Col>
                  <Col
                    className='select-template-field mb-1'
                    lg='3'
                    md='3'
                    sm='6'
                  >
                    <Label className='form-label max-w-90' for='template'>
                      Select Templates
                    </Label>
                    <div className='form-field-wrapper'>
                      <FormField
                        key={template}
                        loading={emailTemplateLoading || mailTemplateLoading}
                        className='w-100'
                        name='template'
                        placeholder='Select Email template'
                        type='select'
                        errors={errors}
                        control={control}
                        options={
                          fromEmailList ? templateOption : availableEmails
                        }
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
                  <Col className='mb-1' lg='3' md='3' sm='6'>
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
                    <Col className='mb-1' lg='3' md='3' sm='6'>
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
                  <Col className='mb-1' lg='3' md='3' sm='6'>
                    <FormField
                      name='fromName'
                      label='Sender Name'
                      placeholder='Enter Sender Name'
                      type='text'
                      errors={errors}
                      control={control}
                    />
                  </Col>
                  <Col
                    lg='3'
                    md='3'
                    sm='6'
                    className='sender__email__dd__wp mb-1'
                  >
                    <Label className='form-label max-w-90'>Sender Email</Label>
                    <CreatableSelect
                      isOptionDisabled={(option) => option.isDisabled}
                      onFocus={getEmailSender}
                      className='react-select'
                      isLoading={isLoading || addingEmail}
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
                {!showContacts ? (
                  <div className='info-text-wrapper'>
                    <div className='inner-wrapper'>
                      {selectedCount || selectedCheckedContactIds?.length || 0}{' '}
                      Contacts Selected{' '}
                      <a
                        className='text-primary'
                        onClick={() => setShowContacts(true)}
                      >
                        Click Here{' '}
                      </a>
                      to view all contacts
                    </div>
                  </div>
                ) : (
                  <ServerSideTable
                    header={<></>}
                    ref={tableRef}
                    blocking={contactsLoading}
                    initialTableFilters={initialFilters}
                    selectableRows={false}
                    columns={columns}
                    getRecord={getSelectedContacts}
                    data={contactsTableData}
                    itemsPerPage={10}
                  />
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
                  loading={sendingMassEmail}
                  width='180px'
                  // outline={true}
                  type='submit'
                  color='primary'
                  name={'Send Mass Email'}
                  className='align-items-center justify-content-center'
                ></SaveButton>
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
