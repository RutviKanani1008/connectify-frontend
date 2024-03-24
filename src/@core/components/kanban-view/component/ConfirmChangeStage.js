import { Icon } from '@iconify/react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { SaveButton } from '../../save-button';

const ConfirmChangeStage = (props) => {
  const {
    openModal,
    setOpenModal,
    changeCardPosition,
    currentChange,
    cancelStageChange,
    isLoading = false,
  } = props;

  return (
    <>
      <Modal
        isOpen={openModal}
        toggle={() => setOpenModal(!openModal)}
        className='modal-dialog-centered moving-contact-pipline-modal modal-dialog-mobile'
        backdrop='static'
      >
        <ModalHeader
          toggle={!isLoading ? () => cancelStageChange() : undefined}
        >
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
        </ModalBody>
        <ModalFooter>
          <Button
            disabled={isLoading}
            color='danger'
            onClick={() => {
              cancelStageChange();
            }}
          >
            Cancel
          </Button>
          <SaveButton
            color='primary'
            onClick={() => changeCardPosition()}
            disabled={isLoading}
            loading={isLoading}
            type='button'
            name='Save'
          />
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ConfirmChangeStage;
