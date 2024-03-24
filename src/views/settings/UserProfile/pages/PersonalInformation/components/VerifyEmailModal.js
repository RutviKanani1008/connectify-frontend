import React from 'react';
import {
  Button,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import { SaveButton } from '../../../../../../@core/components/save-button';

const VerifyEmailModal = ({
  buttonLoading,
  setOpenVerifyOtp,
  openVerifyOtp,
  verificationCode,
  setVerificationCode,
  sendVerificationMail,
  checkVerificationCode,
}) => {
  return (
    <Modal
      isOpen={openVerifyOtp}
      toggle={() => setOpenVerifyOtp(false)}
      backdrop='static'
      className='modal-dialog-centered'
      size='sm'
    >
      <ModalHeader toggle={() => setOpenVerifyOtp(false)}>
        Verify Email
      </ModalHeader>
      <ModalBody>
        <div>
          <Form className='auth-login-form' autoComplete='off'>
            <div className='text-primary h4 mt-1'>
              Enter 6 Digit Verification code below
            </div>
            <Row className='mt-1'>
              <div className='d-flex justify-content-center p-2'>
                <Input
                  type='number'
                  width={50}
                  value={verificationCode}
                  onChange={(e) => {
                    if (e.target.value.trim().length <= 6) {
                      setVerificationCode(e.target.value);
                    }
                  }}
                />
              </div>
            </Row>
            <Row>
              <div className='text-primary h5 mt-1 text-danger'>
                Didn't receive? Be sure to check your spam. If it's not there,{' '}
                <Label
                  className='cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    sendVerificationMail();
                  }}
                >
                  click here to resend
                </Label>
                .
              </div>
            </Row>
          </Form>
        </div>
      </ModalBody>
      <ModalFooter>
        <Form
          className='auth-login-form'
          onSubmit={checkVerificationCode}
          autoComplete='off'
        >
          <SaveButton
            width='180px'
            disabled={verificationCode.trim().length !== 6}
            loading={buttonLoading.verifyEmailLoading}
            outline={true}
            type='submit'
            color='primary'
            name={'Verify OTP'}
            className='align-items-center justify-content-center'
          ></SaveButton>
        </Form>
        <Button color='danger' onClick={() => setOpenVerifyOtp(false)}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default VerifyEmailModal;
