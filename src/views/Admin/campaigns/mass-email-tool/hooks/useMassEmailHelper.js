// ==================== Packages =======================
import { useState } from 'react';
import { getGroupDetails } from '../../../../../api/groups';
// ====================================================
// import { getGroupDetails } from '../../../../../api/groups';
import _ from 'lodash';
import { unAssignedItemExists } from '../../../../../helper/common.helper';

export const useSetGroupRelatedValue = ({ setFilterValue, filterValue }) => {
  const setGroupRelatedValue = (
    groupValues,
    persistFilters = false,
    groupOptions = false,
    { groupLabel, groupId } = { groupId: undefined, groupLabel: undefined }
  ) => {
    // status options
    const statusObj = [
      ...(unAssignedItemExists(filterValue.status) || !persistFilters
        ? [
            {
              id: 'UnassignedItem',
              value: 'Unassigned',
              label: 'Unassigned',
            },
          ]
        : []),
      ...(persistFilters ? filterValue.status : []),
    ];
    if (groupValues?.status) {
      if (groupOptions) {
        const obj = {};
        obj.label = groupLabel;
        obj.groupId = groupId;
        obj.options = [];
        groupValues?.status?.forEach((status) => {
          const subObj = {};
          subObj.id = status._id;
          subObj.value = status.statusId;
          subObj.label = status.statusName;
          subObj.groupId = status.groupId;
          obj.options.push(subObj);
        });
        statusObj.push(obj);
      } else {
        groupValues?.status?.forEach((status) => {
          const obj = {};
          obj.id = status._id;
          obj.value = status.statusId;
          obj.label = status.statusName;
          obj.groupId = status.groupId;
          statusObj.push(obj);
        });
      }
    }

    // category options
    const categoryObj = [
      ...(unAssignedItemExists(filterValue.category) || !persistFilters
        ? [
            {
              id: 'UnassignedItem',
              value: 'Unassigned',
              label: 'Unassigned',
            },
          ]
        : []),
      ...(persistFilters ? filterValue.category : []),
    ];
    if (groupValues?.category) {
      if (groupOptions) {
        const obj = {};
        obj.label = groupLabel;
        obj.groupId = groupId;
        obj.options = [];
        groupValues?.category?.forEach((category) => {
          const subObj = {};
          subObj.id = category._id;
          subObj.value = category.categoryId;
          subObj.label = category.categoryName;
          subObj.groupId = category.groupId;
          obj.options.push(subObj);
        });
        categoryObj.push(obj);
      } else {
        groupValues?.category?.forEach((category) => {
          const obj = {};
          obj.id = category._id;
          obj.value = category.categoryId;
          obj.label = category.categoryName;
          obj.groupId = category.groupId;
          categoryObj.push(obj);
        });
      }
    }

    // tag options
    const tagObj = [
      ...(unAssignedItemExists(filterValue.tags) || !persistFilters
        ? [
            {
              id: 'UnassignedItem',
              value: 'Unassigned',
              label: 'Unassigned',
            },
          ]
        : []),
      ...(persistFilters ? filterValue.tags : []),
    ];
    if (groupValues?.tags) {
      if (groupOptions) {
        const obj = {};
        obj.label = groupLabel;
        obj.groupId = groupId;
        obj.options = [];
        groupValues?.tags?.forEach((tag) => {
          const subObj = {};
          subObj.id = tag._id;
          subObj.value = tag.tagId;
          subObj.label = tag.tagName;
          subObj.groupId = tag.groupId;
          obj.options.push(subObj);
        });
        tagObj.push(obj);
      } else {
        groupValues?.tags?.forEach((tag) => {
          const obj = {};
          obj.id = tag._id;
          obj.value = tag.tagId;
          obj.label = tag.tagName;
          obj.groupId = tag.groupId;
          tagObj.push(obj);
        });
      }
    }

    // pipeline options
    const pipelineObj = [
      ...(unAssignedItemExists(filterValue.pipeline) || !persistFilters
        ? [
            {
              id: 'UnassignedItem',
              value: 'Unassigned',
              label: 'Unassigned',
            },
          ]
        : []),
      ...(persistFilters ? filterValue.pipeline : []),
    ];
    if (groupValues?.pipeline) {
      if (groupOptions) {
        const obj = {};
        obj.label = groupLabel;
        obj.groupId = groupId;
        obj.options = [];
        groupValues?.pipeline?.forEach((pipeline) => {
          const subObj = {};
          subObj.id = pipeline._id;
          subObj.value = pipeline._id;
          subObj.label = pipeline.pipelineName;
          subObj.groupId = pipeline.groupId;
          subObj.stages = pipeline.stages.map((stage) => {
            return {
              id: stage._id,
              value: stage._id,
              label: stage.title,
              groupId: pipeline.groupId,
              pipelineId: pipeline._id,
            };
          });
          obj.options.push(subObj);
        });
        pipelineObj.push(obj);
      } else {
        groupValues?.pipeline?.forEach((pipeline) => {
          const obj = {};
          obj.id = pipeline._id;
          obj.value = pipeline.pipelineId;
          obj.label = pipeline.pipelineName;
          obj.groupId = pipeline.groupId;
          pipelineObj.push(obj);
        });
      }
    }
    setFilterValue({
      ...filterValue,
      status: statusObj,
      category: categoryObj,
      tags: tagObj,
      pipeline: pipelineObj,
    });
  };

  return { setGroupRelatedValue };
};

