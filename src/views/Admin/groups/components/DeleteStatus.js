import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import Select from 'react-select';
import { selectThemeColors } from '../../../../utility/Utils';
import ItemTable from '../../../../@core/components/data-table';
import useContactColumns from '../hooks/useContactColumns';

const DeleteStatus = ({
  showNewStatusError,
  deleteStatusModal,
  clearDeleteStatusModal,
  contacts,
  fetchContactLoading,
  remainingStatus,
  deleteStatusId,
  selectedNewStatus,
  setSelectedNewStatus,
  handleDeleteStatus,
}) => {
  // ** Custom Hooks **
  const { contactColumn } = useContactColumns();

  return (
    <Modal
      isOpen={deleteStatusModal}
      toggle={() => {
        clearDeleteStatusModal();
      }}
      className='modal-dialog-centered contact-status-delete-modal'
      size='lg'
      backdrop='static'
    >
      <ModalHeader toggle={() => clearDeleteStatusModal()}>
        Delete Status
      </ModalHeader>
      <ModalBody>
        {fetchContactLoading ? (
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
                    className={`${showNewStatusError ? 'error' : ''}`}
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
                  {showNewStatusError ? (
                    <>
                      <div className='text-danger error-msg'>
                        Please Enter Status Name.
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
              <ItemTable
                columns={contactColumn}
                data={contacts}
                title={`Below contacts are related with ${deleteStatusId?.statusName}, please select new status in which you want to move these contacts to.`}
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
          disabled={!selectedNewStatus}
          onClick={() => {
            if (!selectedNewStatus) {
              showNewStatusError(true);
            } else {
              handleDeleteStatus();
            }
          }}
        >
          Delete Status
        </Button>
        <Button color='danger' onClick={() => clearDeleteStatusModal()}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteStatus;
