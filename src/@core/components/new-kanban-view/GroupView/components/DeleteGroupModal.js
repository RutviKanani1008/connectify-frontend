import React from 'react';

import Select from 'react-select';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';

import ItemTable from '../../../data-table';
import { selectThemeColors } from '../../../../../utility/Utils';
import useContactColumns from '../../../../../views/Admin/groups/hooks/useContactColumns';

const DeleteGroupModal = ({
  isOpen,
  setIsOpen,
  contactLoading,
  group,
  selectedNewGroup,
  setSelectedNewGroup,
  forms,
  contacts,
  remainingGroups,
  deleteGroup,
}) => {
  const { contactColumn } = useContactColumns();

  const formColumn = [
    {
      name: 'Title',
      minWidth: '250px',
      sortable: (row) => row?.title,
      selector: (row) => row?.title,
      cell: (row) => (
        <div>
          <span className='cursor-pointer'>{row?.title}</span>
        </div>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => setIsOpen(!isOpen)}
      className='modal-dialog-centered contact-manage-group-delete-modal modal-dialog-mobile'
      size='lg'
      backdrop='static'
    >
      <ModalHeader toggle={() => setIsOpen(!isOpen)}>Delete Group</ModalHeader>
      <ModalBody>
        {contactLoading ? (
          <>
            <div className='mb-2 text-primary text-center'>
              <Spinner color='primary' />
            </div>
          </>
        ) : (
          <>
            {contacts && contacts.length > 0 ? (
              <>
                <div className='delete-group-card'>
                  <div className='select-new-group-wrapper'>
                    <label className='form-label form-label'>
                      Select New Group
                    </label>
                    <div className='table__page__limit'>
                      <Select
                        id={'group_details'}
                        theme={selectThemeColors}
                        style={{ width: '20%' }}
                        placeholder={'Select Group'}
                        classNamePrefix='table__page__limit'
                        options={remainingGroups}
                        value={selectedNewGroup}
                        isClearable={false}
                        onChange={(e) => {
                          setSelectedNewGroup(e);
                        }}
                        isMulti={false}
                        isOptionSelected={(option, selectValue) =>
                          selectValue.some((i) => i === option)
                        }
                        isDisabled={false}
                      />
                    </div>
                  </div>
                  {contacts && contacts.length > 0 ? (
                    <>
                      <ItemTable
                        columns={contactColumn}
                        data={contacts}
                        title={`Below contacts are related with ${group?.title}, please select new group in which you want to move these contacts to.`}
                        addItemLink={false}
                        hideButton={true}
                        itemsPerPage={10}
                        showCard={false}
                      />
                    </>
                  ) : null}
                  {forms && forms.length > 0 ? (
                    <>
                      <ItemTable
                        columns={formColumn}
                        data={forms}
                        title={`Below forms are related with ${group?.title}, please select new group in which you want to move these form to.`}
                        addItemLink={false}
                        hideButton={true}
                        itemsPerPage={10}
                        showCard={false}
                        searchPlaceholder='Search Forms'
                      />
                    </>
                  ) : null}
                </div>
              </>
            ) : null}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color='primary'
          disabled={!selectedNewGroup}
          onClick={() => {
            deleteGroup(group.id);
          }}
        >
          Delete Group
        </Button>
        <Button color='danger' onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteGroupModal;
