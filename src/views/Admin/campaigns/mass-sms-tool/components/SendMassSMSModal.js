// ==================== Packages =======================
import React from 'react';
import {
  Button,
  Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
} from 'reactstrap';
// ====================================================

import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import CustomDatePicker from '../../../../../@core/components/form-fields/CustomDatePicker';
import ContactCard from '../../../event/components/ContactCard';
import { FORM_SCHEDULE_TIMER } from '../../../../../constant';

const SendMassSMSModal = (props) => {
  const {
    currentSelectedContacts,
    onMassSMSSendClose,
    openSendMassSMS,
    onSendMassSMS,
    handleSubmit,
    delayStatus,
    clearErrors,
    setValue,
    control,
    errors,
    fetchLoading,
    getValues,
    sendingMassSMS,
  } = props;
  const minDate = new Date();
  return (
    <Modal
      isOpen={openSendMassSMS}
      toggle={() => {
        onMassSMSSendClose();
      }}
      backdrop='static'
      className='modal-dialog-centered send-mass-sms-modal modal-dialog-mobile'
      size='xl'
    >
      <ModalHeader
        toggle={() => {
          onMassSMSSendClose();
        }}
      >
        Send Mass SMS
      </ModalHeader>
      <ModalBody>
        {fetchLoading ? (
          <div className='d-flex align-items-center justify-content-center h-100'>
            <Spinner />
          </div>
        ) : (
          <div>
            <Form
              className='auth-login-form'
              onSubmit={handleSubmit(onSendMassSMS)}
              autoComplete='off'
            >
              <div className='normal-text'>
                Are you sure you want to send this sms to all the contacts ?
              </div>
              <Row className='filter-row'>
                <Col md='4'>
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
                  <Col md='4'>
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
                <Col md='4'>
                  <FormField
                    name='title'
                    label='Scheduled Job Title'
                    placeholder='Enter Title'
                    type='text'
                    errors={errors}
                    control={control}
                  />
                </Col>
              </Row>
              <div className='create-mass-email-contact-header'>
                <div className='left'>
                  <h3 className='heading'>Contacts</h3>
                </div>
              </div>
              <Row className='create-mass-sms-contact-list'>
                {currentSelectedContacts?.length > 0 &&
                  currentSelectedContacts?.map((contact, index) => {
                    return (
                      <Col className='contact-col' md='4' key={index}>
                        <ContactCard
                          label='invite'
                          index={index}
                          contact={contact}
                          showCheckbox={false}
                        />
                      </Col>
                    );
                  })}
              </Row>
            </Form>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color='danger'
          onClick={() => {
            onMassSMSSendClose();
          }}
        >
          Close
        </Button>
        <Form
          className='auth-login-form'
          onSubmit={handleSubmit(onSendMassSMS)}
          autoComplete='off'
        >
          <SaveButton
            loading={sendingMassSMS}
            disabled={fetchLoading || sendingMassSMS}
            width='180px'
            // outline={true}
            type='submit'
            color='primary'
            name={'Send Mass SMS'}
            className='align-items-center justify-content-center'
          ></SaveButton>
        </Form>
      </ModalFooter>
    </Modal>
  );
};

export default SendMassSMSModal;
