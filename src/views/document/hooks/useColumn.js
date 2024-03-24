import CopyToClipboard from 'react-copy-to-clipboard';
import { Download, Edit2, Eye, Link, PlusCircle, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { downloadFile } from '../../../helper/common.helper';
import { store } from '../../../redux/store';

const handleIconCardClick = () => {
  const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');
  showToast(TOASTTYPES.success, toastId, 'Document Link Copied');
};

const useColumn = ({
  handleTrashDocument,
  setCurrentDocumentField,
  setOpenAddEditDocumentModal,
  handleConfirmDelete,
  handleDocumentPreview,
}) => {
  const storeState = store.getState();
  const user = storeState.user.userData;

  const columns = [
    {
      name: 'Name',
      minWidth: '250px',
      maxWidth: '300px',
      sortField: 'name',
      sortable: (row) => row?.name,
      selector: (row) => row?.name,
      cell: (row) => <span className='text-capitalize'>{row.name}</span>,
    },
    {
      name: 'Document URL',
      minWidth: '250px',
      sortField: 'documentURL',
      sortable: (row) => row?.documentURL,
      selector: (row) => row?.documentURL,
      cell: (row) => (
        <span className='text-capitalize'>
          {row.documentURL ? row.documentURL : '-'}
        </span>
      ),
    },
    {
      name: 'Actions',
      maxWidth: '200px',
      allowOverflow: true,
      cell: (row) => {
        const { _id, archived, document, documentURL } = row;
        return (
          <div className='action-btn-wrapper'>
            <div className='action-btn view-btn'>
              <Eye
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  if (!documentURL) {
                    handleDocumentPreview(_id);
                  } else {
                    window.open(documentURL, '_blank');
                  }
                }}
                id={`preview-icon${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                target={`preview-icon${_id}`}
              >
                Preview Document
              </UncontrolledTooltip>
            </div>
            <div className='action-btn copy-btn'>
              <CopyToClipboard
                text={
                  document
                    ? `${
                        process.env.REACT_APP_S3_BUCKET_BASE_URL
                      }${document?.replaceAll('\\', '/')}`
                    : documentURL
                }
                id={`copy-icon${_id}`}
              >
                <Link
                  opacity={!document && !documentURL ? 0.5 : 1}
                  size={15}
                  className={`${
                    document || documentURL
                      ? 'cursor-pointer'
                      : 'cursor-default'
                  }`}
                  onClick={() =>
                    (document || documentURL) && handleIconCardClick()
                  }
                />
              </CopyToClipboard>
              <UncontrolledTooltip placement='top' target={`copy-icon${_id}`}>
                {document || documentURL
                  ? 'Copy Document Link'
                  : "Doesn't contain document"}
              </UncontrolledTooltip>
            </div>
            <div className='action-btn download-btn'>
              <Download
                opacity={!document ? 0.5 : 1}
                size={15}
                className={`${document ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() =>
                  document &&
                  downloadFile(
                    `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${document}`
                  )
                }
                id={`download-icon${_id}`}
              ></Download>
              <UncontrolledTooltip
                placement='top'
                target={`download-icon${_id}`}
              >
                {document ? 'Download Document' : "Doesn't contain document"}
              </UncontrolledTooltip>
            </div>
            {user.role !== 'user' && !archived ? (
              <>
                <div className='action-btn edit-btn'>
                  <Edit2
                    size={15}
                    className='cursor-pointer'
                    onClick={() => {
                      setCurrentDocumentField(row);
                      setOpenAddEditDocumentModal(true);
                    }}
                    id={`edit-icon${_id}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    target={`edit-icon${_id}`}
                  >
                    Edit Document
                  </UncontrolledTooltip>
                </div>
              </>
            ) : null}
            {user.role !== 'user' && archived ? (
              <>
                <div className='action-btn plus-btn'>
                  <PlusCircle
                    size={15}
                    className='cursor-pointer'
                    id={`plush-icon${_id}`}
                    onClick={() => {
                      handleTrashDocument(row);
                    }}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    target={`plush-icon${_id}`}
                  >
                    Recover Document
                  </UncontrolledTooltip>
                </div>
              </>
            ) : null}
            {user.role !== 'user' && (
              <>
                <div className='action-btn delete-btn'>
                  <Trash
                    color='red'
                    size={15}
                    className='cursor-pointer'
                    onClick={() => {
                      if (archived) {
                        handleConfirmDelete(_id);
                      } else {
                        handleTrashDocument(row);
                      }
                    }}
                    id={`trash-icon${_id}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    target={`trash-icon${_id}`}
                  >
                    {archived ? 'Delete Document' : 'Trash Document'}
                  </UncontrolledTooltip>
                </div>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return { columns };
};
export default useColumn;
