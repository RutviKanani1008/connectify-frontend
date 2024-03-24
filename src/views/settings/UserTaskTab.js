import TaskManager from '../Admin/TaskManager/TaskManager';

const UserTaskTab = ({ initialUserData }) => {
  return (
    <TaskManager initialUserData={initialUserData} key={initialUserData._id} />
  );
};

export default UserTaskTab;
