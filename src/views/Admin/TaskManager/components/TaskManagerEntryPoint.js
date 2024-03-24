import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useGetTaskByIdAPI } from '../service/task.services';
import { decrypt, encrypt } from '../../../../helper/common.helper';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { Spinner } from 'reactstrap';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';

const TaskManagerEneryPoint = () => {
  const history = useHistory();
  const { getTaskByIdAPI, isLoading: taskLoading } = useGetTaskByIdAPI();
  const [taskNotFound, setTaskNotFound] = useState(false);
  const user = useSelector(userData);
  const { basicRoute } = useGetBasicRoute();
  console.log({ user: user.role });
  const checkTaskIsExists = async (taskId) => {
    const { data, error } = await getTaskByIdAPI(taskId);
    if (!error) {
      console.log({ data });
      if (data) {
        const searchValue = new URLSearchParams(location.search);
        const isTaskId = searchValue.get('update');
        if (isTaskId) {
          history.push(
            `${basicRoute}/task-manager?task=${encrypt(taskId)}&update=true`
          );
        } else {
          history.push(`${basicRoute}/task-manager?task=${encrypt(taskId)}`);
        }
      } else {
        //
        setTaskNotFound(true);
        // history.push('/');
      }
    } else {
      setTaskNotFound(true);
    }
  };

  useEffect(() => {
    const searchValue = new URLSearchParams(location.search);
    const isTaskId = searchValue.get('task');
    if (isTaskId) {
      const taskId = decrypt(isTaskId);

      checkTaskIsExists(taskId);
    } else {
      history.push('/');
    }
  }, []);
  return (
    <>
      {taskLoading && <Spinner />}{' '}
      {taskNotFound && (
        <>
          <NoRecordFound />
        </>
      )}
    </>
  );
};
export default TaskManagerEneryPoint;
