import React from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import ItemTable from '../../data-table';
import useContactColumn from '../hooks/useContactColumns';

function ContactListModal({
  currentStage,
  currentPipeline,
  isModalOpen,
  setIsModalOpen,
  contacts,
}) {
  const { contactsColumns } = useContactColumn();
  return (
    <>
      <Modal
        isOpen={isModalOpen}
        toggle={() => {
          setIsModalOpen();
        }}
        className='modal-dialog-centered pipline-stage-view'
        backdrop='static'
        size='xl'
      >
        <ModalHeader
          toggle={() => {
            setIsModalOpen();
          }}
        >
          <div className='inner__title__wrapper'>
            <span className='label'>Pipeline:</span>
            <span className='value'>
              {currentPipeline?.label} Stage: {currentStage?.title} - Contact
              List
            </span>
          </div>
        </ModalHeader>
        <ModalBody>
          <ItemTable
            showHeader={false}
            hideExport
            hideButton={true}
            itemsPerPage={10}
            selectableRows={false}
            showCard={false}
            data={contacts}
            columns={contactsColumns}
          />
        </ModalBody>
      </Modal>
    </>
  );
}

export default ContactListModal;
