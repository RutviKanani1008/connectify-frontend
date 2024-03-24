import Select from 'react-select';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import { selectThemeColors } from '../../../../utility/Utils';
import ItemTable from '../../../../@core/components/data-table';

const DeleteFolderDetails = ({
  currentDeleteFolder,
  clearDeleteFolderModal,
  isLoading,
  availableFolderDetails,
  setCurrentDeleteFolder,
  handleMoveAndDeleteFolder,
  columnsDetails,
  deleteFolderType = 'notes',
}) => {
  return (
    <>
      <Modal
        isOpen={currentDeleteFolder.isModal}
        toggle={() => {
          clearDeleteFolderModal();
        }}
        className='modal-dialog-centered  delete-folder-modal modal-dialog-mobile'
        size='lg'
        backdrop='static'
        fade={false}
      >
        <ModalHeader toggle={() => clearDeleteFolderModal()}>
          Delete Folder
        </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <>
              <div className='mb-2 text-primary text-center'>
                <Spinner color='primary' />
              </div>
            </>
          ) : currentDeleteFolder.results &&
            currentDeleteFolder.results.length > 0 ? (
            <>
              <div className='delete-folder-card'>
                <div className='select-new-folder-wrapper'>
                  <label className='form-label form-label'>
                    Select New Folder
                  </label>
                  <div className='table__page__limit'>
                    <Select
                      className={`${currentDeleteFolder?.error ? 'error' : ''}`}
                      id={'group_details'}
                      theme={selectThemeColors}
                      style={{ width: '20%' }}
                      placeholder={'Select Folder'}
                      classNamePrefix='table__page__limit'
                      options={availableFolderDetails
                        ?.filter(
                          (folder) =>
                            folder._id !==
                              currentDeleteFolder.editFolder?._id &&
                            folder._id !== 'unassigned'
                        )
                        ?.map((folder) => {
                          return {
                            label: folder?.folderName,
                            value: folder?._id,
                          };
                        })}
                      value={currentDeleteFolder.newSelected}
                      isClearable={false}
                      onChange={(e) => {
                        setCurrentDeleteFolder({
                          ...currentDeleteFolder,
                          newSelected: e,
                        });
                      }}
                      isMulti={false}
                      isOptionSelected={(option, selectValue) =>
                        selectValue.some((i) => i === option)
                      }
                      isDisabled={false}
                    />
                  </div>
                  {currentDeleteFolder?.error ? (
                    <>
                      <div className='text-danger error-msg'>
                        Please Enter folder...
                      </div>
                    </>
                  ) : null}
                </div>
                <ItemTable
                  columns={columnsDetails?.filter(
                    (column) => column.name !== 'Actions'
                  )}
                  data={currentDeleteFolder.results}
                  title={`Below ${deleteFolderType} are in ${currentDeleteFolder.editFolder?.folderName}, please select new folder in which you want to move these ${deleteFolderType} to.`}
                  addItemLink={false}
                  hideButton={true}
                  itemsPerPage={10}
                  hideExport={true}
                  showCard={false}
                />
              </div>
            </>
          ) : currentDeleteFolder.length === 0 ? (
            <>
              <div className='mb-3 text-primary text-center'>
                <h3>Are you sure You want to delete this tag?</h3>
              </div>
            </>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            disabled={currentDeleteFolder?.newSelected ? false : true}
            onClick={() => {
              if (!currentDeleteFolder?.newSelected) {
                setCurrentDeleteFolder({
                  ...currentDeleteFolder,
                  error: true,
                });
              } else {
                handleMoveAndDeleteFolder();
              }
            }}
          >
            Delete Folder
          </Button>
          <Button color='danger' onClick={() => clearDeleteFolderModal()}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default DeleteFolderDetails;
