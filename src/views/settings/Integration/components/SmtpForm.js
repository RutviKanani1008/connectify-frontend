import { Row, Col, Button, Form, Label } from 'reactstrap';
import { FormField } from '../../../../@core/components/form-fields';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { required } from '../../../../configs/validationConstant';
import { useEffect } from 'react';
import {
  useCreateSmtpIntegration,
  useUpdateSmtpIntegration,
} from '../../hooks/integrationApi';
import { useDispatch } from 'react-redux';
import { storeUpdateUser } from '../../../../redux/user';

const smtpFormValidationSchema = yup.object().shape({
  smtpHost: yup.string().required(required('Host')),
  smtpPort: yup.number().required(required('Port')),
  smtpSecured: yup.boolean(),
  smtpUsername: yup.string().required(required('Username')),
  smtpPassword: yup.string().required(required('Password')),
});

export default function SmtpForm({
  currentIntegration,
  setCurrentIntegration,
}) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(smtpFormValidationSchema),
  });

  useEffect(() => {
    console.log(
      currentIntegration?.smtpConfig?.secured,
      'currentIntegration?.smtpConfig?.secured'
    );
    reset({
      smtpHost: currentIntegration?.smtpConfig?.host,
      smtpPort: currentIntegration?.smtpConfig?.port,
      smtpSecured: currentIntegration?.smtpConfig?.secured,
      smtpUsername: currentIntegration?.smtpConfig?.username,
      smtpPassword: currentIntegration?.smtpConfig?.password,
    });
  }, [currentIntegration]);

  const dispatch = useDispatch();
  const { createIntegration } = useCreateSmtpIntegration();
  const { updateIntegration } = useUpdateSmtpIntegration();

  const handleCreateOrUpdateSendGridKey = async (body) => {
    if (currentIntegration) {
      const { data, error } = await updateIntegration(
        currentIntegration?._id,
        {
          smtpConfig: {
            host: body.smtpHost,
            port: body.smtpPort,
            username: body.smtpUsername,
            password: body.smtpPassword,
            secured: body.smtpSecured,
          },
        },
        'Saving smtp config...'
      );
      if (!error && data) {
        setCurrentIntegration(data);
        dispatch(storeUpdateUser({ integration: data }));
      }
    } else {
      const { data, error } = await createIntegration(
        {
          smtpConfig: {
            host: body.smtpHost,
            port: body.smtpPort,
            username: body.smtpUsername,
            password: body.smtpPassword,
            secured: body.smtpSecured,
          },
        },
        'Saving smtp config...'
      );
      if (!error) {
        if (data) {
          setCurrentIntegration(data);
          dispatch(storeUpdateUser({ integration: data }));
        }
      }
    }
  };

  return (
    <div className='form-boarder pt-2 mt-2'>
      <Form
        className='auth-login-form'
        onSubmit={handleSubmit(handleCreateOrUpdateSendGridKey)}
        autoComplete='off'
      >
        <div>
          <span className='fw-bold text-primary mb-1 h4'>SMTP Config</span>
        </div>
        <div className='my-2 mt-1 h6'>
          Enter your SMTP account details, it will be used for sending mass
          mail.
        </div>
        <Row className='mt-1 mb-2'>
          <Col md={4}>
            <div>
              <FormField
                label='Host'
                name='smtpHost'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
          </Col>
          <Col md={4}>
            <div>
              <FormField
                label='Port'
                name='smtpPort'
                type='number'
                errors={errors}
                control={control}
              />
            </div>
          </Col>
          <Col md={4}>
            <div>
              <Label className='form-check-label d-block'>Secured</Label>
              <div className='mt-1'>
                <FormField
                  key={getValues(`smtpSecured`)}
                  type='checkbox'
                  error={errors}
                  control={control}
                  defaultValue={getValues(`smtpSecured`)}
                  name={'smtpSecured'}
                />
              </div>
            </div>
          </Col>
        </Row>
        <Row className='mt-1 mb-2'>
          <Col md={4}>
            <div>
              <FormField
                label='Username'
                name='smtpUsername'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
          </Col>
          <Col md={4}>
            <div>
              <FormField
                label='Password'
                name='smtpPassword'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
          </Col>
        </Row>
        <Row className='mt-2'>
          <Col md={4}>
            <div>
              <Button type='submit' color='primary'>
                <span className='align-middle'>Save</span>
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
