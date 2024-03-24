import { useEffect, useState } from 'react';
import { Grid, List, Plus } from 'react-feather';
import { Button, ButtonGroup, UncontrolledTooltip } from 'reactstrap';
import classnames from 'classnames';
import { store } from '../../redux/store';
import GridView from './components/GridView';
import ListView from './components/ListView';
import EditFolderModal from '../Admin/folders/components/EditFolderModal';
import {
  useDeleteFolder,
  useGetFolders,
} from '../Admin/groups/hooks/groupApis';
import { useGetCompanyDocuments } from './hooks/useApis';
import { showWarnAlert } from '../../helper/sweetalert.helper';
import DeleteFolderModal from './components/DeleteFolderModal';

const Document = ({ type, contactId, modelType = 'Contacts' }) => {
  const storeState = store.getState();
  const user = storeState.user.userData;
  //----------- local state--------------
  const [openAddEditDocumentModal, setOpenAddEditDocumentModal] =
    useState(false);
  const [activeView, setActiveView] = useState('grid');
  /** API */
  const { getCompanyDocuments, isLoading: fetchingFiles } =
    useGetCompanyDocuments();
  const { getFolders } = useGetFolders(); // isLoading: folderLoading
  const { deleteFolder } = useDeleteFolder(); // isLoading

  /** Folders */
  const [openFolderModal, setOpenFolderModal] = useState(false);
  const [updateFolder, setUpdateFolder] = useState(false);
  const [currentFolders, setCurrentFolders] = useState([]);
  const [currentDeleteFolder, setCurrentDeleteFolder] = useState({
    files: [],
    isModal: false,
    folder: false,
    newFolderSelected: null,
    error: null,
  });

  useEffect(() => {
    getFoldersDetails();
  }, []);

  const getFoldersDetails = async () => {
    const { data, error } = await getFolders({
      company: user.company._id,
      folderFor: 'files',
      ...(contactId
        ? {
            model: modelType,
            ...(contactId !== 'add' && { modelRecordId: contactId }),
          }
        : { model: null }),
    });
    if (!error && data) {
      setCurrentFolders([
        { folderName: 'Unassigned', _id: 'unassigned' },
        ...data,
      ]);
    }
  };

  const closeFolderModal = () => {
    setOpenFolderModal(false);
    setUpdateFolder(false);
  };

  const handleEditFolderName = (folder) => {
    setUpdateFolder(folder);
    setOpenFolderModal(!openFolderModal);
  };

  const handleDeleteFolder = async (currentFolder) => {
    const { data, error } = await getCompanyDocuments({
      select: 'name',
      folderId: currentFolder?._id,
    });
    if (!error) {
      if (data?.pagination?.total) {
        setCurrentDeleteFolder({
          files: data.results,
          isModal: true,
          folder: currentFolder,
          newFolderSelected: null,
        });
      } else {
        const result = await showWarnAlert({
          title: 'Are you sure?',
          text: 'Are you sure you would like to delete this folder?',
        });

        if (result.value) {
          const { error } = await deleteFolder(
            currentFolder?._id,
            'Delete Folder..'
          );

          if (!error) {
            setCurrentFolders(
              currentFolders.filter(
                (folder) => folder?._id !== currentFolder?._id
              )
            );
          }
        }
      }
    }
  };

  const clearDeleteFolderModal = () => {
    setCurrentDeleteFolder({
      files: [],
      isModal: false,
      folder: false,
    });
  };

  return (
    <>
      <div className='company-document-page'>
        <div className='top-header w-100 d-inline-flex justify-content-between align-items-center mb-2'>
          {(user.role === 'superadmin' ||
            user.role !== 'user' ||
            (user.role === 'user' && modelType === 'Users')) && (
            <>
              <h2 className='mobile-heading'>Documents</h2>
              <div className='add-new-btns'>
                <div className='add-new-btn d-inline-flex'>
                  <Button
                    className=''
                    color='primary'
                    onClick={() => {
                      setOpenAddEditDocumentModal(true);
                    }}
                    id={`add-btn`}
                  >
                    <Plus size={15} />
                    <span className='align-middle ms-50'>Add New</span>
                  </Button>
                  <UncontrolledTooltip placement='top' target={`add-btn`}>
                    Add File
                  </UncontrolledTooltip>
                </div>
                <div className='add-new-btn d-inline-flex'>
                  <span
                    className={`create-folder-link cursor-pointer`}
                    onClick={() => {
                      setUpdateFolder({
                        _id: 'newFolder',
                      });
                      setOpenFolderModal(!openFolderModal);
                    }}
                    id={'add-new-folder'}
                  >
                    <span>Create a new File</span>
                  </span>
                  <UncontrolledTooltip
                    placement='top'
                    target={`add-new-folder`}
                  >
                    Add Folder
                  </UncontrolledTooltip>
                </div>
              </div>
            </>
          )}
          <div className='view-toggle-btn d-inline-flex'>
            <ButtonGroup>
              <Button
                tag='label'
                className={classnames('btn-icon view-btn grid-view-btn', {
                  active: activeView === 'grid',
                })}
                color='primary'
                outline
                onClick={() => setActiveView('grid')}
              >
                <Grid size={18} />
              </Button>
              <Button
                tag='label'
                className={classnames('btn-icon view-btn list-view-btn', {
                  active: activeView === 'list',
                })}
                color='primary'
                outline
                onClick={() => setActiveView('list')}
              >
                <List size={18} />
              </Button>
            </ButtonGroup>
          </div>
        </div>
        {activeView === 'grid' ? (
          <GridView
            openAddEditDocumentModal={openAddEditDocumentModal}
            setOpenAddEditDocumentModal={setOpenAddEditDocumentModal}
            type={type}
            contactId={contactId}
            currentFolders={currentFolders}
            setCurrentFolders={setCurrentFolders}
            handleEditFolderName={handleEditFolderName}
            handleDeleteFolder={handleDeleteFolder}
            modelType={modelType}
          />
        ) : (
          <ListView
            openAddEditDocumentModal={openAddEditDocumentModal}
            setOpenAddEditDocumentModal={setOpenAddEditDocumentModal}
            type={type}
            contactId={contactId}
            currentFolders={currentFolders}
            setCurrentFolders={setCurrentFolders}
            handleEditFolderName={handleEditFolderName}
            handleDeleteFolder={handleDeleteFolder}
          />
        )}
      </div>
      {openFolderModal && (
        <EditFolderModal
          contactId={contactId}
          updateFolderDetail={updateFolder}
          openFolderModal={openFolderModal}
          setOpenFolderModal={setOpenFolderModal}
          closeFolderModal={closeFolderModal}
          currentFolders={currentFolders}
          setCurrentFolders={setCurrentFolders}
          modelType={modelType}
          type={'files'}
        />
      )}
      {currentDeleteFolder.isModal && (
        <DeleteFolderModal
          currentFolders={currentFolders}
          setCurrentFolders={setCurrentFolders}
          currentDeleteFolder={currentDeleteFolder}
          clearDeleteFolderModal={clearDeleteFolderModal}
          setCurrentDeleteFolder={setCurrentDeleteFolder}
          isLoading={fetchingFiles}
        />
      )}
    </>
  );
};

export default Document;
