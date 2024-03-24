import React from 'react';
import { useSelector } from 'react-redux';
import { userData } from '../../../../../redux/user';
import TaskTimerReport from '../../../../Admin/TaskManager/TaskTimerReport';

const TaskTimerReports = () => {
  // ** Redux **
  const user = useSelector(userData);

  return (
    <TaskTimerReport
      extraFilers={{ user: user._id }}
      key={user._id}
      currentPage={'user'}
    />
  );
};

export default TaskTimerReports;
