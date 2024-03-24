import { useState } from 'react';
import {
  Button,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';

export const TimerNoteModal = ({
  showTimerNoteModal,
  handleCloseNoteModal,
  timerExistsDetails,
  currentStartedTask,
}) => {
  // ** states
  const [content, setContent] = useState('');
  const handleClose = (isClose = false) => {
    handleCloseNoteModal(content, isClose);
  };

  return (
    <Modal
      isOpen={showTimerNoteModal}
      toggle={() => handleClose(true)}
      className='modal-dialog-centered timer-note-modal modal-lg'
      backdrop='static'
    >
      <ModalHeader
        toggle={() => {
          handleClose(true);
        }}
      >
        <div className='d-flex'>
          Stop task #
          {currentStartedTask?.task?.taskNumber
            ? currentStartedTask?.task?.taskNumber
            : timerExistsDetails?.task?.taskNumber}
        </div>
        <span className='task-name'>
          {currentStartedTask?.task?.name || timerExistsDetails?.task?.name}
        </span>
      </ModalHeader>
      <ModalBody className='pt-2'>
        <Label>Remarks</Label>
        <Row>
          <Col md={12}>
            <Input
              type='textarea'
              name='text'
              id='exampleText'
              onChange={(e) => {
                setContent(e.target.value);
              }}
            />
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button
          className=''
          type='reset'
          color='danger'
          // outline
          onClick={() => handleClose(true)}
        >
          Cancel
        </Button>
        <Button
          color='primary'
          onClick={() => handleClose(false)}
          name={'Save'}
          width='100px'
          className='align-items-center justify-content-center'
        >
          Yes, Stop it
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TimerNoteModal;
