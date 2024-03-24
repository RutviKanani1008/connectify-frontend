import { useState } from 'react';
import { useSelector } from 'react-redux';

import _ from 'lodash';

import { userData } from '../../../../../redux/user';
import { logger } from '../../../../../utility/Utils';
import { getCategory as getCategoryAPI } from '../../../../../api/category';

const useGetCategory = () => {
  // ** Hooks **
  const user = useSelector(userData);

  // ** States **
  const [stages, setStages] = useState([]);
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCategories = async ({ groupId }) => {
    try {
      setLoading(true);

      const { data: categoriesResponse } = await getCategoryAPI({
        company: user.company._id,
        groupId,
      });

      if (_.isArray(categoriesResponse?.data)) {
        const categoriesData = [
          {
            categoryName: 'Unassigned',
            categoryId: 'unassignedItem',
            _id: 'unassignedItem',
            position: 0,
            isNotDraggable: true,
          },
          ...(categoriesResponse?.data || []),
        ].sort((a, b) => a.position - b.position);

        setCategory(categoriesData);

        setStages([
          ...categoriesData.map((obj) => ({
            id: obj._id,
            total: 0,
            title: obj.categoryName,
            cards: [],
          })),
        ]);
      }
      setLoading(false);
    } catch (error) {
      logger(error);
      setLoading(false);
    }
  };

  return {
    category,
    setCategory,
    getCategories,
    stages,
    setStages,
    loading,
  };
};

export default useGetCategory;
