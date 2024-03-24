// ==================== Packages =======================
import React, { useState, useEffect } from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useSelector } from 'react-redux';
import { useFieldArray } from 'react-hook-form';
// ====================================================
import { userData } from '../../../../../redux/user';
import { getGroupDetails, getGroups } from '../../../../../api/groups';

import { FormField } from '../../../../../@core/components/form-fields';
import CustomSelect from '../../../../../@core/components/form-fields/CustomSelect';
import InvoiceActionItemPipeline from './InvoiceActionItemPipeline';
import { pipelineActions } from '../AddInvoice';
import { paymentStatus } from '../../../../../constant';

const InvoiceStatus = ['draft', 'pending', 'paid', 'cancelled', 'expired'];
const invoiceStatusOptions = InvoiceStatus.map((q) => ({
  label: paymentStatus[q],
  value: q,
}));

const InvoiceActionItem = ({
  watch,
  control,
  getValues,
  setValue,
  invoiceActionIdx,
  currentCustomer,
  initialInvoiceActions,
}) => {
  // ========================== Hooks ================================
  const user = useSelector(userData);

  const { fields, append, replace } = useFieldArray({
    control,
    name: `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails`,
    shouldUnregister: true,
  });

  // ========================== states ================================
  const [dropdownList, SetDropdownList] = useState({
    group: [],
    status: [],
    category: [],
    tags: [],
    pipelineWithStages: [],
  });

  const currentGroup = watch(
    `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.group`
  );

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (currentGroup) getAndSetGroupRelatedValue(currentGroup.id);
  }, [currentGroup]);

  /* Add Pipeline BTN Disabled */
  const addPipelineDisabled = !dropdownList.pipelineWithStages
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
    }).length;
  /* */

  const loadGroups = async () => {
    const res = await getGroups({ company: user.company._id });
    if (res.data?.data) {
      const groupOptions = res.data.data
        .map((group) => {
          if (currentCustomer?.group?.id?._id === group._id) {
            const selectedGroup = {
              id: null,
              label: 'Keep the Same',
              value: null,
              keepSame: true,
            };
            return selectedGroup;
          }

          return {
            id: group._id,
            label: group.groupName,
            value: group.groupCode,
          };
        })
        .sort((group) => (group.keepSame ? -1 : 1));

      SetDropdownList((prev) => ({ ...prev, group: groupOptions }));
    }
  };

  const getAndSetGroupRelatedValue = async (id) => {
    let groupId = id;

    if (!id) {
      groupId = currentCustomer?.group?.id?._id;
    }

    const latestGroupDetails = await getGroupDetails(groupId);
    const groupValues = latestGroupDetails?.data?.data;

    const statusListObj = [];
    if (groupValues?.status?.length > 0) {
      groupValues?.status?.forEach((status) => {
        const obj = {};
        obj.id = status._id;
        obj.value = status.statusCode;
        obj.label = status.statusName;

        if (currentCustomer?.status?.id?._id === status._id) {
          obj.id = null;
          obj.label = 'Keep the Same';
          obj.value = null;
          obj.keepSame = true;
        }

        statusListObj.push(obj);
        statusListObj.sort((a) => (a.keepSame ? -1 : 1));
      });
    }

    const categoryListObj = [];
    if (groupValues?.category?.length > 0) {
      groupValues?.category?.forEach((category) => {
        const obj = {};
        obj.id = category._id;
        obj.value = category.categoryId;
        obj.label = category.categoryName;

        if (currentCustomer?.category?.id?._id === category._id) {
          obj.id = null;
          obj.label = 'Keep the Same';
          obj.value = null;
          obj.keepSame = true;
        }

        categoryListObj.push(obj);
        categoryListObj.sort((a) => (a.keepSame ? -1 : 1));
      });
    }

    const tagsListObj = [];
    if (groupValues?.tags.length > 0) {
      groupValues?.tags?.forEach((tag) => {
        const obj = {};
        obj.id = tag._id;
        obj.value = tag.tagId;
        obj.label = tag.tagName;
        tagsListObj.push(obj);
      });
    }

    SetDropdownList((prev) => ({
      ...prev,
      status: statusListObj,
      category: categoryListObj,
      tags: tagsListObj,
      pipelineWithStages: groupValues?.pipeline,
    }));
  };

  const handleGroupChange = (group) => {
    setValue(`invoiceStatusActions[${invoiceActionIdx}].newGroupInfo`, {
      group,
      category: null,
      status: null,
      tags: null,
    });
    replace([{ pipeline: null, status: null, action: pipelineActions.NEW }]);
  };

  const resetActionPoints = () => {
    if (initialInvoiceActions[invoiceActionIdx]) {
      const initialGroupInfo =
        initialInvoiceActions[invoiceActionIdx].newGroupInfo;
      setValue(
        `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.group`,
        initialGroupInfo.group
      );
      setValue(
        `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.status`,
        initialGroupInfo.status
      );
      setValue(
        `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.category`,
        initialGroupInfo.category
      );
      setValue(
        `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.tags`,
        initialGroupInfo.tags
      );
      setValue(
        `invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.pipelineDetails`,
        initialGroupInfo.pipelineDetails
      );
    }
  };

  return (
    <div>
      <div className='d-flex justify-content-between'>
        <div className='d-flex align-items-center'>
          <div>
            <span className='me-1'>If Invoice Status is </span>
          </div>
          <div>
            <CustomSelect
              label=''
              name={`invoiceStatusActions[${invoiceActionIdx}].status`}
              classNamePrefix='group-select-border'
              defaultValue={invoiceStatusOptions.find(
                (q) =>
                  q.value ===
                  getValues(`invoiceStatusActions[${invoiceActionIdx}].status`)
              )}
              onChange={(e) => {
                setValue(
                  `invoiceStatusActions[${invoiceActionIdx}].status`,
                  e.value
                );
              }}
              options={invoiceStatusOptions}
            />
          </div>
          <div>
            <span className='ms-1 me-1'>set contact to</span>
          </div>
        </div>
        <div>
          <Button onClick={resetActionPoints}>Reset Changes</Button>
        </div>
      </div>
      <div className='mt-4'>
        <Row>
          <Col md='3' className='mb-2'>
            <div className='mb-1'>
              <span className='fw-bold text-primary h5x`'>Current Group: </span>
              <div>{currentCustomer?.group?.id?.groupName || '-'}</div>
            </div>
            <FormField
              name={`invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.group`}
              label='Assign Group'
              placeholder='Select Group'
              type='select'
              control={control}
              options={dropdownList.group}
              onChange={handleGroupChange}
            />
          </Col>

          <Col md='3' className='mb-2'>
            <div className='mb-1'>
              <span className='text-primary fw-bold h5 mb-1'>
                Current Status:
              </span>
              <div>{currentCustomer?.status?.id?.statusName || '-'}</div>
            </div>
            <FormField
              name={`invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.status`}
              label='Assign Status'
              placeholder='Select Status'
              type='select'
              control={control}
              options={dropdownList.status}
            />
          </Col>
          <Col md='3' className='mb-2'>
            <div className='mb-1'>
              <span className='text-primary fw-bold h5 mb-1'>
                Current Category:
              </span>
              <div>{currentCustomer?.category?.id?.categoryName || '-'}</div>
            </div>
            <FormField
              name={`invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.category`}
              label='Assign Category'
              placeholder='Select Category'
              type='select'
              control={control}
              options={dropdownList.category}
            />
          </Col>

          <Col md='3' className='mb-2'>
            <div className='mb-1'>
              <span className='text-primary fw-bold h5 mb-1'>
                Current Tags:
              </span>
              <div>
                {currentCustomer?.tags?.map((t) => t.tagName).join('-') || '-'}
              </div>
            </div>
            <FormField
              name={`invoiceStatusActions[${invoiceActionIdx}].newGroupInfo.tags`}
              label='Assign Tags'
              placeholder='Select Tags'
              type='select'
              control={control}
              isMulti={'true'}
              options={dropdownList.tags}
            />
          </Col>
        </Row>

        <Row className='my-1'>
          <h3 className='text-primary'>Pipelines</h3>
        </Row>

        <Row>
          {fields.map((item, itemIdx) => {
            return (
              <InvoiceActionItemPipeline
                key={item.id}
                item={item}
                currentCustomer={currentCustomer}
                invoiceActionIdx={invoiceActionIdx}
                invoiceActionPipelineIdx={itemIdx}
                dropdownList={dropdownList}
                control={control}
                getValues={getValues}
                setValue={setValue}
              />
            );
          })}

          <Col md='3'>
            <Button
              color='primary'
              size='sm'
              onClick={() =>
                append({
                  pipeline: null,
                  status: null,
                  action: pipelineActions.NEW,
                })
              }
              disabled={addPipelineDisabled}
            >
              + Add Pipeline
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default InvoiceActionItem;
