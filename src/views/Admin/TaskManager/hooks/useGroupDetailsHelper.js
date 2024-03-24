/* eslint-disable no-unused-vars */
export const useSetGroupRelatedValue = ({ setFilterValue, filterValue }) => {
  const setGroupRelatedValue = (groupValues) => {
    const statusObj = [
      {
        id: 'UnassignedItem',
        value: 'Unassigned',
        label: 'Unassigned',
      },
    ];
    if (groupValues?.status?.length) {
      groupValues?.status?.forEach((status) => {
        const obj = {};
        obj.id = status._id;
        obj.value = status.statusCode;
        obj.label = status.statusName;
        statusObj.push(obj);
      });
    }
    const categoryObj = [
      {
        id: 'UnassignedItem',
        value: 'Unassigned',
        label: 'Unassigned',
      },
    ];
    if (groupValues?.category) {
      groupValues?.category?.forEach((category) => {
        const obj = {};
        obj.id = category._id;
        obj.value = category.categoryId;
        obj.label = category.categoryName;
        categoryObj.push(obj);
      });
    }
    const tagObj = [
      {
        id: 'UnassignedItem',
        value: 'Unassigned',
        label: 'Unassigned',
      },
    ];
    if (groupValues?.tags) {
      groupValues?.tags?.forEach((tag) => {
        const obj = {};
        obj.id = tag._id;
        obj.value = tag.tagId;
        obj.label = tag.tagName;
        tagObj.push(obj);
      });
    }
    const pipelineObj = [
      {
        id: 'UnassignedItem',
        value: 'Unassigned',
        label: 'Unassigned',
      },
    ];
    if (groupValues?.pipeline) {
      groupValues?.pipeline?.forEach((pipeline) => {
        const obj = {};
        obj.id = pipeline._id;
        obj.value = pipeline.pipelineCode;
        obj.label = pipeline.pipelineName;
        obj.stages = pipeline.stages.map((stage) => {
          return { label: stage.title, value: stage.code, id: stage._id };
        });
        pipelineObj.push(obj);
      });
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
