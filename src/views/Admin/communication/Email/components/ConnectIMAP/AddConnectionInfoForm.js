// ** React Imports
import React from 'react';
import { Col, Row } from 'reactstrap';

// ** Components
import { FormField } from '../../../../../../@core/components/form-fields';

const AddConnectionInfoForm = ({ errors, control, isEditMode }) => {
  return (
    <>
      <div className='add-connection-form-wrapper'>
        <div className='inner-wrapper hide-scrollbar'>
          <Row>
            <Col md={6} sm={6} lg={6} className='mb-1'>
              <FormField
                id='email'
                name='email'
                label='Email'
                placeholder='Ex. abc@xyz.com'
                type='text'
                errors={errors}
                control={control}
                disabled={isEditMode}
              />
            </Col>
            <Col md={6} sm={6} lg={6} className='mb-1'>
              <FormField
                name='password'
                label='Password'
                placeholder='*****'
                type='password'
                errors={errors}
                control={control}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6} sm={6} lg={6}>
              <h3 className='title'>SMTP</h3>
              <div className='filed-wrapper mb-1'>
                <FormField
                  name='smtpHost'
                  label='SMTP Host'
                  placeholder='Ex. smtp.outlook.com'
                  type='text'
                  errors={errors}
                  control={control}
                  disabled={isEditMode}
                />
              </div>
              <div className='filed-wrapper mb-1'>
                <FormField
                  name='smtpPort'
                  label='SMTP Port'
                  placeholder='Ex. 587'
                  type='text'
                  errors={errors}
                  control={control}
                  disabled={isEditMode}
                />
              </div>
              <div className='filed-wrapper mb-1'>
                <FormField
                  name='smtpUsername'
                  label='Username'
                  placeholder='Ex. abc@xyz.com'
                  type='text'
                  errors={errors}
                  control={control}
                  disabled={isEditMode}
                />
              </div>
            </Col>
            <Col md={6} sm={6} lg={6}>
              <h3 className='title'>IMAP</h3>
              <div className='filed-wrapper mb-1'>
                <FormField
                  name='imapHost'
                  label='IMAP Host'
                  placeholder='Ex. imap.outlook.com'
                  type='text'
                  errors={errors}
                  control={control}
                  disabled={isEditMode}
                />
              </div>
              <div className='filed-wrapper mb-1'>
                <FormField
                  name='imapPort'
                  label='IMAP Port'
                  placeholder='Ex. 993'
                  type='text'
                  errors={errors}
                  control={control}
                  disabled={isEditMode}
                />
              </div>
              <div className='filed-wrapper mb-1'>
                <FormField
                  name='imapUsername'
                  label='Username'
                  placeholder='Ex. abc@xyz.com'
                  type='text'
                  errors={errors}
                  control={control}
                  disabled={isEditMode}
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default AddConnectionInfoForm;
