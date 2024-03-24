import {
  useCreateCategory,
  useCreateGroup,
  useCreatePipeline,
  useCreatePipelineStage,
  useCreateStatus,
  useCreateTags,
} from './groupsApi';

export const useCreateGroupData = ({ SetDropdownList, setValue }) => {
  const { createGroup } = useCreateGroup();
  const { createStatus } = useCreateStatus();
  const { createCategory } = useCreateCategory();
  const { createTags } = useCreateTags();
  const { createPipeline } = useCreatePipeline();
  const { createPipelineStage } = useCreatePipelineStage();
  const createQuickGroup = async (obj) => {
    const { data, error } = await createGroup(obj);
    if (!error) {
      const valuesClone = {
        id: data?._id,
        label: data?.groupName,
        value: data?.groupCode,
      };
      SetDropdownList((prev) => ({
        ...prev,
        group: [...prev.group, valuesClone],
      }));
      setValue('group', valuesClone);
      return valuesClone;
    }
  };

  const createQuickStatus = async (obj) => {
    const { data, error } = await createStatus(obj);
    if (!error) {
      const valuesClone = {
        id: data?._id,
        label: data?.statusName,
        value: data?.statusCode,
      };
      SetDropdownList((prev) => ({
        ...prev,
        status: [...prev.status, valuesClone],
      }));
      setValue('status', valuesClone);
      return valuesClone;
    }
  };

  const createQuickCategory = async (obj) => {
    const { data, error } = await createCategory(obj);
    if (!error) {
      const valuesClone = {
        id: data?._id,
        label: data?.categoryName,
        value: data?.categoryId,
      };
      SetDropdownList((prev) => ({
        ...prev,
        category: [...prev.category, valuesClone],
      }));
      setValue('category', valuesClone);
      return valuesClone;
    }
  };

  const createQuickTags = async (obj, value) => {
    const { data, error } = await createTags(obj);
    if (!error) {
      const valuesClone = {
        id: data?._id,
        label: data?.tagName,
        value: data?.tagId,
      };
      const tempTags = JSON.parse(JSON.stringify(value));
      if (tempTags?.length) {
        tempTags?.map((tag) => {
          if (tag.value === valuesClone.label) {
            tag.id = valuesClone.id;
            tag.label = data?.tagName;
            tag.value = data?.tagId;
            delete tag.__isNew__;
          }
        });
      }
      SetDropdownList((prev) => ({
        ...prev,
        tags: [...prev?.tags, valuesClone],
      }));
      setValue('tags', tempTags);
      return valuesClone;
    }
  };

  const createQuickPipeline = async (obj, index) => {
    const { data, error } = await createPipeline(obj);
    if (!error) {
      const valuesClone = {
        id: data?._id,
        label: data?.pipelineName,
        value: data?.pipelineCode,
      };
      SetDropdownList((prev) => ({
        ...prev,
        pipelineWithStages: [...prev.pipelineWithStages, data],
      }));
      setValue(`pipelineDetails[${index}].pipeline`, valuesClone);
      return data;
    }
  };

  const createQuickPipelineStage = async (id, obj, index, value) => {
    const { data, error } = await createPipelineStage(id, obj);
    if (!error) {
      SetDropdownList((prev) => ({
        ...prev,
        pipelineWithStages: [
          ...prev.pipelineWithStages?.map((pipeline) => {
            if (String(pipeline._id) === String(id)) {
              pipeline.stages = data;
            }
            return pipeline;
          }),
        ],
      }));
      const currentStage = data?.find((stage) => stage.title === value.label);
      setValue(`pipelineDetails[${index}].status`, {
        id: currentStage._id,
        label: currentStage?.title,
        value: currentStage?.code,
      });
      return data;
    }
  };

  return {
    createQuickGroup,
    createQuickStatus,
    createQuickCategory,
    createQuickTags,
    createQuickPipeline,
    createQuickPipelineStage,
  };
};
