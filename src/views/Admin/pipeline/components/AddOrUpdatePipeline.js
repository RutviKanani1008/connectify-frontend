import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { SaveButton } from '../../../../@core/components/save-button';

const AddOrUpdatePipeline = (props) => {
  const {
    openModal,
    handleCloseModel,
    isUpdatePIpeline,
    currentGroup,
    currentPipeline,
    showError,
    setShowError,
    setCurrentPipeline,
    addOrUpdatePipelineLoading,
    createOrUpdatePipeline,
  } = props;
  return (
    <>
      <Modal
        isOpen={openModal.pipelineModal}
        toggle={() => {
          handleCloseModel();
        }}
        className='modal-dialog-centered add-update-groupPipeline'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            handleCloseModel();
          }}
        >
          {isUpdatePIpeline ? 'Update Pipeline' : 'Add Pipeline'}
        </ModalHeader>
        <ModalBody>
          <div className='normal-text'>
            {isUpdatePIpeline ? 'Updating' : 'Adding'} pipeline{' '}
            {isUpdatePIpeline ? 'of' : 'into'}
            <span className='text-primary'>
              {` ${currentGroup?.groupName}`}
            </span>
          </div>
          <div className='mb-2'>
            <Input
              label='Stage Name'
              name='stage'
              placeholder='Pipeline Name'
              type='text'
              value={currentPipeline.text}
              onChange={(e) => {
                if (showError) {
                  setShowError(false);
                }
                setCurrentPipeline({
                  text: e.target.value,
                });
              }}
            />
            {showError ? (
              <>
                <div className='mt-1 text-danger'>
                  Please Enter Pipeline Name.
                </div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <SaveButton
            name={isUpdatePIpeline ? 'Update Pipeline' : 'Add Pipeline'}
            width='160px'
            loading={addOrUpdatePipelineLoading}
            onClick={() => {
              if (currentPipeline.text === '') {
                setShowError(true);
              } else {
                createOrUpdatePipeline();
              }
            }}
          />
          <Button
            color='danger'
            onClick={() => {
              handleCloseModel();
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AddOrUpdatePipeline;
