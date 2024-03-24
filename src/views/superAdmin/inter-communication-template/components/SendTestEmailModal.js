// ==================== Packages =======================
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { FormField } from '@components/form-fields';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { validateEmail } from '../../../../utility/Utils';
import { SaveButton } from '../../../../@core/components/save-button';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { userCompany } from '../../../../redux/user';
const emailSendSchema = yup.object().shape({
  fromEmail: yup.string().email('From email must be a valid email'),
});

const SendTestEmailModal = ({
  openModal,
  setCurrentTemplates,
  setOpenModal,
  sendMailTemplate,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(emailSendSchema),
  });

  const companyDetail = useSelector(userCompany);

  useEffect(() => {
    reset({
      fromEmail: companyDetail.defaultTestMailConfig?.senderEmail || '',
      fromName: companyDetail.defaultTestMailConfig?.senderName || '',
      emails:
        companyDetail.defaultTestMailConfig?.receiver?.map((el) => ({
          label: el,
          value: el,
        })) || [],
    });
  }, [openModal, companyDetail]);

  const handleChangeEmail = (emails) => {
    if (emails.length) {
      const tempEmails = JSON.parse(JSON.stringify(emails));
      setValue(
        'emails',
        tempEmails.filter((email) => validateEmail(email.value))
      );
    }
  };

  const onSendTestEmail = (values) => {
    if (
      values.emails === null ||
      values.emails === '' ||
      values.emails?.length === 0
    ) {
      setError(
        'emails',
        { type: 'focus', message: `Atleast one email is required.` },
        { shouldFocus: true }
      );
    } else {
      sendMailTemplate(values);
      // reset({});
    }
  };
  return (
    <Modal
      isOpen={openModal}
      toggle={() => {
        // reset({});
        setCurrentTemplates(false);
        setOpenModal(!openModal);
      }}
      className='modal-dialog-centered'
      backdrop='static'
    >
      <ModalHeader
        toggle={() => {
          // reset({});
          setCurrentTemplates(false);
          setOpenModal(!openModal);
        }}
      >
        Send Test Email
      </ModalHeader>
      <ModalBody>
        <Form
          className='auth-login-form'
          onSubmit={handleSubmit(onSendTestEmail)}
          autoComplete='off'
        >
          <div className='mb-1'>
            <FormField
              name='emails'
              placeholder='Add Emails'
              label='Receiver Email Address'
              type='creatableselect'
              errors={errors}
              control={control}
              options={[]}
              isMulti={true}
              onChange={(value) => {
                handleChangeEmail(value);
              }}
            />{' '}
          </div>
          <div className='mb-1'>
            <FormField
              name='fromName'
              label='Sender Name'
              placeholder='Enter Sender Name'
              type='text'
              errors={errors}
              control={control}
            />
          </div>
          <div className=''>
            <FormField
              name='fromEmail'
              label='Sender Email'
              placeholder='Enter Sender Email'
              type='text'
              errors={errors}
              control={control}
            />
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Form
          className='auth-login-form'
          onSubmit={handleSubmit(onSendTestEmail)}
          autoComplete='off'
        >
          <SaveButton
            width='180px'
            // outline={true}
            type='submit'
            color='primary'
            name={'Send'}
          ></SaveButton>
        </Form>
        <Button
          color='danger'
          onClick={() => {
            setCurrentTemplates(false);
            setOpenModal(!openModal);
            // reset({});
          }}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SendTestEmailModal;
