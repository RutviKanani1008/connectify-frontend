import '@src/assets/scss/file-manager.scss';
import { Fragment } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { getFileType } from '../../../helper/common.helper';
import CsvFileViewer from './CsvFileViewer';
import NoRecordFound from '../data-table/NoRecordFound';
const FilePreviewModal = ({
  title,
  visibility,
  toggleModal,
  url,
  isFullURL = false,
}) => {
  const previewUrl = isFullURL
    ? url
    : `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${url}`;

  const renderFile = () => {
    switch (getFileType(url)) {
      case 'image':
        return <img src={previewUrl} alt='preview-doc' />;
      case 'video':
        return (
          <video width='320' height='240' autoPlay controls>
            <source src={previewUrl} type='video/mp4' />
          </video>
        );
      case 'document':
        return (
          <div className='doc-view'>
            {previewUrl && (
              <iframe
                className='doc-viewer'
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${previewUrl}`}
              />
            )}
          </div>
        );
      case 'pdf':
        return (
          <div className='doc-view'>
            <embed
              className='doc-view'
              src={`${previewUrl}#toolbar=0&navpanes=0`}
              type='application/pdf'
            />
          </div>
        );
      case 'csv':
        return (
          <div className='doc-view'>
            <CsvFileViewer url={previewUrl} />
          </div>
        );

      default:
        return <p>File not supported</p>;
    }
  };
  return (
    <div className='file-manger-container'>
      <div className='vertically-centered-modal theme-modal-danger'>
        <Modal
          scrollable={true}
          isOpen={visibility}
          className={`modal-dialog-centered preview-dialog document-preview-modal ${
            getFileType(url) === 'image' || getFileType(url) === 'video'
              ? 'media-popup'
              : ''
          } ${!url ? 'show-msg' : ''}`}
          toggle={toggleModal}
          size='xl'
        >
          {title !== undefined && (
            <ModalHeader tag={'h3'} toggle={toggleModal}>
              {title}
            </ModalHeader>
          )}
          <ModalBody>
            <Fragment> {url ? renderFile() : <NoRecordFound />}</Fragment>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default FilePreviewModal;
