import TaskManager from '../../TaskManager/TaskManager';

const ContactTaskTab = ({ initialContactData }) => {
  return (
    <TaskManager
      initialContactData={initialContactData}
      key={initialContactData._id}
    />
  );
};

export default ContactTaskTab;
