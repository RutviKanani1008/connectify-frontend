import { Row, Col, Button, Form } from 'reactstrap';
import { FormField } from '../../../../@core/components/form-fields';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { required } from '../../../../configs/validationConstant';
import {
  useCreateTwilioIntegration,
  useUpdateTwilioIntegration,
} from '../../hooks/integrationApi';
import { useDispatch } from 'react-redux';
import { storeUpdateUser } from '../../../../redux/user';
import { useEffect } from 'react';

const sendgridFormValidationSchema = yup.object().shape({
  twilioAccountId: yup.string().required(required('Twilio account id')),
  twilioAuthToken: yup.string().required(required('Twilio auth token')),
  twilioNotifyServiceId: yup.string().required(required('Twilio service id')),
});

export default function TwilioForm({
  currentIntegration,
  setCurrentIntegration,
}) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(sendgridFormValidationSchema),
  });

  useEffect(() => {
    reset({
      twilioAccountId: currentIntegration?.twilioKey?.accountSid,
      twilioAuthToken: currentIntegration?.twilioKey?.authToken,
      twilioNotifyServiceId: currentIntegration?.twilioKey?.notifyServiceSID,
    });
  }, [currentIntegration]);

  const dispatch = useDispatch();
  const { createIntegration } = useCreateTwilioIntegration();
  const { updateIntegration } = useUpdateTwilioIntegration();

  const handleCreateOrUpdateSendGridKey = async (body) => {
    if (currentIntegration) {
      const { data, error } = await updateIntegration(
        currentIntegration?._id,
        {
          twilioKey: {
            accountSid: body.twilioAccountId,
            authToken: body.twilioAuthToken,
            notifyServiceSID: body.twilioNotifyServiceId,
          },
        },
        'Saving twilio config...'
      );
      if (!error && data) {
        setCurrentIntegration(data);
        dispatch(storeUpdateUser({ integration: data }));
      }
    } else {
      const { data, error } = await createIntegration(
        {
          twilioKey: {
            accountSid: body.twilioAccountId,
            authToken: body.twilioAuthToken,
            notifyServiceSID: body.twilioNotifyServiceId,
          },
        },
        'Saving twilio config...'
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
          <span className='fw-bold text-primary mb-1 h4'>Twilio</span>
        </div>
        <div className='my-2 mt-1 h6'>
          Enter your twilio account details, it will be used for sending mass
          sms.
        </div>
        <Row className='mt-1 mb-2'>
          <Col md={4}>
            <div>
              <FormField
                label='Account Id'
                name='twilioAccountId'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
          </Col>
          <Col md={4}>
            <div>
              <FormField
                label='Auth Token'
                name='twilioAuthToken'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
          </Col>
          <Col md={4}>
            <div>
              <FormField
                label='Nofity Service Id'
                name='twilioNotifyServiceId'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
          </Col>
        </Row>
        <Row className='mt-2'>
          <Col md={6}>
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
