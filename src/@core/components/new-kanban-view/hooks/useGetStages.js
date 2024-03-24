import { useState } from 'react';
import _ from 'lodash';
import { getStatus as getStatusAPI } from '../../../../api/status';
import { logger } from '../../../../utility/Utils';
import { getCategory } from '../../../../api/category';
// import { setModuleData } from '../../../../redux/pipeline';
// import { useDispatch } from 'react-redux';

const useGetStages = ({ user, setStages, moduleKey }) => {
  // ** Redux **
  // const dispatch = useDispatch();

  // ** States **
  const [moduleData, setModuleData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStages = async ({ groupId }) => {
    try {
      setLoading(true);

      switch (moduleKey) {
        case 'status': {
          const { data: statusResponse } = await getStatusAPI({
            company: user.company._id,
            groupId,
          });
          if (_.isArray(statusResponse?.data)) {
            const statusData = [
              {
                statusName: 'Unassigned',
                statusCode: 'unassignedItem',
                _id: 'unassignedItem',
                position: 0,
                isNotDraggable: true,
              },
              ...(statusResponse?.data || []),
            ].sort((a, b) => a.position - b.position);
            setStages([
              ...statusData.map((obj) => ({
                id: obj._id,
                total: 0,
                title: obj.statusName,
                cards: [],
              })),
            ]);
            setModuleData([...statusData]);
          }
          break;
        }
        case 'category': {
          const { data: categoriesResponse } = await getCategory({
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
            setStages([
              ...categoriesData.map((obj) => ({
                id: obj._id,
                total: 0,
                title: obj.categoryName,
                cards: [],
              })),
            ]);
            setModuleData([...categoriesData]);
          }
          break;
        }
      }

      setLoading(false);
    } catch (error) {
      logger(error);
      setLoading(false);
    }
  };

  return { getStages, loading, moduleData };
};

export default useGetStages;
