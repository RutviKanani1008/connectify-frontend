/* eslint-disable no-unused-vars */
import _ from 'lodash';
import { useEffect, useState } from 'react';
import {
  getPipeline as getPipelineAPI,
  deletePipeline as deletePipelineAPI,
} from '../../../../api/pipeline';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { PIPELINE_TYPE } from '../constant';
import { getContactDetails as getContactDetailsAPI } from '../../../../api/contacts';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
const MySwal = withReactContent(Swal);

const useCustomPipelineService = ({ currentGroup, pipelineType }) => {
  const user = useSelector(userData);

  const [isLoading, setIsLoading] = useState(false);
  const [currentPipeline, setCurrentPipeline] = useState(null);
  const [availablePipelines, setAvailablePipelines] = useState([]);

  useEffect(() => {
    if (currentGroup?._id) {
      getPipelineDetails(currentGroup._id);
    }
  }, [currentGroup]);

  const getPipelineDetails = async (groupId) => {
    try {
      setIsLoading(false);
      const { data: piplineData } = await getPipelineAPI({
        company: user.company._id,
        groupId,
      });

      if (_.isArray(piplineData?.data)) {
        setAvailablePipelines(piplineData?.data);
        if (pipelineType === PIPELINE_TYPE.CUSTOM) {
          if (piplineData.data.length) {
            setCurrentPipeline(piplineData.data[0]);
          } else {
            setCurrentPipeline(null);
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const onDeletePipeline = async (pipelineId) => {
    try {
      const { data: contactsDetails } = await getContactDetailsAPI({
        'pipelineDetails.pipeline.id': pipelineId,
        'group.id': currentGroup._id,
      });
      if (contactsDetails?.data?.length === 0) {
        const result = await MySwal.fire({
          title: '',
          text: 'are you want to Delete this pipeline?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Okay',
          allowOutsideClick: false,
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger ms-1',
          },
          buttonsStyling: false,
        });

        if (result.value) {
          const toastId = showToast(TOASTTYPES.loading);
          const { error } = deletePipelineAPI(pipelineId);
          if (error) {
            return showToast(TOASTTYPES.error, toastId, error);
          }

          const updatedPipelines = availablePipelines.filter(
            (p) => p._id !== pipelineId
          );
          if (currentPipeline?._id === pipelineId && updatedPipelines.length) {
            setCurrentPipeline(updatedPipelines[0]);
          }
          setAvailablePipelines(updatedPipelines);

          showToast(
            TOASTTYPES.success,
            toastId,
            'Pipeline Deleted Successfully'
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
    currentPipeline,
    setCurrentPipeline,
    availablePipelines,
    setAvailablePipelines,
    onDeletePipeline,
    isLoading,
  };
};

export default useCustomPipelineService;
