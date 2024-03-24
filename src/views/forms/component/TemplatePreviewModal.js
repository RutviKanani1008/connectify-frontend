import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const TemplatePreviewModal = (props) => {
  const {
    templatePreviewModal,
    templatePreview,
    getValues,
    onTemplatePreviewModalClose,
  } = props;
  return (
    <Modal
      isOpen={templatePreviewModal}
      toggle={() => {
        onTemplatePreviewModalClose();
      }}
      className='modal-dialog-centered preview-dialog email-template-preview'
      size='xl'
      backdrop='static'
    >
      <ModalHeader
        toggle={() => {
          onTemplatePreviewModalClose();
        }}
      >
        Preview
      </ModalHeader>
      <ModalBody>
        <div className='mb-2'>
          {templatePreview === 'autoresponder' &&
          getValues('autoresponder') &&
          getValues('autoresponder.htmlBody') ? (
            <>
              <div
                dangerouslySetInnerHTML={{
                  __html: getValues('autoresponder.htmlBody'),
                }}
              ></div>
            </>
          ) : templatePreview === 'notification' &&
            getValues('notification') &&
            getValues('notification.htmlBody') ? (
            <>
              <div
                dangerouslySetInnerHTML={{
                  __html: getValues('notification.htmlBody'),
                }}
              ></div>
            </>
          ) : null}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color='danger'
          onClick={() => {
            onTemplatePreviewModalClose();
          }}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TemplatePreviewModal;
