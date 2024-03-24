// ** React Imports
import React, { useEffect } from 'react';
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
} from 'reactstrap';

// ** Third Party Packages
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ** Constants
import { required } from '../../../../../../configs/validationConstant';

// ** Services
import {
  useLazyGetConnectedSmtpAccountByServiceQuery,
  useUpdateSmtpImapMutation,
} from '../../../../../../redux/api/mailApi';

// ** Components
import AddConnectionInfoForm from './AddConnectionInfoForm';
import { SaveButton } from '../../../../../../@core/components/save-button';

const validationSchema = yup.object().shape({
  email: yup.string().email().required(required('Email')),
  password: yup.string().required(required('Password')),
  smtpHost: yup.string().required(required('SmtpHost')),
  imapHost: yup.string().required(required('ImapHost')),
  smtpPort: yup.string().required(required('SmtpPort')),
  imapPort: yup.string().required(required('ImapPort')),
  smtpUsername: yup.string().email().required(required('SmtpUsername')),
  imapUsername: yup.string().email().required(required('ImapUsername')),
});

const EditImapConnectionInfo = ({ connection, closeModal }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  // ** API Services **
  const [getConnectedSmtpAccountService, { isLoading }] =
    useLazyGetConnectedSmtpAccountByServiceQuery();
  const [updateSmtpImapService, { isLoading: updateLoader }] =
    useUpdateSmtpImapMutation();

  const getConnectedSmtpAccount = async (email) => {
    const { data, error } = await getConnectedSmtpAccountService({
      userName: email,
    });

    if (!error && data && data.data) {
      const { smtp, imap } = data.data;
      reset({
        email: smtp?.username,
        password: '',
        smtpHost: smtp?.host,
        smtpPort: smtp?.port,
        smtpUsername: smtp?.username,
        imapHost: imap?.host,
        imapPort: imap?.port,
        imapUsername: imap?.username,
      });
    }
  };

  useEffect(() => {
    if (connection) {
      getConnectedSmtpAccount(connection.username);
    }
  }, [connection]);

  const onSubmit = async (values) => {
    const {
      email,
      imapHost,
      imapPort,
      imapUsername,
      password,
      smtpHost,
      smtpPort,
      smtpUsername,
    } = values;

    const body = {
      email,
      password,
      api_purpose: 'manual',
      smtp: {
        host: smtpHost,
        port: smtpPort,
        secure: false,
        auth: { user: smtpUsername, pass: password },
      },
      imap: {
        host: imapHost,
        port: imapPort,
        secure: false,
        auth: { user: imapUsername, pass: password },
      },
    };

    const { error } = await updateSmtpImapService({
      userName: connection.username,
      data: body,
    });

    if (!error) {
      closeModal();
    }
  };

  return (
    <Modal
      isOpen={!!connection}
      toggle={closeModal}
      className='modal-dialog-centered connect-IMAP-modal modal-dialog-mobile update-IMAP-modal'
      backdrop='static'
      size='lg'
      fade={false}
    >
      <ModalHeader toggle={closeModal}>Update IMAP</ModalHeader>
      <ModalBody className=''>
        {isLoading ? (
          <div className='loader__wrapper'>
            <Spinner />
          </div>
        ) : (
          <>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className='update__IMAP__wrapper'>
                <div className='note'>*You can only update password</div>
                <AddConnectionInfoForm
                  isEditMode
                  errors={errors}
                  control={control}
                />
              </div>
              <div className='footer__btns'>
                <Button
                  disabled={isLoading || updateLoader}
                  className='cancel-btn'
                  type='reset'
                  color='secondary'
                  outline
                  onClick={() => closeModal()}
                >
                  Cancel
                </Button>
                <SaveButton
                  loading={isLoading || updateLoader}
                  disabled={isLoading || updateLoader}
                  color='primary'
                  name={'Update'}
                  type='submit'
                />
              </div>
            </Form>
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

export default EditImapConnectionInfo;
