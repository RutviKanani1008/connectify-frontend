// ==================== Packages =======================
import { Fragment, useState } from 'react';
import {
  Badge,
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';
import FilePreviewModal from '../../../../@core/components/form-fields/FilePreviewModal';
import { Download, Eye, Video } from 'react-feather';
import { downloadFile, getFileType } from '../../../../helper/common.helper';
import pdfIcon from '../../../../assets/images/icons/file-icons/pdf.png';
import csvIcon from '../../../../assets/images/icons/file-icons/csv.png';
import docIcon from '../../../../assets/images/icons/file-icons/doc.png';
import { selectBadge } from './ContactEmailCard';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';

export const renderFile = (url) => {
  const fileType = getFileType(url);
  switch (fileType) {
    case 'image':
      return <img src={url} />;
    case 'video':
      return <Video size='50' src={url} />;
    case 'document':
      return <img src={docIcon} />;
    case 'pdf':
      return <img src={pdfIcon} />;
    case 'csv':
      return <img src={csvIcon} />;
  }
};
const ContactEmailTemplatePreviewModal = ({
  templatePreview,
  previewModal,
  setPreviewModal,
  setTemplatesPreview,
}) => {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPreviewFile, setCurrentPreviewFile] = useState(null);
  const user = useSelector(userData);

  const handleFileClick = (file) => {
    setCurrentPreviewFile(file?.fileUrl);
    setPreviewModalOpen(true);
  };
  const handleFileDownloadClick = (file) => {
    downloadFile(`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file.baseUrl}`);
  };
  const handleResetDocumentPreview = () => {
    setPreviewModalOpen(false);
    setCurrentPreviewFile(null);
  };
  return (
    <Modal
      isOpen={previewModal}
      toggle={() => {
        setPreviewModal(false);
        setTemplatesPreview(false);
      }}
      className='modal-dialog-centered email-template-preview mail-template-modal-wrapper'
      size='xl'
      backdrop='static'
    >
      <ModalHeader
        toggle={() => {
          setPreviewModal(false);
          setTemplatesPreview(false);
        }}
      >
        Mail Preview
      </ModalHeader>
      <ModalBody>
        <Row className='file__drop__zone_wp'>
          <Col md={4}>
            <div className='form-boarder p-1'>
              <div>
                <h3 className='text-primary'>Email Info : </h3>
              </div>
              <div className='mt-1'>
                <label className='fw-bold text-primary'>Scheduled At:</label>
                <span className='ms-1'>
                  {templatePreview?.scheduledTime ? (
                    <>
                      {moment(new Date(templatePreview.scheduledTime)).format(
                        `${
                          user?.company?.dateFormat
                            ? user?.company?.dateFormat
                            : 'MM/DD/YYYY'
                        }, HH:mm A`
                      )}
                    </>
                  ) : (
                    '-'
                  )}
                </span>
              </div>
              <div className='mt-1'>
                <label className='fw-bold text-primary'>
                  Scheduled Status:
                </label>
                <span className='ms-1'>
                  <Badge
                    color={`light-${selectBadge(templatePreview?.status)}`}
                    pill
                  >
                    {templatePreview?.status.toLowerCase()}
                  </Badge>
                </span>
              </div>
              <div className='mt-1'>
                <label className='fw-bold text-primary'>CC:</label>
                <span className='ms-1'>
                  {templatePreview?.cc?.length > 0
                    ? templatePreview?.cc?.join(', ')
                    : '-'}
                </span>
              </div>
              <div className='mt-1'>
                <label className='fw-bold text-primary'>BCC:</label>
                <span className='ms-1'>
                  {templatePreview?.bcc?.length > 0
                    ? templatePreview?.bcc?.join(', ')
                    : '-'}
                </span>
              </div>
              <div className='mt-1'>
                <label className='fw-bold text-primary'>
                  Sender Email Address:
                </label>
                <span className='ms-1'>
                  {templatePreview?.senderEmail || '-'}
                </span>
              </div>
              <div className='mt-1'>
                <label className='fw-bold text-primary'>Sender Name:</label>
                <span className='ms-1'>
                  {templatePreview?.senderName || '-'}
                </span>
              </div>
            </div>
            {templatePreview?.attachments?.length ? (
              <Fragment>
                <Row className='mt-1'>
                  <div className='text-primary h4'>Attachments</div>
                  {templatePreview.attachments.map((file, index) => (
                    <Col md={3} key={index} className='file__card m-1'>
                      <div className=''>
                        <div className='d-flex justify-content-center file__preview__wp'>
                          <div className='file__preview__sm'>
                            {renderFile(
                              `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file?.fileUrl}`
                            )}
                          </div>
                          <div className='overlay cursor-pointer'>
                            <div className='icon-wrapper'>
                              <Eye
                                color='#ffffff'
                                onClick={() => {
                                  handleFileClick(file);
                                }}
                              />
                            </div>
                            <div className='icon-wrapper ms-1'>
                              <Download
                                color='#ffffff'
                                onClick={() => {
                                  handleFileDownloadClick(file);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className='d-flex align-items-center image__edit__wp'>
                          <p
                            id={`file-name${index}`}
                            className='file-name text-break m-0'
                          >
                            <small>{file.fileName}</small>
                          </p>
                          <UncontrolledTooltip
                            placement='top'
                            target={`file-name${index}`}
                          >
                            {file.fileName}
                          </UncontrolledTooltip>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Fragment>
            ) : null}
          </Col>
          <Col md={7}>
            <div className='mb-2'>
              {templatePreview && templatePreview.htmlBody ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: templatePreview.htmlBody,
                  }}
                ></div>
              ) : null}
            </div>
          </Col>
        </Row>
        <FilePreviewModal
          visibility={previewModalOpen}
          url={currentPreviewFile}
          toggleModal={handleResetDocumentPreview}
          title='File Upload Preview'
        />
      </ModalBody>
      <ModalFooter>
        <Button
          color='danger'
          onClick={() => {
            setPreviewModal(false);
            setTemplatesPreview(false);
          }}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ContactEmailTemplatePreviewModal;
