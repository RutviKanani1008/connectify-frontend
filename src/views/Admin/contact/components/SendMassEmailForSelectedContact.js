/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { useSelector } from 'react-redux';
import {
  Button,
  Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Label,
  FormFeedback,
} from 'reactstrap';
import _ from 'lodash';
import * as yup from 'yup';
import { useForm, useWatch } from 'react-hook-form';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { selectThemeColors } from '@utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { required } from '../../../../configs/validationConstant';
import { userData } from '../../../../redux/user';
import { validateEmail } from '../../../../utility/Utils';
import { FORM_SCHEDULE_TIMER } from '../../../../constant';
import CustomDatePicker from '../../../../@core/components/form-fields/CustomDatePicker';
import ContactCard from '../../event/components/ContactCard';
import {
  useAddEmailSenderAPI,
  useGetEmailSenderAPI,
  useReSendEmailSenderAPI,
} from '../../campaigns/mass-email-tool/service/emailSender.service';
import { SenderEmailOptionComponent } from '../../campaigns/mass-email-tool/components/SenderEmailOptionComponent';
import moment from 'moment';
import { TOASTTYPES, showToast } from '../../../../utility/toast-helper';
import { sendMassEmailFromContactList } from '../../../../api/massEmail';
import { Eye } from 'react-feather';
import { useGetEmailTemplates } from '../../campaigns/mass-email-tool/service/massEmail.services';
import EmailTemplatePreviewModal from '../../../templates/components/EmailTemplatePreviewModal';
import { SendGridApiKeyErrorPage } from '../../campaigns/mass-email-tool/components/SendGridApiKeyErrorPage';
import ServerSideTable from '../../../../@core/components/data-table/ServerSideTable';
import { useGetSelectedContactsForMassEmail } from '../hooks/useContactService';
import useContactColumns from '../hooks/useContactColumns';

const massEmailSendSchema = yup.object().shape({
  fromEmail: yup
    .object()
    .shape({
      label: yup.string().email().required('Required'),
      value: yup.string().email().required('Required'),
    })
    .required(required('From Email'))
    .nullable(),
  template: yup
    .object()
    .shape({
      label: yup.string().required('Required'),
      value: yup.string().required('Required'),
    })
    .required(required('From Email'))
    .nullable(),
});

