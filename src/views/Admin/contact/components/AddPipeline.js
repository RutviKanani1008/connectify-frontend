import React, { Fragment, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFieldArray, useWatch } from 'react-hook-form';
import { isArray } from 'lodash';
import Select from 'react-select';
import moment from 'moment';
import classnames from 'classnames';

import { store } from '../../../../redux/store';
import { selectThemeColors } from '@utils';

import { SaveButton } from '@components/save-button';
import { FormField } from '@components/form-fields';
import { X } from 'react-feather';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { updateContactStatus } from '../../../../api/contacts';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import ChangeStage from './ChangeStage';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';
import { Label } from 'reactstrap';
// import { Col } from 'reactstrap';

const AddPipeline = ({
  control,
  getValues,
  setValue,
  errors,
  buttonLoading,
  setButtonLoading,
  availablePipeline,
  initialValue,
}) => {
  const params = useParams();
  const storeState = store.getState();
  const user = storeState.user.userData;

  const pipelineList = useWatch({
    control,
    name: 'pipelineList',
  });

  const {
    fields: pipelineField,
    append: appendPipeline,
    remove: removePipeline,
    update: updatePipeline,
  } = useFieldArray({
    control,
    name: 'pipelineDetails',
  });

  const handlePipelineChange = async (value) => {
    if (value && value.length > 0 && value.length > pipelineField.length) {
      const result = value.filter((o1) => {
        return !pipelineField.some((o2) => {
          return o1.value === o2.pipeline.value; // return the ones with equal id
        });
      });
      if (result.length === 1) {
        getSelectedPipeline(result[0]);
      }
    } else {
      const result = await showWarnAlert({
        text: 'are you want to remove this pipeline?',
      });
      if (result.value) {
        const tempPipelineField = JSON.parse(JSON.stringify(pipelineField));
        const deletePipeline = tempPipelineField.find((o1) => {
          return !value.some((o2) => {
            return o2.value === o1.pipeline.value; // return the ones with equal id
          });
        });
        if (deletePipeline?.pipeline?.value) {
          const position = tempPipelineField.findIndex(
            (company) =>
              company.pipeline.value === deletePipeline?.pipeline?.value
          );
          removePipeline(position);
        }
      } else {
        const deletePipeline = pipelineField.filter((o1) => {
          return !value.some((o2) => {
            return o2.value === o1.pipeline.value; // return the ones with equal id
          });
        });
        if (deletePipeline && deletePipeline.length === 1) {
          const companyDetail = getValues('pipeline');
          companyDetail.push(deletePipeline[0].pipeline);
          setValue(`pipeline`, companyDetail);
        }
      }
    }
  };

  const removePipelineFromFields = async (index, currentPipeline) => {
    const result = await showWarnAlert({
      text: 'are you want to remove this pipeline?',
    });

    if (result.value) {
      if (index <= pipelineField.length) {
        removePipeline(index);
        let tempPipeline = JSON.parse(JSON.stringify(getValues('pipeline')));
        tempPipeline = tempPipeline.filter(
          (pipeline) => pipeline.id !== currentPipeline.id
        );
        setValue('pipeline', tempPipeline);
      }
    }
  };

  const handleStageChange = (e, statusIndex, status) => {
    pipelineField?.forEach((pipeline, index) => {
      if (index === statusIndex) {
        pipeline[status] = e;
        if (status === 'status') {
          pipeline.showStatusError = false;
        } else {
          pipeline.showMemberError = false;
        }
        setValue(`pipelineDetails[${statusIndex}]`, pipeline);
      }
    });
  };

  const [changeStatus, setChangeStatus] = useState({
    openNoteModal: false,
    currentStatusIndex: null,
    currentStatus: null,
  });

  const changePipelineStatus = async (statusIndex, status) => {
    setChangeStatus({
      openNoteModal: true,
      currentStatusIndex: statusIndex,
      currentStatus: status,
    });
  };

  const handleChangeStatus = (note) => {
    setButtonLoading({ ...buttonLoading, statusLoading: true });
    const promise = [];
    pipelineField?.forEach((company, index) => {
      if (index === changeStatus.currentStatusIndex) {
        const currentStage = JSON.parse(
          JSON.stringify(
            getValues(`pipelineDetails[${changeStatus.currentStatusIndex}]`)
          )
        );
        currentStage.updateField = changeStatus.currentStatus;
        if (currentStage?.status) {
          const status = {};
          status['id'] = currentStage.status.id;
          status['code'] = currentStage.status.value;
          status['title'] = currentStage.status.label;
          currentStage.status = status;
          currentStage.note = note;
        }
        if (currentStage?.pipeline) {
          const companyDetail = {};
          companyDetail['id'] = currentStage?.pipeline.value;
          companyDetail['name'] = currentStage?.pipeline.label;
          currentStage.pipeline = companyDetail;
        }
        promise.push(updateContactStatus(params.id, currentStage));
      }
    });
    const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');
    Promise.all(promise).then((res) => {
      if (res.error) {
        showToast(TOASTTYPES.error, toastId, res.error);
      } else {
        if (res[0]?.data?.data) {
          const updatedData = res[0]?.data?.data;
          pipelineField?.forEach((company, index) => {
            if (index === changeStatus.currentStatusIndex) {
              if (changeStatus.currentStatus === 'pipelineStatus') {
                const stageDetails = company?.contactStages.find(
                  (stage) => stage.id === updatedData.status.id
                );
                company.status = stageDetails;
                company.currentPipelineStatus = stageDetails;
                company.statusHistory = updatedData.statusHistory.reverse();
              }
              updatePipeline(changeStatus.currentStatusIndex, company);
            }
          });
        }
        showToast(TOASTTYPES.success, toastId, 'Status Updated Successfully');
      }
    });
    setButtonLoading({ ...buttonLoading, statusLoading: false });
  };

  const pipelineHistory = useWatch({
    control,
    name: 'pipelineHistory',
  });
  const reversedPipelineHistory = [...(pipelineHistory ?? [])].reverse();

  const handleCloseNoteModal = () => {
    // close note
    setChangeStatus({
      openNoteModal: false,
      status: null,
      statusIndex: null,
    });
  };

  const getSelectedPipeline = (selectedPipeline) => {
    const getStage = availablePipeline.find(
      (pipeline) =>
        pipeline.pipelineCode === selectedPipeline.value &&
        pipeline._id === selectedPipeline.id
    );
    const company = [];
    if (getStage && getStage.stages) {
      const sortStage = getStage?.stages?.sort(
        ({ order: a }, { order: b }) => a - b
      );

      sortStage.forEach((stage) => {
        const obj = {};
        obj['value'] = stage?.code;
        obj['label'] = stage?.title;
        obj['id'] = stage?._id;
        company.push(obj);
      });

      appendPipeline({
        pipeline: selectedPipeline,
        contactStages: company,
        status: '',
        currentNote: '',
        isExistingNote: false,
        notes: [],
        showMemberError: false,
        showStatusError: false,
        newAdded: true,
      });
    }
  };

  return (
    <>
      {/* <Col md={6}> */}
      <div className='accordian-loyal-box pipeline active'>
        <div className='accordian-loyal-header'>
          <div className='inner-wrapper'>
            <h3 className='title'>Pipeline</h3>
            <button className='down-arrow' type='button'></button>
          </div>
        </div>
        <div className='accordian-loyal-body mb-2'>
          <p className='normal-text'>
            Assign contact into one or more pipelines from the list below
          </p>
          <div style={{ width: '600px', maxWidth: '100%' }}>
            <FormField
              className='mb-2'
              label='pipeline'
              name='pipeline'
              placeholder='Select Pipeline'
              type='select'
              errors={errors}
              control={control}
              options={pipelineList ? pipelineList : []}
              isMulti={'true'}
              onChange={handlePipelineChange}
            />
          </div>
          <>
            {pipelineField &&
              pipelineField.length > 0 &&
              pipelineField.map((field, index) => {
                return (
                  <Fragment key={index}>
                    <div className='pipline-inner-box'>
                      <div className='pipline-header'>
                        <h3 className='title'>{field?.pipeline?.label}</h3>
                        <div className='action-btn-wrapper'>
                          <div className='action-btn edit-btn'>
                            <X
                              color='#000000'
                              className='cursor-pointer'
                              size={20}
                              onClick={() =>
                                removePipelineFromFields(index, field?.pipeline)
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className='form-group'>
                        <label className='form-label form-label'>
                          Current Status
                        </label>
                        <Select
                          theme={selectThemeColors}
                          className={classnames('react-select', {
                            'is-invalid': field?.showStatusError && true,
                          })}
                          placeholder={'Select current Status'}
                          classNamePrefix='custom-select'
                          options={field?.contactStages}
                          isClearable={false}
                          onChange={(e) => {
                            handleStageChange(e, index, 'status');
                          }}
                          menuPosition='fixed'
                          defaultValue={field?.status}
                        />
                      </div>
                      {field?.showStatusError ? (
                        <>
                          <span className='invalid-feedback'>
                            Please select current Status
                          </span>
                        </>
                      ) : null}
                      <div className='pipline-history-box-wrapper'>
                        {field?.statusHistory &&
                        field?.statusHistory?.length > 0 ? (
                          field?.statusHistory.map((status, index) => {
                            if (index === 0) {
                              return (
                                <div
                                  className='pipline-history-box'
                                  key={index}
                                >
                                  <div className='pipline-change-row'>
                                    <div className='pipline-name'>
                                      {/* |{" "} */}
                                      {field?.statusHistory[index]
                                        ? `${field?.statusHistory?.[index]?.status?.title}`
                                        : ''}
                                    </div>
                                    <span className='change-arrow'></span>
                                    <div className='pipline-name change'>
                                      {field?.currentPipelineStatus?.label}
                                    </div>
                                  </div>

                                  <div className='note-wrapper'>
                                    <div className='note'>
                                      <Label>Note :</Label>
                                      <div className='note-inner'>
                                        {status?.note || '-'}
                                      </div>
                                    </div>
                                    <div className='author-date'>
                                      <span className='author-name'>
                                        {status?.changedBy?.firstName}{' '}
                                        {status?.changedBy?.lastName}
                                      </span>
                                      <span className='date'>
                                        {moment(
                                          new Date(status?.createdAt)
                                        ).format(
                                          `${
                                            user?.company?.dateFormat
                                              ? user?.company?.dateFormat
                                              : 'MM/DD/YYYY'
                                          }, HH:mm A`
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  {/* <div className='text-primary '>
                                      Note: {status?.note}
                                    </div> */}
                                </div>
                              );
                            }
                            return (
                              <div className='pipline-history-box' key={index}>
                                <div className='pipline-change-row'>
                                  <div className='pipline-name'>
                                    {
                                      field?.statusHistory?.[index].status
                                        ?.title
                                    }
                                  </div>
                                  <span className='change-arrow'></span>
                                  <div className='pipline-name'>
                                    {field?.statusHistory?.[index - 1]
                                      ? field?.statusHistory?.[index - 1]
                                          ?.status?.title
                                      : ''}
                                  </div>
                                </div>
                                <div className='note-wrapper'>
                                  <div className='note'>
                                    <Label>Note :</Label>
                                    <div className='note-inner'>
                                      {status?.note || '-'}
                                    </div>
                                  </div>
                                  <div className='author-date'>
                                    <span className='author-name'>
                                      {status?.changedBy?.firstName}{' '}
                                      {status?.changedBy?.lastName}
                                    </span>
                                    <span className='date'>
                                      {moment(
                                        new Date(status.createdAt)
                                      ).format(
                                        `${
                                          user?.company?.dateFormat
                                            ? user?.company?.dateFormat
                                            : 'MM/DD/YYYY'
                                        }, HH:mm A`
                                      )}
                                    </span>
                                  </div>
                                </div>
                                {/* <div className='text-primary '>
                                    Note: {status?.note}
                                  </div>{' '} */}
                              </div>
                            );
                          })
                        ) : (
                          <NoRecordFound />
                        )}
                      </div>
                      {params.id !== 'add' && !field?.newAdded ? (
                        <div className='mt-0 mb-1 d-flex align-items-center justify-content-center'>
                          <SaveButton
                            color='primary'
                            outline
                            type='button'
                            name='Update Current Status'
                            width='210px'
                            onClick={() => {
                              if (
                                field.status?.id !==
                                field.currentPipelineStatus?.id
                              ) {
                                changePipelineStatus(index, 'pipelineStatus');
                              }
                            }}
                            loading={buttonLoading.statusLoading}
                          ></SaveButton>
                        </div>
                      ) : null}
                    </div>
                    {changeStatus.openNoteModal && (
                      <ChangeStage
                        currentStatus={
                          pipelineField?.[changeStatus.currentStatusIndex]
                        }
                        openModal={changeStatus.openNoteModal}
                        handleCloseNoteModal={handleCloseNoteModal}
                        handleChangeStatus={handleChangeStatus}
                      />
                    )}
                  </Fragment>
                );
              })}
          </>
          <div className='pipline-inner-box pipline-history-box'>
            <div className='pipeline-history-title'>Pipeline History</div>
            <div className='pipeline-history-row'>
              {reversedPipelineHistory &&
              reversedPipelineHistory?.length > 0 ? (
                reversedPipelineHistory.map((pipeline, index) => {
                  console.log('pipeline', pipeline);
                  if (index === 0) {
                    return (
                      <div className='pipelines-history-cell' key={index}>
                        <div className='old-pipeline'>
                          <h3 className='title'>Old Pipeline</h3>
                          <div className='inner-wrapper'>
                            {reversedPipelineHistory[index]?.['pipelines']
                              ?.length ? (
                              reversedPipelineHistory[index]?.[
                                'pipelines'
                              ]?.map((obj, childIndex) => {
                                if (
                                  childIndex ===
                                  reversedPipelineHistory[index]?.['pipelines']
                                    ?.length -
                                    1
                                )
                                  return (
                                    <>
                                      <span
                                        className='badge-pipeline'
                                        key={childIndex}
                                      >
                                        {obj.title}
                                      </span>
                                    </>
                                  );
                                else
                                  return (
                                    <>
                                      <span
                                        className='badge-pipeline'
                                        key={childIndex}
                                      >
                                        {obj.title}
                                      </span>
                                    </>
                                  );
                              })
                            ) : (
                              <span
                                className='badge-pipeline'
                                key={`unassigned-old-${index}`}
                              >
                                Unassigned
                              </span>
                            )}
                          </div>
                        </div>
                        <div className='new-pipeline'>
                          <h3 className='title'>New Pipeline</h3>
                          <div className='inner-wrapper'>
                            {isArray(initialValue.pipeline) &&
                            initialValue.pipeline?.length ? (
                              initialValue.pipeline?.map((obj, childIndex) => {
                                if (childIndex === initialValue.pipeline - 1)
                                  return (
                                    <span
                                      className='badge-pipeline'
                                      key={childIndex}
                                    >
                                      {obj.label}
                                    </span>
                                  );
                                else
                                  return (
                                    <span
                                      className='badge-pipeline'
                                      key={childIndex}
                                    >
                                      {obj.label}
                                    </span>
                                  );
                              })
                            ) : (
                              <span
                                className='badge-pipeline'
                                key={`unassigned-new-${index}`}
                              >
                                Unassigned
                              </span>
                            )}
                          </div>
                        </div>
                        <div className='author-date'>
                          <span className='author-name'>
                            {pipeline?.changedBy?.firstName}{' '}
                            {pipeline?.changedBy?.lastName}
                          </span>
                          <span className='date'>
                            {moment(new Date(pipeline.createdAt)).format(
                              `${
                                user?.company?.dateFormat
                                  ? user?.company?.dateFormat
                                  : 'MM/DD/YYYY'
                              }, HH:mm A`
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className='pipelines-history-cell' key={index}>
                      <div className='old-pipeline'>
                        <h3 className='title'>Old Pipeline</h3>
                        <div className='inner-wrapper'>
                          {reversedPipelineHistory[index]?.['pipelines']
                            ?.length ? (
                            reversedPipelineHistory[index]?.['pipelines']?.map(
                              (obj, childIndex) => {
                                if (
                                  childIndex ===
                                  reversedPipelineHistory[index]?.['pipelines']
                                    ?.length -
                                    1
                                ) {
                                  return (
                                    <span
                                      className='badge-pipeline'
                                      key={childIndex}
                                    >
                                      {obj.title}
                                    </span>
                                  );
                                } else
                                  return (
                                    <span
                                      className='badge-pipeline'
                                      key={childIndex}
                                    >
                                      {obj.title}
                                    </span>
                                  );
                              }
                            )
                          ) : (
                            <span
                              className='badge-pipeline'
                              key={`unassigned-old-${index}`}
                            >
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='new-pipeline'>
                        <h3 className='title'>New Pipeline</h3>
                        <div className='inner-wrapper'>
                          {reversedPipelineHistory[index - 1]?.['pipelines']
                            ?.length ? (
                            reversedPipelineHistory[index - 1]?.[
                              'pipelines'
                            ]?.map((obj, childIndex) => {
                              console.log('first', obj);
                              if (
                                childIndex ===
                                reversedPipelineHistory[index - 1]?.[
                                  'pipelines'
                                ]?.length -
                                  1
                              )
                                return (
                                  <span
                                    className='badge-pipeline'
                                    key={childIndex}
                                  >
                                    {obj.title}
                                  </span>
                                );
                              else
                                return (
                                  <span
                                    className='badge-pipeline'
                                    key={childIndex}
                                  >
                                    {obj.title}
                                  </span>
                                );
                            })
                          ) : (
                            <span
                              className='badge-pipeline'
                              key={`unassigned-new-${index}`}
                            >
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='author-date'>
                        <span className='author-name'>
                          {pipeline?.changedBy?.firstName}{' '}
                          {pipeline?.changedBy?.lastName}
                        </span>
                        <span className='date'>
                          {moment(new Date(pipeline.createdAt)).format(
                            `${
                              user?.company?.dateFormat
                                ? user?.company?.dateFormat
                                : 'MM/DD/YYYY'
                            }, HH:mm A`
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className='no-record-found-table'>
                  <div className='img-wrapper'>
                    <img src='/images/no-result-found.png' />
                  </div>
                  <div className='title'>No record found</div>
                  <p className='text'>
                    Whoops... we do not see any records for this table in our
                    database
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* </Col> */}
    </>
  );
};

export default AddPipeline;
