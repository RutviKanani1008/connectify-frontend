// ==================== Packages =======================
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const EmailTemplatePreviewModal = ({
  templatePreview,
  previewModal,
  setPreviewModal,
  setTemplatesPreview,
}) => {
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
        {templatePreview.name} Preview
      </ModalHeader>
      <ModalBody>
        <div className='mb-2'>
          {templatePreview && templatePreview.htmlBody ? (
            <div
              dangerouslySetInnerHTML={{ __html: templatePreview.htmlBody }}
            ></div>
          ) : null}
        </div>
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

export default EmailTemplatePreviewModal;
