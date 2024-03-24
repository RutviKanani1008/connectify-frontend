import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import classnames from 'classnames';
import CreatableSelect from 'react-select/creatable';
import { selectThemeColors } from '../../../../../utility/Utils';
import { SaveButton } from '@components/save-button';

const SendTestQuoteInvoiceModal = ({
  openModal,
  setOpenModal,
  handleEmails,
  showError,
  currentEmails,
  sendTestInvoice,
  setShowError,
  loading,
}) => {
  return (
    openModal && (
      <Modal
        isOpen={openModal}
        toggle={() => {
          setOpenModal(!openModal);
        }}
        className='modal-dialog-centered'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            setOpenModal(!openModal);
          }}
        >
          Receiver Email Address
        </ModalHeader>
        <ModalBody>
          <CreatableSelect
            id='emails'
            className={classnames('react-select', {
              'is-invalid': !!showError,
            })}
            placeholder='Add Emails'
            classNamePrefix='select'
            options={[]}
            isClearable={false}
            onChange={handleEmails}
            isMulti={true}
            value={currentEmails}
            theme={selectThemeColors}
          />

          {showError ? (
            <div className='mt-1 text-danger'>
              Please enter atleast one valid email.
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <SaveButton
            loading={loading}
            width='150px'
            type='submit'
            name={'Send'}
            onClick={() => {
              if (!currentEmails.length) {
                setShowError(true);
              } else {
                sendTestInvoice();
              }
            }}
            className='align-items-center justify-content-center'
          ></SaveButton>
          <Button
            color='danger'
            onClick={() => {
              setOpenModal(!openModal);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    )
  );
};

export default SendTestQuoteInvoiceModal;
