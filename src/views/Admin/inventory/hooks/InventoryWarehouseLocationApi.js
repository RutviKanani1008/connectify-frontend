// ==================== Packages =======================
import { useState } from 'react';
import { useDeleteApi, useGetApi, usePostApi, usePutApi } from '../../../../hooks/useApi';
// ====================================================


const APIS = {
  location: '/inventory/warehouse-location',
};

export const useGetLocations = () => {
  const [locations, setLocations] = useState([]);
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getLocations = async (query = {}) => {
    const { data, error } = await apiCall(`${APIS.location}/all`, {
      params: query,
    });
    if (data && !error) {
      setLocations(data);
    }
  };

  return {
    getLocations,
    isLoading,
    isSuccess,
    isError,
    locations,
    setLocations,
  };
};

export const useCheckLocationIsExist = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const checkLocationIsExist = (query) =>
    apiCall(`${APIS.location}/is-exist`, { params: query });

  return { checkLocationIsExist, isLoading, isSuccess, isError };
};

export const useGetLocation = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getLocation = (id) => apiCall(`${APIS.location}/${id}`);

  return { getLocation, isLoading, isSuccess, isError };
};

export const useCreateLocation = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createLocation = (locationData, loadingMsg) =>
    apiCall(`${APIS.location}`, locationData, loadingMsg);

  return { createLocation, isLoading, isSuccess, isError };
};

export const useUpdateLocation = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateLocation = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.location}/${id}`, updateData, loadingMsg);

  return { updateLocation, isLoading, isSuccess, isError };
};

export const useDeleteLocation = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteLocation = (id, loadingMsg) =>
    apiCall(`${APIS.location}/${id}`, loadingMsg);

  return { deleteLocation, isLoading, isSuccess, isError };
};
