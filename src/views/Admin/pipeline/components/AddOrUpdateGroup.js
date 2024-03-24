import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { SaveButton } from '../../../../@core/components/save-button';

const AddOrUpdateGroup = (props) => {
  const {
    openModal,
    handleCloseModel,
    isUpdateGroup,
    currentGroup,
    setShowError,
    setCurrentGroup,
    showError,
    addOrUpdateGroupLoading,
    createOrUpdateGroup,
  } = props;
  return (
    <>
      <Modal
        isOpen={openModal.groupModal}
        toggle={() => {
          handleCloseModel();
        }}
        className='modal-dialog-centered add-update-group-modal'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            handleCloseModel();
          }}
        >
          {isUpdateGroup ? 'Update Group' : 'Add Group'}
        </ModalHeader>
        <ModalBody>
          <div className='mb-1 mt-1'>
            <Input
              label='Group Name'
              name='group'
              placeholder='Group Name'
              type='text'
              value={currentGroup.text}
              onChange={(e) => {
                if (showError) {
                  setShowError(false);
                }
                setCurrentGroup({
                  text: e.target.value,
                });
              }}
            />
            {showError ? (
              <>
                <div className='mt-1 text-danger'>Please Enter Group Name.</div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='danger'
            onClick={() => {
              handleCloseModel();
            }}
          >
            Cancel
          </Button>
          <SaveButton
            name={isUpdateGroup ? 'Update Group' : 'Add Group'}
            width='160px'
            loading={addOrUpdateGroupLoading}
            onClick={() => {
              if (currentGroup.text === '') {
                setShowError(true);
              } else {
                createOrUpdateGroup();
              }
            }}
          />
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AddOrUpdateGroup;
