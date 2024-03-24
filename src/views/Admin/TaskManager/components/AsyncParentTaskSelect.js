import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AsyncPaginate } from 'react-select-async-paginate';
import { userData } from '../../../../redux/user';
import { useGetTasksList } from '../service/task.services';

const AsyncParentTaskSelect = (props) => {
  // ** Redux **
  const user = useSelector(userData);

  // ** State **
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [finalOpts, setFinalOpts] = useState([]);
  const [controller, setController] = useState(null);

  const { getTaskList } = useGetTasksList();

  const loadOptions = async (searchVal) => {
    let newPage = page;
    if (search !== searchVal) {
      newPage = 1;
      setSearch(searchVal);
    }
    let tempController = controller;
    if (tempController) {
      tempController.abort();
    }
    tempController = new AbortController();
    setController(tempController);
    const data = await getTaskList(
      {
        search: searchVal,
        page: newPage,
        parent_task: '',
        select: 'name',
        trash: false,
        company: user?.company?._id,
        includeSubTasks: false,
      },
      tempController.signal
    );

    const {
      pagination: { total },
      tasks: allParentTasks = [],
    } = data?.data;

    const result = allParentTasks.filter(
      (item) => item._id !== props.selectCurrentTask?._id
    );

    const options = result.map((item) => ({
      label: item.name,
      value: item._id,
      taskNumber: item.taskNumber,
    }));

    const updatedOpts = finalOpts.concat(options);
    setFinalOpts(updatedOpts);
    setPage(newPage + 1);

    return {
      options,
      hasMore: (total || 1) - 1 > updatedOpts.length,
    };
  };

  return (
    <AsyncPaginate
      {...props}
      debounceTimeout={300}
      value={props.value}
      onChange={props.onChange}
      loadOptions={loadOptions}
    />
  );
};

export default AsyncParentTaskSelect;
