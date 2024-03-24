import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import * as yup from 'yup';
import { FormField } from '@components/form-fields';
import { required } from '../../../../configs/validationConstant';
import { SaveButton } from '../../../../@core/components/save-button';
import { useAddEmailSenderAPI } from '../../../Admin/campaigns/mass-email-tool/service/emailSender.service';

const validationSchema = yup.object().shape({
  email: yup.string().email().required(required('Email')),
});

const AddSenderEmailModal = ({
  isOpen,
  setIsOpen,
  getSenderEmail,
  company,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
  });

  // API Service
  const { addEmailSenderAPI, isLoading: addingEmail } = useAddEmailSenderAPI();

  const onSubmit = async (values) => {
    const { error } = await addEmailSenderAPI({
      email: values.email,
      company,
      showToast: true,
    });
    if (!error) {
      getSenderEmail();
      setIsOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => setIsOpen(!isOpen)}
      className='modal-dialog-centered add-sender-email-modal modal-dialog-mobile'
      backdrop='static'
      fade={false}
    >
      <ModalHeader
        toggle={() => {
          setIsOpen(!isOpen);
        }}
      >
        Add Sender Email
      </ModalHeader>
      <ModalBody>
        <Form
          className='auth-login-form'
          onSubmit={handleSubmit(onSubmit)}
          autoComplete='off'
        >
          <div>
            <FormField
              name='email'
              label='Email'
              placeholder='Enter Email ...'
              type='text'
              errors={errors}
              control={control}
            />
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color='danger'
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          Cancel
        </Button>
        <Form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
          <SaveButton
            loading={addingEmail}
            disabled={addingEmail}
            width='100px'
            color='primary'
            name={'Add'}
            type='submit'
            className='align-items-center justify-content-center'
          ></SaveButton>
        </Form>
      </ModalFooter>
    </Modal>
  );
};

export default AddSenderEmailModal;
