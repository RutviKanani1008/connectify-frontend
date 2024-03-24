import React from 'react';
import { X } from 'react-feather';
import { Col } from 'reactstrap';
import { FormField } from '../../../../../@core/components/form-fields';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { pipelineActions } from '../AddInvoice';

const InvoiceActionItemPipeline = ({
  item,
  invoiceActionIdx,
  invoiceActionPipelineIdx,
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
          `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails`
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
            `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails[${invoiceActionPipelineIdx}].pipeline`
          )?.id
        );
      })
      ?.stages?.map((s) => ({
        id: s._id,
        value: s.code,
        label: s.title,
      })) || [];

  const handlePipelineChange = (e) => {
    const oldPipelineDetails =
      getValues(
        `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails`
      ) || [];

    const currIdx = oldPipelineDetails.findIndex((obj) => {
      return (
        obj.action === pipelineActions.DELETED && obj.pipeline.value === e.value
      );
    });

    const updatedPipelineDetails = oldPipelineDetails
      .map((obj, i) => {
        return invoiceActionPipelineIdx === i
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
      `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails`,
      updatedPipelineDetails
    );
    setValue(
      `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails[${invoiceActionPipelineIdx}].status`,
      null
    );
  };

  const handleStatusChange = (e) => {
    const oldPipelineDetails = getValues(
      `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails`
    );
    const updatedPipelineDetails = oldPipelineDetails.map((h, i) => {
      const isNewStatus =
        (currentCustomer?.pipelineDetails || []).find(
          (pObj) => pObj?.pipeline?.id?._id === h.pipeline.id
        )?.status?.id !== e.id;

      const newAction =
        i === invoiceActionPipelineIdx && !isNewItem
          ? isNewStatus
            ? pipelineActions.UPDATED
            : pipelineActions.KEEP_SAME
          : h.action;
      const newStatus = i === invoiceActionPipelineIdx ? e : h.status;

      return { ...h, status: newStatus, action: newAction };
    });
    setValue(
      `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails`,
      updatedPipelineDetails
    );
  };

  const handleRemove = async () => {
    const oldPipelineDetails = getValues(
      `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails`
    );
    const updatedPipelineDetails = oldPipelineDetails.map((h, i) => {
      return i === invoiceActionPipelineIdx
        ? { ...h, action: pipelineActions.DELETED }
        : h;
    });

    if (!isNewItem) {
      const result = await showWarnAlert({
        text: 'Are you sure you want to remove this pipeline?',
      });

      if (result.value) {
        setValue(
          `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails`,
          updatedPipelineDetails
        );
      }
    }

    setValue(
      `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails`,
      updatedPipelineDetails
    );
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
                name={`invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails[${invoiceActionPipelineIdx}].pipeline`}
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
        </div>

        <FormField
          name={`invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails[${invoiceActionPipelineIdx}].status`}
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

export default InvoiceActionItemPipeline;
