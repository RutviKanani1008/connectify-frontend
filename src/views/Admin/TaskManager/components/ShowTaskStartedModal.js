import { Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { SaveButton } from '../../../../@core/components/save-button';
import { TASK_TIMER_STATUS } from '../service/taskTimer.services';
import { useState } from 'react';

export const ShowTaskStartedModal = ({
  showTaskStartWarningModal,
  handleCloseTaskStartWarningModal,
  currentStartedTask,
  updateTimerLoading,
}) => {
  const [selectedType, setSelectedType] = useState(null);
  const handleClose = (closeType = null) => {
    handleCloseTaskStartWarningModal(closeType);
    setSelectedType(closeType);
  };
  return (
    <Modal
      isOpen={showTaskStartWarningModal}
      toggle={() => handleClose()}
      className='modal-dialog-centered timer-history-modal'
      backdrop='static'
      size='md'
    >
      <ModalHeader
        toggle={() => {
          handleClose();
        }}
      >
        <div className='d-flex'>Hey there, hold on!</div>
      </ModalHeader>
      <ModalBody className='pt-2'>
        <Label>
          Task number #{currentStartedTask?.task?.taskNumber} is already in
          progress, select one of the option below to start current task
        </Label>
      </ModalBody>
      <ModalFooter>
        <SaveButton
          name={`Pause #${currentStartedTask?.task?.taskNumber}`}
          width='200'
          onClick={() => handleClose(TASK_TIMER_STATUS.pause)}
          loading={selectedType === TASK_TIMER_STATUS.pause && updateTimerLoading}
        />
        <SaveButton
          name={`Stop #${currentStartedTask?.task?.taskNumber}`}
          width='250'
          onClick={() => handleClose(TASK_TIMER_STATUS.end)}
          loading={selectedType === TASK_TIMER_STATUS.end && updateTimerLoading}
        />
        <SaveButton
          name='Close'
          width='200'
          onClick={() => handleClose(null)}
        />
      </ModalFooter>
    </Modal>
  );
};

export default ShowTaskStartedModal;
