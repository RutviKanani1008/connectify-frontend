import { useState } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { userData } from '../../../../../../redux/user';
import { useGetGroupsAPI } from '../service/group.service';

export const useGetGroupOptions = () => {
  const user = useSelector(userData);

  const [groupOptions, setGroupOptions] = useState([]);

  // API Services
  const { getGroupsAPI } = useGetGroupsAPI();

  const getGroupOptions = async () => {
    const { data, error } = await getGroupsAPI({
      company: user.company._id,
      sort: 'createdAt',
    });
    if (_.isArray(data) && !error) {
      setGroupOptions([
        { label: 'Unassigned', value: 'unAssigned' },
        ...data.map((obj) => ({
          label: obj.groupName,
          value: obj._id,
        })),
      ]);
    }
  };
  return { getGroupOptions, groupOptions };
};
