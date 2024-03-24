// ** Packages **
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import EnvelopePreview from './EnvelopePreview';

const EnvelopePreviewModal = ({ isOpen, setIsOpen, currentTemplate }) => {
  return (
    <Modal
      isOpen={isOpen}
      toggle={() => setIsOpen(false)}
      className='modal-dialog-centered envelope-preview-modal modal-dialog-mobile'
      size='lg'
      backdrop='static'
    >
      <ModalHeader toggle={() => setIsOpen(false)}>
        {currentTemplate.name} Preview
      </ModalHeader>
      <ModalBody>
        <div className='envelope-preview-wrapper'>
          <EnvelopePreview
            body={currentTemplate?.body?.body}
            envelopeSize={currentTemplate?.body?.envelopeSize}
            width={currentTemplate?.body?.width}
            height={currentTemplate?.body?.height}
            padding={currentTemplate?.body?.margin}
            setValue={currentTemplate?.body?.setValue}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color='danger' onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EnvelopePreviewModal;
