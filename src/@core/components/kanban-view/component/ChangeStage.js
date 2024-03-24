import { Icon } from '@iconify/react';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';

const ChangeStage = (props) => {
  const {
    openModal,
    setOpenModal,
    changeCardPosition,
    currentChange,
    currentNote,
    setShowError,
    setCurrentNote,
    showError,
    update,
  } = props;
  return (
    <>
      <Modal
        isOpen={openModal}
        toggle={() => setOpenModal(!openModal)}
        className='modal-dialog-centered moving-contact-pipline-modal modal-dialog-mobile'
        backdrop='static'
      >
        <ModalHeader toggle={() => changeCardPosition()}>
          You are moving the Contact
        </ModalHeader>
        <ModalBody>
          <div className='from-to-wrapper'>
            {currentChange &&
            currentChange.sourceLaneId &&
            currentChange.targetLaneId ? (
              <>
                <div className='box-wrapper'>
                  <span className='white-cover'></span>
                  <span className='label'>From:</span>
                  <span className='value'>{currentChange.sourceLaneTitle}</span>
                </div>
                <Icon className='arrow' icon='ph:arrow-right-thin' width='30' />
                <div className='box-wrapper'>
                  <span className='white-cover'></span>
                  <span className='label'>To:</span>
                  <span className='value'>{currentChange.targetLaneTitle}</span>
                </div>
              </>
            ) : null}
          </div>
          <div className='mt-2'>
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
            color='danger'
            onClick={() => {
              update.current = Math.random();
              setOpenModal(false);
            }}
          >
            Cancel
          </Button>
          <Button
            color='primary'
            onClick={() => {
              // if (currentNote.text === '') {
              //   setShowError(true);
              // } else {
              changeCardPosition();
              // }
            }}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ChangeStage;
