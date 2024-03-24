import React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import NoRecordFound from '../../../../../@core/components/data-table/NoRecordFound';
import ItemTable from '../../../../../@core/components/data-table';

const RelatedContacts = ({
  clearShowContactModal,
  openShowContactModel,
  fetchContactLoading,
  contacts,
}) => {
  const contactColumn = [
    {
      name: 'First Name',
      minWidth: '250px',
      sortable: (row) => row?.firstName,
      selector: (row) => row?.firstName,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.firstName ? row?.firstName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Last Name',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.lastName,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.lastName ? row?.lastName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Email',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.email,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.email}</span>
          </div>
        );
      },
    },
    {
      name: 'Phone',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.phone,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.phone ? row?.phone : '-'}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <Modal
      isOpen={openShowContactModel}
      toggle={() => {
        clearShowContactModal();
      }}
      className='modal-dialog-centered contact-category-view-modal modal-dialog-mobile'
      size='xl'
      backdrop='static'
      fade={false}
    >
      <ModalHeader toggle={() => clearShowContactModal()}>
        Related Contacts
      </ModalHeader>
      <ModalBody>
        {fetchContactLoading ? (
          <>
            <div className='mb-2 text-primary text-center'>
              <Spinner color='primary' />
            </div>
          </>
        ) : contacts && contacts.length > 0 ? (
          <ItemTable
            showHeader={false}
            showCard={false}
            columns={contactColumn}
            data={contacts}
            title={''}
            addItemLink={false}
            hideButton={true}
            itemsPerPage={10}
            hideExport={false}
          />
        ) : contacts.length === 0 ? (
          <>
            <NoRecordFound />
          </>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button color='danger' onClick={() => clearShowContactModal()}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RelatedContacts;
