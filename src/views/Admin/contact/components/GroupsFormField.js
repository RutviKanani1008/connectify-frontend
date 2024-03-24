import { useEffect, useState } from 'react';
import { X } from 'react-feather';
import { useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { Button, Col, Row } from 'reactstrap';
import { FormField } from '../../../../@core/components/form-fields';
import { getGroupDetails, getGroups } from '../../../../api/groups';
import { GROUP_DROPDOWN_TYPE } from '../../../../constant';
import { userData } from '../../../../redux/user';
import { NoOptionsMessage } from '../../../forms/component/OptionComponent';
import { useCreateGroupData } from '../hooks/useCreateGroupData';

export const GroupsFormField = (props) => {
  const { setValue, watch, control, errors, showHeader = false } = props;
  const [dropdownList, SetDropdownList] = useState({
    group: [],
    status: [],
    category: [],
    tags: [],
    pipelineWithStages: [],
  });
  const currentGroup = watch(`group`);
  const pipelineDetailsWatch = watch('pipelineDetails');

  const user = useSelector(userData);
  const { fields, append, replace, remove } = useFieldArray({
    control,
    name: `pipelineDetails`,
    shouldUnregister: true,
  });

  const {
    createQuickGroup,
    createQuickStatus,
    createQuickCategory,
    createQuickTags,
    createQuickPipeline,
    createQuickPipelineStage,
  } = useCreateGroupData({
    SetDropdownList,
    setValue,
  });
  const handleGroupChange = async (value, type, index = null) => {
    let valuesClone = JSON.parse(JSON.stringify(value));
    if (type === GROUP_DROPDOWN_TYPE.tags) {
      const result = valuesClone.filter(
        ({ value: id1 }) =>
          !dropdownList.tags.some(({ value: id2 }) => id2 === id1)
      );
      valuesClone = result[0];
    }
    if (valuesClone?.__isNew__) {
      if (type === GROUP_DROPDOWN_TYPE.group) {
        const obj = {};
        obj.groupName = valuesClone.label;
        obj.company = user.company._id;
        obj.active = true;
        valuesClone = await createQuickGroup(obj);
      }
      if (type === GROUP_DROPDOWN_TYPE.status) {
        const obj = {};
        obj.statusName = valuesClone.label;
        obj.active = true;
        obj.company = user.company._id;
        obj.groupId = currentGroup.id;
        valuesClone = await createQuickStatus(obj);
      }
      if (type === GROUP_DROPDOWN_TYPE.category) {
        const obj = {};
        obj.categoryName = valuesClone.label;
        obj.active = true;
        obj.company = user.company._id;
        obj.groupId = currentGroup.id;

        valuesClone = await createQuickCategory(obj);
      }
      if (type === GROUP_DROPDOWN_TYPE.tags) {
        const obj = {};
        obj.tagName = valuesClone.label;
        obj.active = true;
        obj.company = user.company._id;
        obj.groupId = currentGroup.id;

        valuesClone = await createQuickTags(obj, value);
      }
      if (type === GROUP_DROPDOWN_TYPE.pipeline) {
        const obj = {};

        obj.pipelineName = valuesClone.label;
        obj.active = true;
        obj.company = user.company._id;
        obj.groupId = currentGroup.id;
        valuesClone = await createQuickPipeline(obj, index);
      }

      if (type === GROUP_DROPDOWN_TYPE.pipelineStage) {
        const currentStages =
          dropdownList.pipelineWithStages
            .find((p) => {
              return p._id === pipelineDetailsWatch[index]?.pipeline?.id;
            })
            ?.stages?.map((s) => ({
              _id: s._id,
              code: s.code,
              title: s.title,
              order: s.order,
            })) || [];
        const obj = {};

        obj.active = true;
        obj.stage = currentStages;
        obj.stage.push({
          title: valuesClone.label,
          code: valuesClone.label.replace(/ /g, '-').toLowerCase(),
          order: currentStages.length || 0,
        });
        valuesClone = await createQuickPipelineStage(
          pipelineDetailsWatch[index]?.pipeline?.id,
          obj,
          index,
          value
        );
      }
    }
    if (type === GROUP_DROPDOWN_TYPE.group) {
      if (valuesClone?.id) {
        getAndSetGroupRelatedValue(valuesClone.id);
      } else {
        SetDropdownList({
          group: [],
          status: [],
          category: [],
          tags: [],
          pipelineWithStages: [],
        });
      }
      setValue('category', null);
      setValue('status', null);
      setValue('tags', null);
      replace([]);
    }
  };

  const getAndSetGroupRelatedValue = async (id) => {
    const groupId = id;
    const latestGroupDetails = await getGroupDetails(groupId);
    const groupValues = latestGroupDetails?.data?.data;

    const statusListObj = [];
    if (groupValues?.status?.length > 0) {
      groupValues?.status?.forEach((status) => {
        const obj = {};
        obj.id = status._id;
        obj.value = status.statusCode;
        obj.label = status.statusName;

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

  // useEffect(() => {
  //   if (currentGroup) getAndSetGroupRelatedValue(currentGroup.id);
  // }, [currentGroup]);

  const loadGroups = async () => {
    const res = await getGroups({ company: user.company._id });
    if (res.data?.data) {
      const groupOptions = res.data.data
        .map((group) => {
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

  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <>
      <div className='scanned-contacts-wrapper'>
        {showHeader && currentGroup?.id && (
          <h3 className='title'>Organize above scanned contacts.</h3>
        )}
        <Row>
          <Col md='3' className='mb-1'>
            <FormField
              name={`group`}
              label='To Group'
              placeholder='Select Group'
              type='creatableselect'
              isClearable={true}
              control={control}
              errors={errors}
              options={dropdownList.group}
              onChange={(e) => handleGroupChange(e, GROUP_DROPDOWN_TYPE.group)}
            />
          </Col>

          <Col md='3' className='mb-1'>
            <FormField
              name={`status`}
              label='To Status'
              placeholder='Select Status'
              type='creatableselect'
              isClearable={true}
              control={control}
              errors={errors}
              options={dropdownList.status}
              styles={{
                noOptionsMessage: (base) => ({ ...base }),
              }}
              onChange={(e) => {
                if (!currentGroup?.id) {
                  setValue('status', null);
                } else {
                  handleGroupChange(e, GROUP_DROPDOWN_TYPE.status);
                }
              }}
              components={!currentGroup?.id && { NoOptionsMessage }}
            />
          </Col>
          <Col md='3' className='mb-1'>
            <FormField
              name={`category`}
              label='To Category'
              placeholder='Select Category'
              type='creatableselect'
              isClearable={true}
              control={control}
              errors={errors}
              options={dropdownList.category}
              styles={{
                noOptionsMessage: (base) => ({ ...base }),
              }}
              onChange={(e) => {
                if (!currentGroup?.id) {
                  setValue('category', null);
                } else {
                  handleGroupChange(e, GROUP_DROPDOWN_TYPE.category);
                }
              }}
              components={!currentGroup?.id && { NoOptionsMessage }}
            />
          </Col>

          <Col md='3' className='mb-1'>
            <FormField
              name={`tags`}
              label='To Tags'
              placeholder='Select Tags'
              type='creatableselect'
              isClearable={true}
              control={control}
              errors={errors}
              isMulti={'true'}
              options={dropdownList.tags}
              styles={{
                noOptionsMessage: (base) => ({ ...base }),
              }}
              onChange={(e) => {
                if (!currentGroup?.id) {
                  setValue('tags', []);
                } else {
                  handleGroupChange(e, GROUP_DROPDOWN_TYPE.tags);
                }
              }}
              components={!currentGroup?.id && { NoOptionsMessage }}
            />
          </Col>
        </Row>
      </div>
      <div className='pipelines-sec'>
        <h3 className='pipline-title'>To Pipelines</h3>
        <Row className='pipline-row'>
          {fields.map((item, itemIdx) => {
            return (
              <>
                <Col md='3' className='pipline-col' key={item.id}>
                  <div className='inner-wrapper'>
                    <div className='field-wrapper'>
                      <FormField
                        name={`pipelineDetails[${itemIdx}].pipeline`}
                        label='To Pipeline'
                        placeholder='Select Pipeline'
                        type='creatableselect'
                        isClearable={true}
                        control={control}
                        options={dropdownList.pipelineWithStages
                          ?.map((p) => ({
                            id: p._id,
                            value: p.pipelineCode,
                            label: p.pipelineName,
                          }))
                          ?.filter((p) => {
                            const oldSelected = !pipelineDetailsWatch
                              .map((p) => p?.pipeline?.value)
                              .includes(p?.value);

                            return oldSelected;
                          })}
                        styles={{
                          noOptionsMessage: (base) => ({ ...base }),
                        }}
                        onChange={(e) => {
                          if (!currentGroup?.id) {
                            setValue('pipelineDetails', []);
                          } else {
                            handleGroupChange(
                              e,
                              GROUP_DROPDOWN_TYPE.pipeline,
                              itemIdx
                            );
                          }
                        }}
                        components={!currentGroup?.id && { NoOptionsMessage }}
                      />
                    </div>
                    <div className='field-wrapper'>
                      <FormField
                        name={`pipelineDetails[${itemIdx}].status`}
                        label='To Stage'
                        placeholder='Select Stage'
                        type='creatableselect'
                        isClearable={true}
                        control={control}
                        options={
                          dropdownList.pipelineWithStages
                            ?.find((p) => {
                              return (
                                p._id ===
                                pipelineDetailsWatch[itemIdx]?.pipeline?.id
                              );
                            })
                            ?.stages?.map((s) => ({
                              id: s._id,
                              value: s.code,
                              label: s.title,
                            })) || []
                        }
                        onChange={(e) => {
                          if (
                            !currentGroup?.id &&
                            !pipelineDetailsWatch[itemIdx]?.pipeline?.id
                          ) {
                            setValue(
                              `pipelineDetails[${itemIdx}].status`,
                              null
                            );
                          } else {
                            handleGroupChange(
                              e,
                              GROUP_DROPDOWN_TYPE.pipelineStage,
                              itemIdx
                            );
                          }
                        }}
                        styles={{
                          noOptionsMessage: (base) => ({ ...base }),
                        }}
                        components={!currentGroup?.id && { NoOptionsMessage }}
                      />
                    </div>
                    <div className='close-btn' onClick={() => remove(itemIdx)}>
                      <X className='customizer-close cursor-pointer'></X>
                    </div>
                  </div>
                </Col>
              </>
            );
          })}

          <Col md='12'>
            <Button
              color='primary'
              onClick={() =>
                append({
                  pipeline: null,
                  status: null,
                })
              }
              // disabled={addPipelineDisabled}
              disabled={!currentGroup?.id}
            >
              + Add Pipeline
            </Button>
          </Col>
        </Row>
      </div>
    </>
  );
};
