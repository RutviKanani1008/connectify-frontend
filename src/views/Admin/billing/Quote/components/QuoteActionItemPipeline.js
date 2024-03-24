import React from 'react';
import { X } from 'react-feather';
import { Col } from 'reactstrap';
import { FormField } from '../../../../../@core/components/form-fields';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { pipelineActions } from '../AddQuote';

const QuoteActionItemPipeline = ({
  item,
  quoteActionIdx,
  quoteActionPipelineIdx,
  currentCustomer,
  dropdownList,
  control,
  getValues,
  setValue,
}) => {
  const isNewItem = !(
    item.action === pipelineActions.KEEP_SAME ||
    item.action === pipelineActions.UPDATED
  );
  const isDeletedItem = item.action === pipelineActions.DELETED;

  const pipelineOptions = dropdownList.pipelineWithStages
    .map((p) => ({
      id: p._id,
      value: p.pipelineCode,
      label: p.pipelineName,
    }))
    .filter((p) => {
      const oldSelected = !(
        getValues(
          `quoteStatusActions[${quoteActionIdx}].newGroupInfo.pipelineDetails`
        ) || []
      )
        .filter((p) => p.action !== pipelineActions.DELETED)
        .map((p) => p?.pipeline?.value)
        .includes(p?.value);

      return oldSelected;
    });

  const stageOptions =
    dropdownList.pipelineWithStages
      .find((p) => {
        return (
          p._id ===
          getValues(
            `quoteStatusActions[${quoteActionIdx}].newGroupInfo.pipelineDetails[${quoteActionPipelineIdx}].pipeline`
          )?.id
        );
      })
      ?.stages?.map((s) => ({
        id: s._id,
        value: s.code,
        label: s.title,
      })) || [];

  const handlePipelineChange = (e) => {
    // setValue(
    //   `quoteStatusActions[${quoteActionIdx}].newGroupInfo.pipelineDetails[${quoteActionPipelineIdx}].status`,
    //   null
    // );

    const oldPipelineDetails =
      getValues(
        `quoteStatusActions[${quoteActionIdx}].newGroupInfo.pipelineDetails`
      ) || [];

    const currIdx = oldPipelineDetails.findIndex((obj) => {
      return (
        obj.action === pipelineActions.DELETED && obj.pipeline.value === e.value
      );
    });

    const updatedPipelineDetails = oldPipelineDetails
      .map((obj, i) => {
        return quoteActionPipelineIdx === i
          ? {
              ...obj,
              pipeline: e,
              status: null,
              action: pipelineActions.NEW,
            }
          : obj;
      })
      .filter((obj, i) => i !== currIdx);

    setValue(
      `quoteStatusActions[${quoteActionIdx}].newGroupInfo.pipelineDetails`,
      updatedPipelineDetails
    );
  };

  const handleStatusChange = (e) => {
    const oldPipelineDetails = getValues(
      `quoteStatusActions[${quoteActionIdx}].newGroupInfo.pipelineDetails`
    );
    const updatedPipelineDetails = oldPipelineDetails.map((h, i) => {
      const isNewStatus =
        (currentCustomer?.pipelineDetails || []).find(
          (pObj) => pObj?.pipeline?.id?._id === h.pipeline.id
        )?.status?.id !== e.id;

      const newAction =
        i === quoteActionPipelineIdx && !isNewItem
          ? isNewStatus
            ? pipelineActions.UPDATED
            : pipelineActions.KEEP_SAME
          : h.action;
      const newStatus = i === quoteActionPipelineIdx ? e : h.status;

      return { ...h, status: newStatus, action: newAction };
    });
    setValue(
      `quoteStatusActions[${quoteActionIdx}].newGroupInfo.pipelineDetails`,
      updatedPipelineDetails
    );
  };

  const handleRemove = async () => {
    const oldPipelineDetails = getValues(
      `quoteStatusActions[${quoteActionIdx}].newGroupInfo.pipelineDetails`
    );
    const updatedPipelineDetails = oldPipelineDetails.map((h, i) => {
      return i === quoteActionPipelineIdx
        ? { ...h, action: pipelineActions.DELETED }
        : h;
    });

    if (!isNewItem) {
      const result = await showWarnAlert({
        text: 'Are you sure you want to remove this pipeline?',
      });

      if (result.value) {
        setValue(
          `quoteStatusActions[${quoteActionIdx}].newGroupInfo.pipelineDetails`,
          updatedPipelineDetails
        );
      }
    } else {
      setValue(
        `quoteStatusActions[${quoteActionIdx}].newGroupInfo.pipelineDetails`,
        updatedPipelineDetails
      );
    }
  };

  return (
    !isDeletedItem && (
      <Col md='3' className='mb-2' key={item.id}>
        <div className='d-flex justify-content-between'>
          {!isNewItem ? (
            <div className='mb-3'>
              <span className='fw-bold text-primary h5x`'>
                Current Pipeline:{' '}
              </span>
              <div>{item?.pipeline?.label}</div>
            </div>
          ) : (
            <div className='mb-2'>
              <FormField
                name={`quoteStatusActions[${quoteActionIdx}].newGroupInfo.pipelineDetails[${quoteActionPipelineIdx}].pipeline`}
                label='Assign Pipeline'
                placeholder='Select Pipeline'
                type='select'
                control={control}
                options={pipelineOptions}
                onChange={handlePipelineChange}
              />
            </div>
          )}

          <X className='customizer-close' onClick={handleRemove}></X>
          {/* <X className='customizer-close' onClick={() => remove(item.id)}></X> */}
        </div>

        <FormField
          name={`quoteStatusActions[${quoteActionIdx}].newGroupInfo.pipelineDetails[${quoteActionPipelineIdx}].status`}
          label='Assign Stage'
          placeholder='Select Stage'
          type='select'
          control={control}
          options={stageOptions}
          onChange={handleStatusChange}
        />
      </Col>
    )
  );
};

export default QuoteActionItemPipeline;
