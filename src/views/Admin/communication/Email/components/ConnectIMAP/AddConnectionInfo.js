// ** React Imports
import React, { useEffect } from 'react';
import { Button, Form } from 'reactstrap';

// ** Third Party Packages
import _ from 'lodash';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ** Constants
import { KNOWN_HOSTS_INFO } from '../../constant';
import { required } from '../../../../../../configs/validationConstant';

// ** Services
import { useConnectSmtpImapMutation } from '../../../../../../redux/api/mailApi';

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

const AddConnectionInfo = ({ stepper, formState, setFormState }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    const selectedPlatform = formState.platformInfo.platform;

    if (selectedPlatform) {
      const knownHost = KNOWN_HOSTS_INFO.find(
        (hostEl) => hostEl.host === selectedPlatform
      );

      const connectionInfo = {
        email: '',
        password: '',
        smtpUsername: '',
        smtpHost: '',
        smtpPort: '',
        imapUsername: '',
        imapHost: '',
        imapPort: '',
        mailFolders: [],
      };

      if (knownHost) {
        const {
          smtp: { host: smtpHost, port: smtpPort },
          imap: { host: imapHost, port: imapPort },
        } = knownHost.config;
        const knownHostInfo = { smtpHost, smtpPort, imapHost, imapPort };
        return reset({ ...connectionInfo, ...knownHostInfo });
      }

      reset({ ...connectionInfo });
    }
  }, [formState.platformInfo.platform]);

  // ** API Services **
  const [connectSmtpImapService, { isLoading }] = useConnectSmtpImapMutation();

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

    const { data, error } = await connectSmtpImapService({ data: body });

    if (data && data.data && !error) {
      const resData = data.data;

      if (_.isArray(resData.imap)) {
        const mailFolders = [
          ...resData.imap.map((obj) => ({ label: obj, value: obj })),
          { label: "I don't have such folder", value: '' },
        ];
        setFormState((prev) => ({
          ...prev,
          connectionInfo: { ...values, mailFolders },
        }));
        stepper.next();
      }
    }
  };

  return (
    <div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <AddConnectionInfoForm errors={errors} control={control} />
        <div className='footer__btns'>
          <Button
            disabled={isLoading}
            className='cancel-btn'
            type='reset'
            color='secondary'
            outline
            onClick={() => stepper.previous()}
          >
            Prev
          </Button>
          <SaveButton
            loading={isLoading}
            disabled={isLoading}
            color='primary'
            name={'Verify'}
            type='submit'
          />
        </div>
      </Form>
    </div>
  );
};

export default AddConnectionInfo;
