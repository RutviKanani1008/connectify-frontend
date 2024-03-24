import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { updateMemberContactStage as updateStageAPI } from '../../../../../api/pipeline';

const MySwal = withReactContent(Swal);

const useDeleteStage = ({
  currentPipeline,
  pipelineStages,
  setRefreshData,
}) => {
  const deleteCustomPipelineStage = async ({ id, data }) => {
    const hasContacts = data.cards?.length;
    if (hasContacts) {
      return MySwal.fire({
        title: '',
        text: 'You are not allowed to delete this stage because there are contacts in it. You must remove all contacts to delete it.',
        icon: 'warning',
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
        customClass: {
          confirmButton: 'btn btn-primary',
        },
        buttonsStyling: false,
      });
    }

    if (!hasContacts) {
      return MySwal.fire({
        title: '',
        text: 'Are you want to delete this stage?',
        icon: 'warning',
        allowOutsideClick: false,
        confirmButtonText: 'Yes',
        inputAttributes: {
          autocapitalize: 'off',
        },
        showCancelButton: true,
        loaderHtml: '<div class="spinner-border text-primary"></div>',
        showLoaderOnConfirm: true,
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger ms-1',
          loader: 'custom-loader',
        },
        buttonsStyling: false,
        preConfirm: async () => {
          const stages = pipelineStages.filter((stg) => stg._id !== id);

          if (currentPipeline && currentPipeline._id) {
            const { error } = await updateStageAPI(currentPipeline._id, {
              stage: stages,
            });

            if (error) {
              return showToast(TOASTTYPES.error, '', error);
            }

            setRefreshData(true);
          }
        },
      });
    }
  };

  return { deleteStage: deleteCustomPipelineStage };
};

export default useDeleteStage;
