import PerfectScrollbar from 'react-perfect-scrollbar';
import { Button, Spinner, UncontrolledTooltip } from 'reactstrap';
import { ChevronDown, ChevronUp, Edit2, Plus, Trash, X } from 'react-feather';

import { PIPELINE_TYPE } from '../../constant';

const GroupsList = ({
  groupLoading,
  currentGroup,
  setCurrentGroup,
  availableGroups,
  pipelineType,
  setPipelineType,
  pipelineLoading,
  currentPipeline,
  setCurrentPipeline,
  availablePipelines,
  setSidebarCollapsed,
  onAddEditPipeline,
  onDeletePipeline,
}) => {
  return (
    <>
      <div className='group-wrapper'>
        <div className='group-header'>
          <div className='plus-btn'>
            <Plus className='' size={14} />
          </div>
          <h3 className='group-heading'>
            <span>Groups</span>
            <span
              className='close-btn'
              onClick={() => setSidebarCollapsed(true)}
            >
              <X />
            </span>
          </h3>
          <div className='down-arrow-btn'>
            <ChevronDown className='down-arrow' />
          </div>
        </div>
        {groupLoading ? (
          <div className='d-flex justify-content-center'>
            <Spinner className='mt-1 mb-2' />
          </div>
        ) : (
          <>
            {availableGroups.length > 0 ? (
              <PerfectScrollbar className='group-list-body'>
                <li
                  className='group-item'
                  style={{
                    marginBottom: '5px',
                    borderRadius: '0px',
                    ...(pipelineType === PIPELINE_TYPE.GROUP && {
                      backgroundColor: '#e1f7c5',
                      borderLeft: '5px solid #a3db59',
                    }),
                  }}
                  onClick={() => {
                    setPipelineType(PIPELINE_TYPE.GROUP);
                    setCurrentGroup(null);
                    setCurrentPipeline(null);
                  }}
                >
                  <div className='group-item-header'>
                    <div
                      className='group-title'
                      style={{
                        fontWeight: '700 !important',
                        fontSize: '16px',
                      }}
                    >
                      All Groups
                    </div>
                    <div className='action-btn-wrapper'>
                      <div
                        className='action-btn toggle-btn'
                        style={{ opacity: 0 }}
                      >
                        <ChevronDown className='' size={34} />
                      </div>
                    </div>
                  </div>
                </li>

                {availableGroups.map((group, index) => {
                  return (
                    <li
                      className={`group-item ${
                        currentGroup?.groupCode === group?.groupCode
                          ? 'active'
                          : ''
                      }`}
                      key={index}
                    >
                      <div
                        className='group-item-header'
                        onClick={() => {
                          if (currentGroup?.groupCode === group?.groupCode) {
                            setCurrentGroup(null);
                          } else {
                            setCurrentGroup(group);
                          }
                          setCurrentPipeline(null);
                        }}
                      >
                        <div className='group-title'>{group?.groupName}</div>
                        <div className='action-btn-wrapper'>
                          <div className='action-btn toggle-btn'>
                            {currentGroup?.groupCode === group?.groupCode &&
                            !pipelineLoading ? (
                              <ChevronUp className='' size={34} />
                            ) : (
                              <ChevronDown className='' size={34} />
                            )}
                          </div>
                        </div>
                      </div>

                      {currentGroup?.groupCode === group?.groupCode ? (
                        <>
                          <div className='group-pipeline-wrapper'>
                            <div
                              className={`group-header category-pipeline ${
                                pipelineType === PIPELINE_TYPE.CATEGORY
                                  ? 'active'
                                  : ''
                              }`}
                              onClick={() => {
                                setPipelineType(PIPELINE_TYPE.CATEGORY);
                                setCurrentPipeline(null);
                              }}
                            >
                              <h3 className='group-heading'>
                                Category Pipeline
                              </h3>
                            </div>
                            <div
                              className={`group-header status-pipeline ${
                                pipelineType === PIPELINE_TYPE.STATUS
                                  ? 'active'
                                  : ''
                              }`}
                              onClick={() => {
                                setPipelineType(PIPELINE_TYPE.STATUS);
                                setCurrentPipeline(null);
                              }}
                            >
                              <h3 className='group-heading'>Status Pipeline</h3>
                            </div>
                            <div
                              className={`group-header custom-pipeline ${
                                pipelineType === PIPELINE_TYPE.CUSTOM
                                  ? 'active'
                                  : ''
                              }`}
                              onClick={() => {
                                setPipelineType(PIPELINE_TYPE.CUSTOM);
                                if (!currentPipeline) {
                                  setCurrentPipeline(availablePipelines[0]);
                                }
                              }}
                            >
                              <h3 className='group-heading'>Custom Pipeline</h3>
                            </div>
                            <>
                              {availablePipelines.map((pipeline) => (
                                <div
                                  key={`pipeline_${pipeline._id}`}
                                  className={`group-item ${
                                    pipeline._id === currentPipeline?._id
                                      ? 'active'
                                      : ''
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPipelineType(PIPELINE_TYPE.CUSTOM);
                                    setCurrentPipeline(pipeline);
                                  }}
                                >
                                  <div className='group-item-header'>
                                    <h4 className='group-title'>
                                      {pipeline.pipelineName}
                                    </h4>
                                    <div className='action-btn-wrapper'>
                                      <div className='action-btn edit-btn'>
                                        <Edit2
                                          size={15}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onAddEditPipeline({
                                              id: pipeline._id,
                                              data: pipeline,
                                            });
                                          }}
                                          id={`pipelineEdit_${pipeline._id}`}
                                        />
                                        <UncontrolledTooltip
                                          placement='top'
                                          autohide={true}
                                          target={`pipelineEdit_${pipeline._id}`}
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
                                            onDeletePipeline(pipeline._id);
                                          }}
                                          id={`pipelineDelete_${pipeline._id}`}
                                        />
                                        <UncontrolledTooltip
                                          placement='top'
                                          autohide={true}
                                          target={`pipelineDelete_${pipeline._id}`}
                                        >
                                          Delete Pipeline
                                        </UncontrolledTooltip>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <div className='add-btn-wrapper'>
                                <Button
                                  color='primary'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddEditPipeline();
                                  }}
                                >
                                  <Plus className='' size={14} />
                                  <span className='text'>Add Pipeline</span>
                                </Button>
                              </div>
                            </>
                          </div>
                        </>
                      ) : null}
                    </li>
                  );
                })}
              </PerfectScrollbar>
            ) : (
              <div className='d-flex justify-content-center my-1'>
                <span className='no-data-found'>No group found!</span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default GroupsList;
