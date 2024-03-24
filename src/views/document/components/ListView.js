import { useState, useRef } from 'react';
import UILoader from '@components/ui-loader';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import AddEdiDocumentModal from './AddEditDocumentModal';
import { store } from '../../../redux/store';
import { deleteDocumentAPI, updateDocumentAPI } from '../../../api/documents';
import FilePreviewModal from '../../../@core/components/form-fields/FilePreviewModal';
import useColumn from '../hooks/useColumn';
import DocumentList from './List';
import { useGetDocument } from '../hooks/useApis';
// import { Row } from 'reactstrap';
const MySwal = withReactContent(Swal);

const ListView = ({
  openAddEditDocumentModal,
  setOpenAddEditDocumentModal,
  type,
  contactId,
  currentFolders,
  setCurrentFolders,
  handleEditFolderName,
  handleDeleteFolder,
}) => {
  const activeTableRef = useRef(null);
  const archivedTableRef = useRef(null);
  const storeState = store.getState();
  const user = storeState.user.userData;
  //----------- local state--------------
  const [currentDocumentField, setCurrentDocumentField] = useState({});
  const [allDocuments, setAllDocuments] = useState([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [documentProcessing, setDocumentProcessing] = useState(false);

  const { getDocument } = useGetDocument();

  const updateDocumentWithOrder = async (item) => {
    try {
      setDocumentProcessing(true);
      const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');
      const isItemArchived = item.archived;
      const updateResponse = await updateDocumentAPI(item._id, {
        archived: !isItemArchived,
        orderChange: true,
      });
      if (updateResponse?.data?.response_type === 'success') {
        showToast(
          TOASTTYPES.success,
          toastId,
          `Document ${
            item.archived ? 'Activated document' : 'Archived'
          } Successfully`
        );
        // reload apis
        // setKey(Math.random());
        if (isItemArchived) {
          activeTableRef.current && activeTableRef.current.refreshTable();
          archivedTableRef.current &&
            archivedTableRef.current.removeRecordRefreshTable();
        } else {
          activeTableRef.current &&
            activeTableRef.current.removeRecordRefreshTable();
          archivedTableRef.current && archivedTableRef.current.refreshTable();
        }
        setDocumentProcessing(false);
      } else {
        setDocumentProcessing(false);
      }
    } catch (error) {
      console.log('error', error.message);
      setDocumentProcessing(false);
    }
  };

  const handleTrashDocument = (item) => {
    return MySwal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to move this document to ${
        item.archived ? 'Active documents' : 'Deleted documents'
      }?`,
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Yes',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(async function (result) {
      if (result.value) {
        updateDocumentWithOrder(item);
      }
    });
  };

  const deleteDocumentWithOrder = async (id) => {
    try {
      setDocumentProcessing(true);
      const toastId = showToast(TOASTTYPES.loading, '', 'Document deleting...');

      const updateResponse = await deleteDocumentAPI(id);
      if (updateResponse?.data?.response_type === 'success') {
        showToast(TOASTTYPES.success, toastId, 'Document Deleted Successfully');
        setDocumentProcessing(false);
        // reload apis
        // setKey(Math.random());
        archivedTableRef.current &&
          archivedTableRef.current.removeRecordRefreshTable();
      } else {
        setDocumentProcessing(false);
      }
    } catch (error) {
      setDocumentProcessing(false);
      console.log('error', error.message);
    }
  };

  const handleConfirmDelete = (id) => {
    return MySwal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to Delete this document ?',
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Yes',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        deleteDocumentWithOrder(id);
      }
    });
  };

  const handleDocumentPreview = async (_id) => {
    const { data, error } = await getDocument(_id);
    if (!error) {
      setCurrentDocumentField(data);
      setPreviewModalOpen(true);
    }
  };

  const handleResetDocumentPreview = () => {
    setPreviewModalOpen(false);
    setCurrentDocumentField({});
  };

  // --------------- hooks ---------------
  const { columns } = useColumn({
    handleTrashDocument,
    setCurrentDocumentField,
    setOpenAddEditDocumentModal,
    handleConfirmDelete,
    handleDocumentPreview,
  });

  return (
    <UILoader blocking={documentProcessing} loader={<></>}>
      <div className='company-files-wrapper'>
        <div className='company-document-listing-row list-view'>
          <DocumentList
            archived={false}
            columns={columns}
            ref={activeTableRef}
            type={type}
            contactId={contactId}
            displayType='folderView'
            currentFolders={currentFolders}
            handleEditFolderName={handleEditFolderName}
            handleDeleteFolder={handleDeleteFolder}
            setCurrentDocumentField={setCurrentDocumentField}
            setOpenAddEditDocumentModal={setOpenAddEditDocumentModal}
          />
        </div>
        <div className='company-document-listing-row list-view'>
          <DocumentList
            archived={true}
            columns={columns}
            ref={archivedTableRef}
            type={type}
            contactId={contactId}
          />
        </div>
      </div>
      <AddEdiDocumentModal
        openAddEditDocumentModal={openAddEditDocumentModal}
        setOpenAddEditDocumentModal={setOpenAddEditDocumentModal}
        company={user?.company?._id}
        // documentsLength={activeDocuments?.length ? activeDocuments?.length : 0}
        documentData={currentDocumentField}
        setCurrentDocumentField={setCurrentDocumentField}
        setDocuments={setAllDocuments}
        documents={allDocuments}
        reloadTable={() => {
          activeTableRef.current && activeTableRef.current.refreshTable();
        }}
        contact={contactId}
        currentFolders={currentFolders}
        setCurrentFolders={setCurrentFolders}
        // setKey={setKey}
      />
      <FilePreviewModal
        visibility={previewModalOpen}
        url={currentDocumentField?.document}
        toggleModal={handleResetDocumentPreview}
        title='File Preview'
      />
    </UILoader>
  );
};

export default ListView;
