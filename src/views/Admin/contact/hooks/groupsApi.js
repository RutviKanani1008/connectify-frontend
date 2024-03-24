import { usePostApi, usePutApi } from '../../../../hooks/useApi';

const APIS = {
  group: '/group',
  status: '/status',
  category: '/category',
  tags: '/tags',
  pipeline: '/pipeline',
  updateStage: '/update-stage',
};

export const useCreateGroup = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createGroup = (group, loadingMsg) =>
    apiCall(`${APIS.group}`, group, loadingMsg);

  return { createGroup, isLoading, isSuccess, isError };
};

export const useCreateStatus = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createStatus = (status, loadingMsg) =>
    apiCall(`${APIS.status}`, status, loadingMsg);

  return { createStatus, isLoading, isSuccess, isError };
};

export const useCreateCategory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createCategory = (category, loadingMsg) =>
    apiCall(`${APIS.category}`, category, loadingMsg);

  return { createCategory, isLoading, isSuccess, isError };
};

export const useCreateTags = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createTags = (tags, loadingMsg) =>
    apiCall(`${APIS.tags}`, tags, loadingMsg);

  return { createTags, isLoading, isSuccess, isError };
};

export const useCreatePipeline = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createPipeline = (pipeline, loadingMsg) =>
    apiCall(`${APIS.pipeline}`, pipeline, loadingMsg);

  return { createPipeline, isLoading, isSuccess, isError };
};

export const useCreatePipelineStage = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const createPipelineStage = (id, pipelineStage, loadingMsg) =>
    apiCall(`${APIS.updateStage}/${id}`, pipelineStage, loadingMsg);

  return { createPipelineStage, isLoading, isSuccess, isError };
};
