import { useRef, useState } from 'react';
import { Button, Modal, ModalFooter, ModalHeader } from 'reactstrap';
import AddContact from '../../../views/Admin/contact/AddContact';
import { SaveButton } from '@components/save-button';

const AddContactModal = ({ setModalOpen, modalOpen, getContacts }) => {
  const childRef = useRef(null);
  const [modalContactLoading, setModalContactLoading] = useState(false);
  return (
    <Modal
      isOpen={modalOpen}
      toggle={() => {
        setModalOpen();
      }}
      className='modal-dialog-centered add-contact-modal'
      backdrop='static'
      size='xl'
    >
      <ModalHeader
        toggle={() => {
          setModalOpen();
        }}
      >
        Add New Contact
      </ModalHeader>
      <AddContact
        parentGetContacts={getContacts}
        ref={childRef}
        isModal={true}
        setModalOpen={setModalOpen}
        setModalContactLoading={setModalContactLoading}
      />
      <ModalFooter>
        <SaveButton
          loading={modalContactLoading}
          width='150px'
          type='submit'
          name={'Add Contact'}
          onClick={() => childRef.current.handleForWardSubmit()}
          className='align-items-center justify-content-center'
        ></SaveButton>
        <Button
          color='danger'
          onClick={() => {
            setModalOpen(false);
          }}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
export default AddContactModal;
