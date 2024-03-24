/* eslint-disable no-unused-vars */
// ** React Imports
import React from 'react';

// ** Third Party Packages
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Col, Form, Row } from 'reactstrap';

// ** Constants
import { required } from '../../../../../../configs/validationConstant';

// ** Components
import { FormField } from '../../../../../../@core/components/form-fields';
import { SaveButton } from '../../../../../../@core/components/save-button';
import { KNOWN_HOSTS } from '../../constant';
import classNames from 'classnames';

const validationSchema = yup.object().shape({
  platform: yup.string().required(required('Platform')),
});

const AddPlatform = ({ stepper, formState, setFormState }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: { platform: '' },
    resolver: yupResolver(validationSchema),
  });

  const selectedPlatform = watch('platform');

  const onSubmit = async (values) => {
    const { platform } = values;
    setFormState((prev) => ({ ...prev, platformInfo: { platform } }));
    stepper.next();
  };

  return (
    <div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className='imap__platform__wrapper hide-scrollbar'>
          <button
            type='button'
            className={classNames({
              active: selectedPlatform === KNOWN_HOSTS.GMAIL,
            })}
            onClick={() => setValue('platform', KNOWN_HOSTS.GMAIL)}
          >
            <span className='icon__wrapper'>
              <img src='/images/gmail__icon.png' alt='' />
            </span>
            <span className='text'>Gmail</span>
          </button>
          <button
            type='button'
            className={classNames({
              active: selectedPlatform === KNOWN_HOSTS.OUTLOOK,
            })}
            onClick={() => setValue('platform', KNOWN_HOSTS.OUTLOOK)}
          >
            <span className='icon__wrapper'>
              <img src='/images/outlook__icon.png' alt='' />
            </span>
            <span className='text'>Outlook</span>
          </button>
          <button
            type='button'
            className={classNames({
              active: selectedPlatform === KNOWN_HOSTS.YAHOO,
            })}
            onClick={() => setValue('platform', KNOWN_HOSTS.YAHOO)}
          >
            <span className='icon__wrapper'>
              <img src='/images/yahoo__icon.png' alt='' />
            </span>
            <span className='text'>Yahoo</span>
          </button>
          <button
            type='button'
            className={classNames({
              active: selectedPlatform === KNOWN_HOSTS.AOL,
            })}
            onClick={() => setValue('platform', KNOWN_HOSTS.AOL)}
          >
            <span className='icon__wrapper'>
              <img src='/images/aol__icon.png' alt='' />
            </span>
            <span className='text'>Aol</span>
          </button>
          <button
            type='button'
            className={classNames({
              active: selectedPlatform === 'other',
            })}
            onClick={() => setValue('platform', 'other')}
          >
            <span className='text'>Other</span>
          </button>
          {errors.platform && (
            <div className='form-error'>* {errors.platform.message}</div>
          )}
        </div>
        <div className='footer__btns'>
          <SaveButton color='primary' name={'Next'} type='submit' />
        </div>
      </Form>
    </div>
  );
};

export default AddPlatform;
