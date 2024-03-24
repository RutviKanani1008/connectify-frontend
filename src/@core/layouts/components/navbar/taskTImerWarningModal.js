import { Button, Input, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { TASK_TIMER_STATUS } from '../../../../views/Admin/TaskManager/service/taskTimer.services';

export const TaskTimerWaringModal = (props) => {
  const {
    showTimerwarningModal,
    setShowTimerwarningModal,
    currentStartedTask,
    setDisableTaskTimerWarning,
    disabledTaskTimerWarning,
    handleWarningModalSubmit,
  } = props;
  return (
    <>
      <Modal
        isOpen={showTimerwarningModal}
        toggle={() => {
          setShowTimerwarningModal(false);
        }}
        className='modal-dialog-centered task-warning-modal'
        backdrop='static'
        size='lg'
      >
        <ModalBody>
          <div className='normal-text'>
            Are you still working on this task{' '}
            <span className='taskID'>
              #{currentStartedTask?.task?.taskNumber}
            </span>{' '}
            ?
          </div>
          <div className='checkbox-wrapper'>
            <Input
              type='checkbox'
              onChange={() => {
                // checkContact(contact._id);
                setDisableTaskTimerWarning(!disabledTaskTimerWarning);
              }}
              checked={disabledTaskTimerWarning}
            />
            <span className='text'>Don't show again for this task</span>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            // loading={modalContactLoading}
            width='150px'
            type='submit'
            name={'Yes, I am on it'}
            onClick={() => {
              handleWarningModalSubmit(TASK_TIMER_STATUS.start);
            }}
            className='align-items-center justify-content-center primaryBtn'
          >
            Yes, I am on it
          </Button>
          <Button
            // loading={modalContactLoading}
            width='130px'
            type='submit'
            name={'No, Pause it'}
            onClick={() => {
              handleWarningModalSubmit(TASK_TIMER_STATUS.pause);
            }}
            className='align-items-center justify-content-center secondnaryBtn'
          >
            No, Pause it
          </Button>
          <Button
            // loading={modalContactLoading}
            width='130px'
            type='submit'
            name={'No, Stop it'}
            onClick={() => {
              handleWarningModalSubmit(TASK_TIMER_STATUS.end);
            }}
            className='align-items-center justify-content-center dangerBtn'
          >
            No, Stop it
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