const SendMassEmailForSelectedContact = (props) => {
  const {
    selectedContacts,
    open,
    setOpen,
    initialFilters,
    handleCloseMassEmail,
    selectedRowsFilters,
    selectedRowLength,
  } = props;
  const minDate = new Date();
  const tableRef = useRef(null);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(massEmailSendSchema),
    mode: 'onChange',
  });

  const user = useSelector(userData);
  const currentCompanyName = user?.company?.name;
  const currentCompanyEmail = user?.company?.email;
  const selectedEmail = useWatch({ control, name: `fromEmail` });
  const delayStatus = useWatch({ control, name: 'delay' });

  const [showMessage, seShowMessage] = useState(false);
  const [fromEmailOptions, setFromEmailOptions] = useState([]);
  const [sendingMassEmail, setSendingMassEmail] = useState(false);
  const [templatePreview, setTemplatesPreview] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);

  const [showContacts, setShowContacts] = useState(false);

  // API Service
  const { addEmailSenderAPI, isLoading: addingEmail } = useAddEmailSenderAPI();
  const { reSendEmailSenderAPI } = useReSendEmailSenderAPI();
  const { getEmailSenderAPI, isLoading } = useGetEmailSenderAPI();

  const {
    getSelectedContacts,
    contactsData,
    isLoading: contactsLoading,
  } = useGetSelectedContactsForMassEmail({ initialQuery: initialFilters });

  const {
    templateOption,
    emailTemplates,
    getEmailTemplates,
    isLoading: getEmailTemplateLoading,
  } = useGetEmailTemplates();

  const { columns } = useContactColumns({
    handleConfirmDeleteAndArchive: () => {},
    user,
    showActions: false,
  });

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
    getEmailSender();
    getEmailTemplates();
  }, []);

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

  const onSendMassEmail = async (values) => {
    if (
      [...FORM_SCHEDULE_TIMER, { label: 'custom', value: 'custom' }].find(
        (obj) => obj.value === values.delay?.value
      ) &&
      !values.title
    ) {
      setError(
        `title`,
        { type: 'focus', message: `Scheduled Job Title.` },
        { shouldFocus: true }
      );
    } else {
      setSendingMassEmail(true);
      const { data } = await getEmailSenderAPI({
        email: values.fromEmail.value,
        company: user.company?._id,
      });
      setSendingMassEmail(false);

      if (!(data[0].status === 'Verified')) {
        setError(
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

      const template = getValues()?.template?.value;
      values.template = template;
      values.company = user.company._id;
      values.fromEmail = values.fromEmail.value;
      values.contactFilters = initialFilters;
      values.isContactRequest = true;

      // =====================================================
      setSendingMassEmail(true);

      try {
        const res = await sendMassEmailFromContactList(values);
        if (res.error) {
          showToast(TOASTTYPES.error, '', res.error);
        } else {
          handleCloseMassEmail();
          showToast(TOASTTYPES.success, '', 'Mail Send Successfully.');
        }
        setSendingMassEmail(false);
      } catch (error) {
        setSendingMassEmail(false);
      }
    }
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
    const selectedTemplate = getValues('template');

    const template = emailTemplates.find(
      (temp) => temp._id === selectedTemplate.value
    );

    setTemplatesPreview(template);
    setPreviewModal(true);
  };

  return (
    <>
      <Modal
        isOpen={open}
        toggle={() => {
          setOpen(!open);
        }}
        backdrop='static'
        className='modal-dialog-centered email-template-preview'
        size='xl'
      >
        <ModalHeader
          toggle={() => {
            setOpen(!open);
          }}
        >
          Send Mass Mail
        </ModalHeader>
        <ModalBody>
          {user?.integration?.sendGrid?.apiKey ? (
            <>
              <div>
                <Form
                  className='auth-login-form'
                  onSubmit={handleSubmit(onSendMassEmail)}
                  autoComplete='off'
                >
                  <Row className='mt-1'>
                    <Col lg='3' md='3' sm='6'>
                      <Label className='form-label max-w-90' for='template'>
                        Select Templates
                      </Label>
                      <div className='d-flex align-items-center'>
                        <FormField
                          loading={getEmailTemplateLoading}
                          className='w-100'
                          name='template'
                          placeholder='Select Email template'
                          type='select'
                          errors={errors}
                          control={control}
                          options={templateOption}
                        />
                        {getValues('template') && (
                          <span
                            className='text-primary cursor-pointer ms-1'
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
                          value={getValues('delayTime') || minDate}
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
                      <Label className='form-label max-w-90'>
                        Sender Email
                      </Label>
                      <CreatableSelect
                        isOptionDisabled={(option) => option.isDisabled}
                        onFocus={getEmailSender}
                        className='react-select'
                        isLoading={isLoading || addingEmail}
                        name='fromEmail'
                        placeholder='Sender Email'
                        label='Sender Email'
                        classNamePrefix='select'
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
                    <h5 className='mt-2'>
                      {selectedRowLength || 0} Contacts Selected{' '}
                      <a
                        className='text-primary'
                        onClick={() => setShowContacts(true)}
                      >
                        Click Here{' '}
                      </a>
                      to view all contacts
                    </h5>
                  ) : (
                    <ServerSideTable
                      header={<></>}
                      ref={tableRef}
                      blocking={contactsLoading}
                      initialTableFilters={initialFilters}
                      selectableRows={false}
                      columns={columns}
                      getRecord={getSelectedContacts}
                      data={contactsData}
                      itemsPerPage={10}
                    />
                  )}

                  {/* <Row className='event-contact-list-wrapper mt-1'>
                    {selectedContacts?.map((contact, index) => {
                      return (
                        <Col lg='3' md='6' sm='12' key={index}>
                          <ContactCard
                            label='invite'
                            index={index}
                            contact={contact}
                            showCheckbox={false}
                            showUnsubscribe
                          />
                        </Col>
                      );
                    })}
                  </Row> */}
                </Form>
              </div>
            </>
          ) : (
            <>
              <SendGridApiKeyErrorPage />
            </>
          )}
          {/* )} */}
        </ModalBody>
        <ModalFooter>
          <Form
            className='auth-login-form'
            onSubmit={handleSubmit(onSendMassEmail)}
            autoComplete='off'
          >
            {user?.integration?.sendGrid?.apiKey && (
              <SaveButton
                loading={sendingMassEmail}
                width='270px'
                outline={true}
                type='submit'
                color='primary'
                name={`Send Mass Email To ${selectedRowLength || 0} contacts`}
                className='align-items-center justify-content-center'
              ></SaveButton>
            )}
          </Form>
          <Button
            color='danger'
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
      {/* Preview Mass Email Template */}
      <EmailTemplatePreviewModal
        templatePreview={templatePreview}
        previewModal={previewModal}
        setPreviewModal={setPreviewModal}
        setTemplatesPreview={setTemplatesPreview}
      />
    </>
  );
};

export default SendMassEmailForSelectedContact;
