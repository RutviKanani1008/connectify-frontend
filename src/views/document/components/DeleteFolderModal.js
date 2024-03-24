import React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import Select from 'react-select';
import ItemTable from '../../../@core/components/data-table';
import {
  useDeleteDocumentsFolder,
  useUpdateDocumentsFolder,
} from '../hooks/useApis';
import { selectThemeColors } from '../../../utility/Utils';
import { useDeleteFolder } from '../../Admin/groups/hooks/groupApis';

function DeleteFolderModal({
  currentFolders,
  setCurrentFolders,
  currentDeleteFolder,
  clearDeleteFolderModal,
  setCurrentDeleteFolder,
  isLoading,
}) {
  const { updateDocumentsFolder, isLoading: updateDocumentFolderLoader } =
    useUpdateDocumentsFolder();
  const { deleteDocumentsFolder, isLoading: deleteDocumentFolderLoader } =
    useDeleteDocumentsFolder();
  const { deleteFolder, isLoading: deleteFolderLoader } = useDeleteFolder();

  const deleteFolderFilesTableColumns = [
    {
      name: 'Name',
      width: '80%',
      sortable: (row) => row?.name,
      selector: (row) => row?.name,
      cell: (row) => <span className='text-capitalize'>{row.name}</span>,
    },
  ];

  const handleMoveAndDeleteFolder = async () => {
    const obj = {};
    obj.files = currentDeleteFolder.files?.map((file) => file?._id);
    obj.folder = currentDeleteFolder.newFolderSelected?.value;
    const { error } = await updateDocumentsFolder(obj);
    if (!error) {
      const { error } = await deleteFolder(
        currentDeleteFolder?.folder?._id,
        'Delete Folder..'
      );

      if (!error) {
        setCurrentFolders(
          currentFolders.filter(
            (folder) => folder?._id !== currentDeleteFolder?.folder?._id
          )
        );
        clearDeleteFolderModal();
      }
    }
  };

  const handleDeleteFolderWithFiles = async () => {
    const { error } = await deleteDocumentsFolder(
      currentDeleteFolder?.folder?._id,
      'Deleting folder...'
    );
    if (!error) {
      setCurrentFolders(
        currentFolders.filter(
          (folder) => folder?._id !== currentDeleteFolder?.folder?._id
        )
      );
      clearDeleteFolderModal();
    }
  };

  return (
    <Modal
      isOpen={currentDeleteFolder.isModal}
      toggle={() => {
        clearDeleteFolderModal();
      }}
      className='modal-dialog-centered delete-folder-modal modal-dialog-mobile'
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
        ) : currentDeleteFolder?.files?.length > 0 ? (
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
                    options={currentFolders
                      ?.filter(
                        (folder) =>
                          folder._id !== currentDeleteFolder.folder?._id &&
                          folder._id !== 'unassigned'
                      )
                      ?.map((folder) => {
                        return {
                          label: folder?.folderName,
                          value: folder?._id,
                        };
                      })}
                    value={currentDeleteFolder.newFolderSelected}
                    isClearable={false}
                    onChange={(e) => {
                      setCurrentDeleteFolder({
                        ...currentDeleteFolder,
                        newFolderSelected: e,
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
                columns={deleteFolderFilesTableColumns}
                data={currentDeleteFolder.files}
                title={`Below files are in ${currentDeleteFolder?.folder?.folderName}, please select new folder in which you want to move these files to.`}
                addItemLink={false}
                hideButton={true}
                itemsPerPage={10}
                hideExport={true}
                showCard={false}
              />
            </div>
          </>
        ) : currentDeleteFolder.files.length === 0 ? (
          <>
            <div className='mb-3 text-primary text-center'>
              <h3>Are you sure You want to delete this folder?</h3>
            </div>
          </>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button
          color='primary'
          disabled={
            currentDeleteFolder?.newFolderSelected ||
            updateDocumentFolderLoader ||
            deleteFolderLoader
              ? false
              : true
          }
          onClick={() => {
            if (!currentDeleteFolder?.newFolderSelected) {
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
        <Button
          color='primary'
          disabled={deleteDocumentFolderLoader}
          onClick={() => {
            handleDeleteFolderWithFiles();
          }}
        >
          Delete Folder With Files
        </Button>
        <Button color='danger' onClick={() => clearDeleteFolderModal()}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default DeleteFolderModal;
