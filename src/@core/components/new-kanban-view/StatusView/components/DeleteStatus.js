import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import Select from 'react-select';

import ItemTable from '../../../data-table';
import { selectThemeColors } from '../../../../../utility/Utils';
import useContactColumns from '../../../../../views/Admin/groups/hooks/useContactColumns';

const DeleteStatus = ({
  isOpen,
  setIsOpen,
  contactLoading,
  status,
  selectedNewStatus,
  setSelectedNewStatus,
  contacts,
  remainingStatus,
  deleteStatus,
}) => {
  // ** Custom Hooks **
  const { contactColumn } = useContactColumns();

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => {
        setIsOpen(!isOpen);
      }}
      className='modal-dialog-centered contact-status-delete-modal'
      size='lg'
      backdrop='static'
    >
      <ModalHeader toggle={() => setIsOpen(!isOpen)}>Delete Status</ModalHeader>
      <ModalBody>
        {contactLoading ? (
          <>
            <div className='mb-2 text-primary text-center'>
              <Spinner color='primary' />
            </div>
          </>
        ) : contacts && contacts.length > 0 ? (
          <>
            <div className='delete-status-card'>
              <div className='select-new-status-wrapper'>
                <label className='form-label form-label'>
                  Select New Status
                </label>
                <div className='table__page__limit'>
                  <Select
                    id={'group_details'}
                    theme={selectThemeColors}
                    style={{ width: '20%' }}
                    placeholder={'Select Status'}
                    classNamePrefix='table__page__limit'
                    options={remainingStatus}
                    menuPosition='fixed'
                    value={selectedNewStatus}
                    isClearable
                    onChange={(e) => {
                      setSelectedNewStatus(e);
                    }}
                    isMulti={false}
                    isOptionSelected={(option, selectValue) =>
                      selectValue.some((i) => i === option)
                    }
                    isDisabled={false}
                  />
                </div>
              </div>
              <ItemTable
                columns={contactColumn}
                data={contacts}
                title={`Below contacts are related with ${status?.title}, please select new status in which you want to move these contacts to.`}
                addItemLink={false}
                hideButton={true}
                itemsPerPage={10}
                hideExport={true}
                showCard={false}
              />
            </div>
          </>
        ) : contacts.length === 0 ? (
          <>
            <div className='mb-3 text-primary text-center'>
              <h3>Are you sure You want to delete this status?</h3>
            </div>
          </>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button
          color='primary'
          disabled={!selectedNewStatus || contactLoading}
          onClick={() => {
            deleteStatus(status.id);
          }}
        >
          Delete Status
        </Button>
        <Button
          color='danger'
          onClick={() => setIsOpen(!isOpen)}
          disabled={contactLoading}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteStatus;
