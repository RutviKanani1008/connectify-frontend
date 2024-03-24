import { useMemo } from 'react';

import { Edit2, Eye, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';

const useCustomPipelineStagesColumns = ({
  onEditStage,
  onDeleteStage,
  onViewStageContacts,
  pipelineStages,
}) => {
  const columns = useMemo(() => {
    return [
      {
        name: 'Title',
        selector: (row) => row?.title,
        searchKey: 'title',
        isSearchable: true,
      },
      {
        name: 'Code',
        selector: (row) => row?.code,
        searchKey: 'code',
        isSearchable: true,
      },
      {
        name: 'Actions',
        cell: (stage) => (
          <div className='action-btn-wrapper'>
            <div className='action-btn edit-btn'>
              <Edit2
                size={15}
                className={'cursor-pointer'}
                id={`edit_${stage?._id}`}
                onClick={() => onEditStage({ id: stage?._id })}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`edit_${stage?._id}`}
              >
                Update
              </UncontrolledTooltip>
            </div>
            <div className='action-btn eye-btn'>
              <Eye
                size={15}
                className={'cursor-pointer'}
                id={`view_contacts_${stage?._id}`}
                onClick={() => onViewStageContacts({ id: stage?._id })}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`view_contacts_${stage?._id}`}
              >
                {'View Contacts'}
              </UncontrolledTooltip>
            </div>
            <div className='action-btn delete-btn'>
              <Trash
                size={15}
                id={`delete_${stage?._id}`}
                color={'red'}
                className={'cursor-pointer'}
                onClick={() => onDeleteStage({ id: stage?._id })}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`delete_${stage?._id}`}
              >
                {'Delete'}
              </UncontrolledTooltip>
            </div>
          </div>
        ),
      },
    ];
  }, [pipelineStages]);

  return { columns };
};

export default useCustomPipelineStagesColumns;
