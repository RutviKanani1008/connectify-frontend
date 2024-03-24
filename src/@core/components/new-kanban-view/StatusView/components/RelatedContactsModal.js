import React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import ItemTable from '../../../data-table';
import NoRecordFound from '../../../data-table/NoRecordFound';
import useContactColumns from '../../../../../views/Admin/groups/hooks/useContactColumns';

const RelatedContactsModal = ({
  setIsOpen,
  isOpen,
  contactLoading,
  contacts,
}) => {
  // ** Custom Hooks **
  const { contactColumn } = useContactColumns();

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => {
        setIsOpen();
      }}
      className='modal-dialog-centered contact-status-view-modal modal-dialog-mobile'
      size='xl'
      backdrop='static'
    >
      <ModalHeader toggle={() => setIsOpen()}>Related Contacts</ModalHeader>
      <ModalBody>
        {contactLoading ? (
          <>
            <div className='mb-2 text-primary text-center'>
              <Spinner color='primary' />
            </div>
          </>
        ) : contacts && contacts.length > 0 ? (
          <>
            <ItemTable
              showHeader={false}
              columns={contactColumn}
              data={contacts}
              showCard={false}
              title={''}
              addItemLink={false}
              hideButton={true}
              itemsPerPage={10}
              hideExport={true}
            />
          </>
        ) : contacts.length === 0 ? (
          <>
            <NoRecordFound />
          </>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button color='danger' onClick={() => setIsOpen()}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RelatedContactsModal;
