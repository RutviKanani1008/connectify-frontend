// ==================== Packages =======================
import { useState } from 'react';
// ====================================================
import {
  useGetApi,
  usePostApi,
  usePutApi,
  useDeleteApi,
} from '../../../../../hooks/useApi';

const APIS = {
  category: '/product-category',
};

export const useGetCategories = () => {
  const [productCategories, setProductCategories] = useState([]);
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCategories = async (query = {}) => {
    const { data, error } = await apiCall(`${APIS.category}/all`, {
      params: query,
    });
    if (data && !error) {
      setProductCategories(data);
    }
  };

  return {
    getCategories,
    isLoading,
    isSuccess,
    isError,
    productCategories,
    setProductCategories,
  };
};

export const useCheckCategoryIsExist = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const checkCategoryIsExist = (query) =>
    apiCall(`${APIS.category}/is-exist`, { params: query });

  return { checkCategoryIsExist, isLoading, isSuccess, isError };
};

export const useGetCategory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCategory = (id) => apiCall(`${APIS.category}/${id}`);

  return { getCategory, isLoading, isSuccess, isError };
};

export const useCreateCategory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const createCategory = (productData, loadingMsg) =>
    apiCall(`${APIS.category}`, productData, loadingMsg);

  return { createCategory, isLoading, isSuccess, isError };
};

export const useUpdateCategory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateCategory = (id, updateData, loadingMsg) =>
    apiCall(`${APIS.category}/${id}`, updateData, loadingMsg);

  return { updateCategory, isLoading, isSuccess, isError };
};

export const useDeleteCategory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteCategory = (id, loadingMsg) =>
    apiCall(`${APIS.category}/${id}`, loadingMsg);

  return { deleteCategory, isLoading, isSuccess, isError };
};
