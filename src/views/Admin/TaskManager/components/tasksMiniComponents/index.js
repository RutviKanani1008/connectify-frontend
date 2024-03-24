import { Icon } from '@iconify/react';
import { usePinTaskAPI } from '../../service/task.services';

export const PinTask = ({ taskId, pinned, setCurrentTasks }) => {
  // ** API Service
  const { pinTaskAPI } = usePinTaskAPI();
  const pinTask = async () => {
    setCurrentTasks((prev) =>
      prev.map((obj) => ({
        ...obj,
        pinned: taskId === obj._id ? (!pinned ? 1 : 0) : obj.pinned,
      }))
    );
    const { error } = await pinTaskAPI({
      id: taskId,
      data: { pinned: !pinned },
    });
    if (error) {
      setCurrentTasks((prev) =>
        prev.map((obj) => ({
          ...obj,
          pinned: taskId === obj._id ? (!pinned ? 1 : 0) : obj.pinned,
        }))
      );
    }
  };

  return (
    <div
      className={`pitask-btn ${pinned ? 'active' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        pinTask();
      }}
    >
      <Icon
        icon='material-symbols:push-pin'
        className={`cursor-pointer ${
          pinned ? 'text-primary' : 'text-secondary'
        }   me-25`}
        width='20'
      />
    </div>
  );
};

export const SubPinTask = ({ taskId, pinned, setSubTasks, parentId }) => {
  // ** API Service
  const { pinTaskAPI } = usePinTaskAPI();
  const pinTask = async () => {
    setSubTasks((pre) => ({
      ...pre,
      [parentId]: pre[parentId].map((obj) => ({
        ...obj,
        pinned: taskId === obj._id ? (!pinned ? 1 : 0) : obj.pinned,
      })),
    }));
    const { error } = await pinTaskAPI({
      id: taskId,
      data: { pinned: !pinned },
    });
    if (error) {
      setSubTasks((pre) => ({
        ...pre,
        [parentId]: pre[parentId].map((obj) => ({
          ...obj,
          pinned: taskId === obj._id ? (!pinned ? 1 : 0) : obj.pinned,
        })),
      }));
    }
  };

  return (
    <div
      className={`pitask-btn ${pinned ? 'active' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        pinTask();
      }}
    >
      <Icon
        icon='material-symbols:push-pin'
        className={`cursor-pointer ${
          pinned ? 'text-primary' : 'text-secondary'
        }   me-25`}
        width='20'
      />
    </div>
  );
};