const useMassEmailHelper = ({
  filterValue,
  setFilterValue,
  // availableContacts,
  // setFilterContacts,
  unAssignFilter,
}) => {
  // ============================== states ============================
  const [currentFilter, setCurrentFilter] = useState({
    group: [],
    status: null,
    category: null,
    tags: null,
    pipeline: null,
    stage: null,
    page: 1,
    search: '',
  });

  // ========================== Custom Hooks =========================
  const { setGroupRelatedValue } = useSetGroupRelatedValue({
    setFilterValue,
    filterValue,
  });

  const handleChangeFilter = (e, type) => {
    if (type === 'group') {
      setFilterValue({
        ...filterValue,
        status: [unAssignFilter],
        category: [unAssignFilter],
        tags: [unAssignFilter],
        pipeline: [unAssignFilter],
        stage: false,
      });
      setCurrentFilter({
        ...currentFilter,
        page: 1,
        group: e?.map((el) => el.id) || null,
        status: null,
        category: null,
        tags: null,
        pipeline: null,
        stage: null,
      });
      if (e !== null && e.length) {
        const removedGroup = _.difference(
          currentFilter.group,
          e.map((el) => el.id)
        );
        const addedGroup = e[e.length - 1];
        if (removedGroup.length) removeGroupRelatedDetails(removedGroup[0]);
        else if (addedGroup?.id !== 'UnassignedItem') {
          getGroupRelatedDetails(addedGroup?.id, addedGroup.label);
        }
      }
    }
    if (type === 'status') {
      setCurrentFilter({ ...currentFilter, page: 1, status: e?.id || null });
    }
    if (type === 'category') {
      setCurrentFilter({ ...currentFilter, page: 1, category: e?.id || null });
    }
    if (type === 'tags') {
      setCurrentFilter({
        ...currentFilter,
        page: 1,
        tags: e?.id ? [e.id] : null,
      });
    }
    if (type === 'pipeline') {
      setCurrentFilter({
        ...currentFilter,
        page: 1,
        pipeline: { id: e?.id, stages: e?.stages } || null,
        stage: null,
      });
    }
    if (type === 'stage') {
      setCurrentFilter({ ...currentFilter, page: 1, stage: e?.id || null });
    }
  };

  const getGroupRelatedDetails = (id, groupLabel) => {
    getGroupDetails(id).then((res) => {
      if (res.data.data) {
        setGroupRelatedValue(res.data.data, true, true, {
          groupLabel,
          groupId: id,
        });
      }
    });
  };

  const removeGroupRelatedDetails = (id) => {
    setFilterValue({
      ...filterValue,
      status: filterValue.status.filter((el) => el.groupId !== id),
      category: filterValue.category.filter((el) => el.groupId !== id),
      tags: filterValue.tags.filter((el) => el.groupId !== id),
      pipeline: filterValue.pipeline.filter((el) => el.groupId !== id),
    });
    setCurrentFilter({
      ...currentFilter,
      group: currentFilter.group.filter((el) => el !== id),
      status: null,
      category: null,
      tags: null,
      pipeline: null,
      stage: null,
    });
  };

  return {
    // filterContactValue,
    handleChangeFilter,
    currentFilter,
    setCurrentFilter,
  };
};

export default useMassEmailHelper;
