import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import TaskModal from '../../../TaskManager/components/TaskModal/TaskModal';
import { useGetTaskOptions } from '../../../TaskManager/hooks/useGetTaskOptions';
import { useGetCompanyUsers } from '../../../TaskManager/service/userApis';
import { userData } from '../../../../../redux/user';
import { useCreateTaskNotifyUsers } from '../../../TaskManager/service/taskNotifyUsers.services';

const TaskPopulateFromEmail = ({
  setShowTaskModal,
  showTaskModal,
  currentMailDetail,
}) => {
  const user = useSelector(userData);

  // ** Custom Hooks **
  const { getTaskOptions, taskOptions, setTaskOptions } = useGetTaskOptions();
  const { notifyUsers } = useCreateTaskNotifyUsers();
  const { getCompanyUsers } = useGetCompanyUsers();

  useEffect(() => {
    getTaskOptions();
  }, []);

  const notifyUserForNewTask = async ({ id: taskId, assigned }) => {
    const { data, error } = await getCompanyUsers(user?.company._id, {
      select: 'firstName,lastName,role',
      role: 'admin',
    });

    if (!error && data) {
      const notifyUsersList = data
        .map((d) => d._id)
        .filter((id) => id !== user?._id);

      if (assigned && _.isArray(assigned)) {
        assigned.forEach((a) => {
          if (!notifyUsersList.includes(a._id)) {
            notifyUsersList.push(a._id);
          }
        });
      }

      const notifyUsersIds = notifyUsersList.filter((n) => n._id !== user?._id);
      if (notifyUsersIds?.length) {
        await notifyUsers({ taskId, userIds: notifyUsersIds });
      }
    }
  };

  return (
    <TaskModal
      setOpen={() => {}}
      currentFilter={{}}
      setCurrentTasks={() => {}}
      setShowTaskModal={setShowTaskModal}
      showTaskModal={showTaskModal}
      taskOptions={taskOptions}
      setTaskOptions={setTaskOptions}
      currentTasks={[]}
      handleClearAddUpdateTask={() => setShowTaskModal(false)}
      notifyUserForNewTask={notifyUserForNewTask}
      setCurrentTaskPagination={() => {}}
      currentMailDetail={currentMailDetail}
      editTask={false}
    />
  );
};

export default TaskPopulateFromEmail;
