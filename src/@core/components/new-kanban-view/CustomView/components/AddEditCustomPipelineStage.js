import { useState, useEffect } from 'react';

import _ from 'lodash';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';

import { SaveButton } from '../../../save-button';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { updateMemberContactStage as updateStageAPI } from '../../../../../api/pipeline';

const AddEditCustomPipelineStage = ({
  id,
  open,
  setOpen,
  data,
  currentPipeline,
  pipelineStages,
  setRefreshData,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStageName, setCurrentStageName] = useState({
    text: '',
    error: null,
  });

  useEffect(() => {
    if (id) {
      setCurrentStageName({ text: data?.title || '', error: null });
    }
  }, [id, data]);

  const createCompanyStage = async () => {
    try {
      setIsLoading(true);

      const pipelineId = currentPipeline._id;
      const stageName = currentStageName.text;
      const stageCode = stageName.split(' ').join('-').toLowerCase();

      const isExist = pipelineStages.find(
        (s) => s._id !== id && s.code === stageCode
      );

      if (isExist && isExist._id !== id) {
        setIsLoading(false);
        return setCurrentStageName((prev) => ({
          ...prev,
          error: 'Stage name must be unique',
        }));
      }

      let updatedStages = _.cloneDeep(pipelineStages);

      if (id) {
        updatedStages = updatedStages.map((s) =>
          s._id === id ? { ...s, title: stageName, code: stageCode } : s
        );
      } else {
        const order = pipelineStages.length;
        const newStage = { code: stageCode, title: stageName, order };
        updatedStages = [...pipelineStages, newStage];
      }

      if (_.isEqual(pipelineStages, updatedStages)) {
        setIsLoading(false);
        return setOpen(false);
      }

      const { error } = await updateStageAPI(pipelineId, {
        stage: updatedStages,
      });

      if (error) {
        setIsLoading(true);
        return showToast(TOASTTYPES.error, '', error);
      }

      setOpen(false);
      setIsLoading(false);
      showToast(
        TOASTTYPES.success,
        '',
        `Stage ${id ? 'Updated' : 'Added'}  Successfully`
      );
      setRefreshData(true);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      toggle={() => setOpen(!open)}
      className='modal-dialog-centered add-pipline-stage-modal'
      backdrop='static'
    >
      <ModalHeader toggle={() => setOpen(!open)}>
        {id ? 'Rename Stage' : 'Add Stage'}
      </ModalHeader>
      <ModalBody>
        <div className=''>
          <Input
            label='Stage Name'
            name='stage'
            placeholder='Stage name'
            type='text'
            value={currentStageName.text}
            onChange={(e) => {
              setCurrentStageName({ text: e.target.value, error: null });
            }}
          />
          {currentStageName.error ? (
            <>
              <div className='mt-1 text-danger'>{currentStageName.error}</div>
            </>
          ) : null}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color='danger' onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <SaveButton
          name={id ? 'Update Stage' : 'Add Stage'}
          loading={isLoading}
          color='primary'
          onClick={() => {
            if (currentStageName.text === '') {
              return setCurrentStageName((prev) => ({
                ...prev,
                error: 'Please Enter stage Name.',
              }));
            }
            createCompanyStage();
          }}
        />
      </ModalFooter>
    </Modal>
  );
};

export default AddEditCustomPipelineStage;
