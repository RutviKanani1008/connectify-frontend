import React, { Fragment, useState } from 'react';
import UILoader from '@components/ui-loader';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import AddEdiDocumentModal from './AddEditDocumentModal';
import { store } from '../../../redux/store';
import { deleteDocumentAPI, updateDocumentAPI } from '../../../api/documents';
import FilePreviewModal from '../../../@core/components/form-fields/FilePreviewModal';

import DocumentGrid from './Grid';
// import { Row } from 'reactstrap';
const MySwal = withReactContent(Swal);

const GridView = ({
  openAddEditDocumentModal,
  setOpenAddEditDocumentModal,
  type,
  contactId,
  currentFolders,
  setCurrentFolders,
  handleEditFolderName,
  handleDeleteFolder,
  modelType = 'Contacts',
}) => {
  const storeState = store.getState();
  const user = storeState.user.userData;
  //----------- local state--------------
  const [currentDocumentField, setCurrentDocumentField] = useState({});
  const [allDocuments, setAllDocuments] = useState([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [documentProcessing, setDocumentProcessing] = useState(false);
  const [key, setKey] = useState(Math.random());
  const [collapseTabFormMobile, setCollapseTabFormMobile] = useState('');
  const [reloadDocumentGrid, setReloadDocumentGrid] = useState(0);
  const handleResetDocumentPreview = () => {
    setPreviewModalOpen(false);
    setCurrentDocumentField({});
  };

  const updateDocumentWithOrder = async (item) => {
    try {
      setDocumentProcessing(true);
      const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');
      const updateResponse = await updateDocumentAPI(item._id, {
        archived: !item.archived,
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
        setKey(Math.random());
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
        setKey(Math.random());
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

  return (
    <UILoader blocking={documentProcessing} loader={<></>}>
      <div className='company-files-wrapper'>
        <div
          className={`company-document-listing-row ${
            collapseTabFormMobile === 'Files' ? 'active' : ''
          }`}
        >
          <DocumentGrid
            setCollapseTabFormMobile={setCollapseTabFormMobile}
            key={`active_${key}`}
            setCurrentDocumentField={setCurrentDocumentField}
            setPreviewModalOpen={setPreviewModalOpen}
            setOpenAddEditDocumentModal={setOpenAddEditDocumentModal}
            handleConfirmDelete={handleConfirmDelete}
            handleTrashDocument={handleTrashDocument}
            archived={false}
            displayType='folderView'
            type={type}
            contactId={contactId}
            currentFolders={currentFolders}
            handleEditFolderName={handleEditFolderName}
            handleDeleteFolder={handleDeleteFolder}
            modelType={modelType}
            reloadDocumentGrid={reloadDocumentGrid}
          />
        </div>
        <div
          className={`company-document-listing-row ${
            collapseTabFormMobile === 'Deleted Documents' ? 'active' : ''
          }`}
        >
          <DocumentGrid
            setCollapseTabFormMobile={setCollapseTabFormMobile}
            key={`archived_${key}`}
            setCurrentDocumentField={setCurrentDocumentField}
            setPreviewModalOpen={setPreviewModalOpen}
            setOpenAddEditDocumentModal={setOpenAddEditDocumentModal}
            handleConfirmDelete={handleConfirmDelete}
            handleTrashDocument={handleTrashDocument}
            archived={true}
            type={type}
            contactId={contactId}
            modelType={modelType}
          />
        </div>
      </div>
      <AddEdiDocumentModal
        openAddEditDocumentModal={openAddEditDocumentModal}
        setOpenAddEditDocumentModal={setOpenAddEditDocumentModal}
        company={user?.company?._id}
        documentData={currentDocumentField}
        setCurrentDocumentField={setCurrentDocumentField}
        setDocuments={setAllDocuments}
        documents={allDocuments}
        reloadTable={() => {
          setReloadDocumentGrid((prev) => prev + 1);
        }}
        setKey={setKey}
        contact={contactId}
        currentFolders={currentFolders}
        setCurrentFolders={setCurrentFolders}
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

export default GridView;
