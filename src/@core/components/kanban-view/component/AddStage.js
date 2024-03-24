import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { SaveButton } from '../../save-button';

const AddStage = (props) => {
  const {
    openAddStage,
    clearStageModal,
    isEditName,
    currentStageText,
    showError,
    setShowError,
    setCurrentStageText,
    errorMessage,
    stageLoading,
    createCompanyStage,
  } = props;
  return (
    <>
      <Modal
        isOpen={openAddStage}
        toggle={() => {
          clearStageModal();
        }}
        className='modal-dialog-centered add-pipline-stage-modal'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            clearStageModal();
          }}
        >
          {isEditName ? 'Rename Stage' : 'Add Stage'}
        </ModalHeader>
        <ModalBody>
          <div className=''>
            <Input
              label='Stage Name'
              name='stage'
              placeholder='Stage name'
              type='text'
              value={currentStageText.text}
              onChange={(e) => {
                if (showError) {
                  setShowError(false);
                }
                setCurrentStageText({
                  ...currentStageText,
                  text: e.target.value,
                });
              }}
            />
            {showError ? (
              <>
                <div className='mt-1 text-danger'>
                  {errorMessage ? errorMessage : 'Please Enter stage Name.'}
                </div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='danger'
            onClick={() => {
              clearStageModal();
            }}
          >
            Cancel
          </Button>
          <SaveButton
            name={isEditName ? 'Update Stage' : 'Add Stage'}
            loading={stageLoading}
            color='primary'
            // width={isEditName ? '150px' : '130px'}
            onClick={() => {
              if (currentStageText.text === '') {
                setShowError(true);
              } else {
                createCompanyStage();
              }
            }}
          />
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AddStage;
