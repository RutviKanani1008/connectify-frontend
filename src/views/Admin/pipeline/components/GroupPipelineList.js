import { Edit2, Plus, Trash } from 'react-feather';
import { Button, Spinner, UncontrolledTooltip } from 'reactstrap';

const GroupPipelineList = (props) => {
  const {
    pipelineLoading,
    pipeline,
    currentMember,
    handleStageChange,
    handleEditPipeline,
    handleDeletePipeline,
    setOpenModal,
    openModal,
  } = props;
  return (
    <>
      <div className='group-heading'>Group Pipeline</div>
      {pipelineLoading ? (
        <div className='d-flex justify-content-center my-1'>
          <Spinner />
        </div>
      ) : (
        <>
          {pipeline.contactPipeline &&
            pipeline.contactPipeline.length > 0 &&
            pipeline.contactPipeline.map((member, index) => {
              return (
                <li
                  className={`group-item ${
                    member.value === currentMember?.contact?.value
                      ? 'active'
                      : ''
                  }`}
                  key={index}
                  onClick={() => {
                    handleStageChange(member, 'contactPipeline');
                  }}
                >
                  <div className='group-title'>{member?.label}</div>
                  <div className='action-btn-wrapper'>
                    <div className='action-btn edit-btn'>
                      <Edit2
                        className=''
                        size={15}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPipeline(member?.id);
                        }}
                        id={`pipelineEdit_${index}`}
                      />
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={`pipelineEdit_${index}`}
                      >
                        Edit Pipeline
                      </UncontrolledTooltip>
                    </div>
                    <div className='action-btn delete-btn'>
                      <Trash
                        color={'red'}
                        size={15}
                        className={'cursor-pointer'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePipeline(member?.id);
                        }}
                        id={`pipelineDelete_${index}`}
                      />
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={`pipelineDelete_${index}`}
                      >
                        Delete Pipeline
                      </UncontrolledTooltip>
                    </div>
                  </div>
                </li>
              );
            })}
          <div
            className={'add-group-wrapper'}
            onClick={() => {
              setOpenModal({
                ...openModal,
                pipelineModal: !openModal.pipelineModal,
              });
            }}
          >
            <Button color='primary'>
              <Plus className='' size={14} />
              Add Pipeline
            </Button>
          </div>
          {!(pipeline.contactPipeline.length > 0) && (
            <div className='d-flex justify-content-center my-1'>
              <span className='no-data-found'>
                No pipeline available in this group!
              </span>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default GroupPipelineList;
