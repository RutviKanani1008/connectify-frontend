import {
  useDeleteApi,
  useGetApi,
  usePostApi,
  usePutApi,
} from '../../../../hooks/useApi';

const APIS = {
  featureRequests: '/feature-requests',
  reportProblems: '/report-problems',
  reportFeatureComments: '/report-feature-comments',
};

export const useGetFeatureRequests = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getFeatureRequests = (params, loadingMsg) =>
    apiCall(`${APIS.featureRequests}`, { params }, loadingMsg);

  return { getFeatureRequests, isLoading, isSuccess, isError };
};

export const useGetFeatureRequestById = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getFeatureRequestById = (id, params) =>
    apiCall(`${APIS.featureRequests}/${id}`, { params });

  return { getFeatureRequestById, isLoading, isSuccess, isError };
};

export const useUpdateFeatureRequest = () => {
  const [apiCall, { isLoading, isError }] = usePutApi();
  const updateFeatureRequest = async (id, data, toast = true) => {
    return apiCall(
      `${APIS.featureRequests}/${id}`,
      data,
      toast && 'Update Status...'
    );
  };
  return {
    updateFeatureRequest,
    isLoading,
    isError,
  };
};

export const useDeleteFeatureRequest = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteFeatureRequest = (id, loadingMsg) =>
    apiCall(`${APIS.featureRequests}/${id}`, loadingMsg);

  return { deleteFeatureRequest, isLoading, isSuccess, isError };
};

export const useReadNewFeatureRequests = () => {
  const [apiCall, { isLoading, isError }] = usePutApi();
  const readNewFeatureRequests = async (data) => {
    return apiCall(`${APIS.featureRequests}/read-new`, data);
  };
  return {
    readNewFeatureRequests,
    isLoading,
    isError,
  };
};

export const useGetReportProblems = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getReportProblems = (params, loadingMsg) =>
    apiCall(`${APIS.reportProblems}`, { params }, loadingMsg);

  return { getReportProblems, isLoading, isSuccess, isError };
};

export const useGetReportProblemById = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getReportProblemById = (id, params) =>
    apiCall(`${APIS.reportProblems}/${id}`, { params });

  return { getReportProblemById, isLoading, isSuccess, isError };
};

export const useUpdateReportProblem = () => {
  const [apiCall, { isLoading, isError }] = usePutApi();
  const updateReportProblem = async (id, data, toast = true) => {
    return apiCall(
      `${APIS.reportProblems}/${id}`,
      data,
      toast && 'Update Status...'
    );
  };
  return {
    updateReportProblem,
    isLoading,
    isError,
  };
};

export const useDeleteReportProblem = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteReportProblem = (id, loadingMsg) =>
    apiCall(`${APIS.reportProblems}/${id}`, loadingMsg);

  return { deleteReportProblem, isLoading, isSuccess, isError };
};

export const useReadNewReportProblems = () => {
  const [apiCall, { isLoading, isError }] = usePutApi();
  const readNewReportProblems = async (data) => {
    return apiCall(`${APIS.reportProblems}/read-new`, data);
  };
  return {
    readNewReportProblems,
    isLoading,
    isError,
  };
};

export const useAddReportFeatureComment = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createReportFeatureComment = (id, data) =>
    apiCall(`${APIS.reportFeatureComments}/${id}`, data);

  return { createReportFeatureComment, isLoading, isSuccess, isError };
};

export const useGetAllReportFeatureComments = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getReportFeatureCommentsById = (id, params) =>
    apiCall(`${APIS.reportFeatureComments}/${id}`, { params });

  return { getReportFeatureCommentsById, isLoading, isSuccess, isError };
};
