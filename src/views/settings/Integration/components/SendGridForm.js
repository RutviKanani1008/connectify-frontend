import { Button, Form, Label } from 'reactstrap';
import { FormField } from '../../../../@core/components/form-fields';
import { useForm, useWatch } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { required } from '../../../../configs/validationConstant';
import {
  useCreateSendgridIntegration,
  useUpdateSendgridIntegration,
} from '../../hooks/integrationApi';
import { useDispatch } from 'react-redux';
import { storeUpdateUser } from '../../../../redux/user';
import { useEffect } from 'react';

const sendgridFormValidationSchema = yup.object().shape({
  sendgridApiKey: yup.string().required(required('Sendgrid api key')),
});

export default function SendGridForm({
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
      sendgridApiKey: currentIntegration?.sendGrid?.apiKey,
    });
  }, [currentIntegration]);

  const dispatch = useDispatch();
  const { createIntegration } = useCreateSendgridIntegration();
  const { updateIntegration } = useUpdateSendgridIntegration();

  const handleCreateOrUpdateSendGridKey = async (body) => {
    if (currentIntegration) {
      const { data, error } = await updateIntegration(
        currentIntegration?._id,
        {
          sendGrid: { apiKey: body.sendgridApiKey },
        },
        'Saving sendgrid config...'
      );
      if (!error && data) {
        setCurrentIntegration(data);
        dispatch(storeUpdateUser({ integration: data }));
      }
    } else {
      const { data, error } = await createIntegration(
        {
          sendGrid: { apiKey: body.sendgridApiKey },
        },
        'Saving sendgrid config...'
      );
      if (!error) {
        if (data) {
          setCurrentIntegration(data);
          dispatch(storeUpdateUser({ integration: data }));
        }
      }
    }
  };

  const sendgridApiKey = useWatch({
    control,
    name: `sendgridApiKey`,
  });

  return (
    <>
      <div className='integration-box'>
        <Form
          className='auth-login-form'
          onSubmit={handleSubmit(handleCreateOrUpdateSendGridKey)}
          autoComplete='off'
        >
          <h3 className='heading'>SendGrid</h3>
          <div className='field-wrapper'>
            <Label className=''>
              Enter your sendgrid account api key, it will be used for sending
              mass emails and individual contact emails
            </Label>
            <FormField
              name='sendgridApiKey'
              placeholder='Enter sendgrid api key'
              errors={errors}
              control={control}
              type='password'
            />
          </div>
          <div className='submit-btn-wrapper mt-2'>
            <Button
              type='submit'
              color={`${
                sendgridApiKey !== currentIntegration?.sendGrid?.apiKey
                  ? 'primary'
                  : 'primary'
              } `}
            >
              <span className='align-middle'>Update</span>
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
