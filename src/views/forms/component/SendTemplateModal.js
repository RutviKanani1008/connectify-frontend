import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';

const SendTemplateModal = (props) => {
  const {
    openEmailModal,
    onSendTemplateModalClose,
    currentEmail,
    showError,
    setShowError,
    setcurrentEmail,
    sendTestMail,
  } = props;
  return (
    <>
      <Modal
        isOpen={openEmailModal}
        toggle={() => {
          onSendTemplateModalClose();
        }}
        className='modal-dialog-centered'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            onSendTemplateModalClose();
          }}
        >
          Receiver Email Address
        </ModalHeader>
        <ModalBody>
          <div className='mb-2'>
            <Input
              label='Receiver Email Address'
              name='receiver'
              placeholder='Receiver Email Address'
              type='text'
              value={currentEmail.text}
              onChange={(e) => {
                if (showError) {
                  setShowError(false);
                }
                setcurrentEmail({
                  ...currentEmail,
                  text: e.target.value,
                });
              }}
            />
            {showError ? (
              <>
                <div className='mt-1 text-danger'>
                  Please enter valid email.
                </div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={() => {
              if (currentEmail.text === '') {
                setShowError(true);
              } else {
                sendTestMail();
              }
            }}
          >
            Send
          </Button>
          <Button
            color='danger'
            onClick={() => {
              onSendTemplateModalClose();
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
export default SendTemplateModal;
