import { useState } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { userData } from '../../../../redux/user';
import { useGetTaskOptions as useGetTaskOptionsService } from '../service/taskOption.services';

export const useGetTaskOptions = () => {
  // ** Store **
  const user = useSelector(userData);

  // ** State **
  const [taskOptions, setTaskOptions] = useState([]);

  const {
    getTaskOptions: getTaskOptionsService,
    isLoading: taskOptionLoading,
  } = useGetTaskOptionsService();

  const getTaskOptions = async () => {
    const { data, error } = await getTaskOptionsService({
      company: user?.company?._id,
    });
    if (!error && _.isArray(data)) {
      const taskOption = [
        {
          _id: 'unassigned',
          label: 'Unassigned',
          value: null,
          type: 'category',
          color: '#edf7e0',
          showFirst: true,
        },
        ...data,
      ];
      setTaskOptions(
        taskOption.map((option) => ({ ...option, value: option._id }))
      );
    }
  };

  return { getTaskOptions, taskOptionLoading, taskOptions, setTaskOptions };
};
