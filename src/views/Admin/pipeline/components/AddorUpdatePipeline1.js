import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { SaveButton } from '../../../../@core/components/save-button';
import {
  createPipeline as createPipelineAPI,
  updatePipeline as updatePipelineAPI,
} from '../../../../api/pipeline';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';

const AddOrUpdatePipeline = ({
  id,
  open,
  setOpen,
  data,
  currentGroup,
  onSuccess,
}) => {
  const user = useSelector(userData);

  const [isLoading, setIsLoading] = useState(false);
  const [pipelineName, setPipelineName] = useState({ text: '', error: null });

  useEffect(() => {
    if (id) {
      setPipelineName((prev) => ({ ...prev, text: data?.pipelineName || '' }));
    }
  }, [id, data]);

  const createOrUpdatePipeline = async () => {
    try {
      setIsLoading(true);
      if (id) {
        const updateData = {
          pipelineName: pipelineName.text,
          active: data.active,
          company: data.company,
          groupId: data.groupId,
          type: 'updateName',
        };

        const { data: updatedData, error } = await updatePipelineAPI(
          id,
          updateData
        );

        if (error) {
          return showToast(TOASTTYPES.error, '', error);
        }

        if (updatedData.data) {
          const updatedPipeline = updatedData.data;
          onSuccess({ pipeline: updatedPipeline });
        }

        showToast(TOASTTYPES.success, '', 'Pipeline Updated Successfully');
        setOpen(false);

        return;
      }

      const createData = {
        pipelineName: pipelineName.text,
        active: true,
        company: user.company._id,
        groupId: currentGroup._id,
      };

      const { data: createdData, error } = await createPipelineAPI(createData);

      if (error) {
        return showToast(TOASTTYPES.error, '', error);
      }

      if (createdData.data) {
        const newPipeline = createdData.data;
        onSuccess({ pipeline: newPipeline, isNew: true });
      }

      showToast(TOASTTYPES.success, '', 'Pipeline Added Successfully');
      setOpen(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Modal
        isOpen={open}
        toggle={() => setOpen(!open)}
        className='modal-dialog-centered add-update-groupPipeline'
        backdrop='static'
      >
        <ModalHeader toggle={() => setOpen(!open)}>
          {id ? 'Update Pipeline' : 'Add Pipeline'}
        </ModalHeader>
        <ModalBody>
          <div className='normal-text'>
            {id ? 'Updating' : 'Adding'} pipeline {id ? 'of' : 'into'}
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
              value={pipelineName.text}
              onChange={(e) => {
                setPipelineName({
                  text: e.target.value,
                  error: null,
                });
              }}
            />
            {pipelineName.error ? (
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
            name={id ? 'Update Pipeline' : 'Add Pipeline'}
            width='160px'
            loading={isLoading}
            onClick={() => {
              if (pipelineName.text === '') {
                return setPipelineName((prev) => ({
                  ...prev,
                  error: 'Please Enter Pipeline Name.',
                }));
              }
              createOrUpdatePipeline();
            }}
          />
          <Button color='danger' onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AddOrUpdatePipeline;
