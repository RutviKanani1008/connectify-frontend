import { useState } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';

const ChangeStage = (props) => {
  const [currentNote, setCurrentNote] = useState({
    text: '',
  });
  const [showError, setShowError] = useState(null);
  const { currentStatus, openModal, handleCloseNoteModal, handleChangeStatus } =
    props;
  return (
    <>
      <Modal
        isOpen={openModal}
        toggle={() => handleCloseNoteModal()}
        className='modal-dialog-centered'
        backdrop='static'
      >
        <ModalHeader toggle={() => handleCloseNoteModal()}>
          You are moving the Contact
        </ModalHeader>
        <ModalBody>
          <div className='mb-2 d-flex justify-content-center'>
            {currentStatus ? (
              <>
                From{' '}
                <span className='text-primary ms-4px me-4px fw-bolder'>
                  {currentStatus?.currentPipelineStatus?.label}
                </span>{' '}
                To{' '}
                <span className='text-primary ms-4px me-4px fw-bolder'>
                  {currentStatus?.status?.label}
                </span>
              </>
            ) : null}
          </div>
          <div className='mb-2'>
            <Input
              label='Notes'
              name='note'
              placeholder='Note'
              type='textarea'
              value={currentNote.text}
              onChange={(e) => {
                if (showError) {
                  setShowError(false);
                }
                setCurrentNote({ ...currentNote, text: e.target.value });
              }}
            />
            {showError ? (
              <>
                <div className='mt-1 text-danger'>Please enter note.</div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={() => {
              // if (currentNote.text === '') {
              //   setShowError(true);
              // } else {
              handleChangeStatus(currentNote.text || null);
              // }
            }}
          >
            Save
          </Button>
          <Button
            color='danger'
            onClick={() => {
              handleCloseNoteModal(false);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ChangeStage;
