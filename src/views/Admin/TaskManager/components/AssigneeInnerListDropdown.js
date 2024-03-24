import { Check, ChevronDown } from 'react-feather';
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from 'reactstrap';
import AvatarGroup from '@components/avatar-group';
import Avatar from '@components/avatar';
import defaultAvatar from '@src/assets/images/avatars/avatar-blank.png';
import { useUpdateTask } from '../service/task.services';
import { toggleElementFromArray } from '../../../../utility/Utils';
import { useMemo, useState } from 'react';

const AssigneeInnerListDropdown = ({
  options,
  item,
  setCurrentTasks = false,
  currentTasks = false,
  subTasks = false,
  setSubTasks = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { updateTask: updateTaskDetail, isLoading } = useUpdateTask();
  const currentAssignee = item.assigned || [];

  const quickHandleAssignee = async (option, taskDetail) => {
    const currentAssigneeIds = currentAssignee.map((obj) => obj._id);

    const finalAssignees = toggleElementFromArray(
      currentAssigneeIds,
      option.value
    );

    if (setCurrentTasks && currentTasks) {
      const selectedAssignee = options
        .filter((obj) => finalAssignees.includes(obj.value))
        .map((obj) => ({
          _id: obj.value,
          userProfile: obj.profile,
          firstName: obj.firstName,
          lastName: obj.lastName,
        }));
      const tempCurrentTasks = currentTasks.map((obj) =>
        obj._id === item._id
          ? { ...obj, assigned: selectedAssignee }
          : { ...obj }
      );
      setCurrentTasks(tempCurrentTasks);
    }
    if (setSubTasks && subTasks) {
      const selectedAssignee = options
        .filter((obj) => finalAssignees.includes(obj.value))
        .map((obj) => ({
          _id: obj.value,
          userProfile: obj.profile,
          firstName: obj.firstName,
          lastName: obj.lastName,
        }));
      const tempCurrentSubTasks = subTasks[item.parent_task].map((obj) =>
        obj._id === item._id
          ? { ...obj, assigned: selectedAssignee }
          : { ...obj }
      );
      setSubTasks((prev) => ({
        ...prev,
        [item.parent_task]: tempCurrentSubTasks,
      }));
    }
    await updateTaskDetail(
      item._id,
      {
        assigned: finalAssignees,
        status: taskDetail?.status,
        contact: taskDetail.contact?._id,
      },
      'Assignee Updating...',
      {}
    );
  };

  const avatarGroup = useMemo(() => {
    return currentAssignee.length
      ? [...currentAssignee.slice(0, 3)].map((obj) => ({
          img:
            obj.userProfile && obj.userProfile !== 'false'
              ? `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${obj.userProfile}`
              : null,
          imgHeight: 26,
          imgWidth: 26,
          content: `${obj.firstName ?? ''} ${obj.lastName ?? ''} `,
          initials: true,
          title: `${obj.firstName ?? ''} ${obj.lastName ?? ''} `,
          contentStyles: { width: '26px', height: '26px' },
        }))
      : [
          {
            img: defaultAvatar,
            imgHeight: 26,
            imgWidth: 26,
            title: 'Unassigned',
          },
        ];
  }, [currentAssignee]);

  return (
    <UncontrolledButtonDropdown
      className='task-assignee-wrapper'
      onClick={(e) => {
        e.stopPropagation();
      }}
      isOpen={isOpen}
      toggle={() => {
        setIsOpen(!isOpen);
      }}
    >
      <DropdownToggle tag='span' caret className={`task-assignee-toggle`}>
        <AvatarGroup data={avatarGroup} index={item._id} />
        <ChevronDown className='down__icon' size={16} />
      </DropdownToggle>
      {isOpen && (
        <DropdownMenu className='fancy-scrollbar task-assignee-dropdown'>
          {options.map((data, index) => (
            <DropdownItem toggle={false} key={index} disabled={isLoading}>
              <div
                style={{
                  opacity: isLoading ? 0.5 : 1,
                }}
                className='d-flex justify-content-between align-items-center'
                onClick={() => quickHandleAssignee(data, item)}
              >
                <div className='d-flex align-items-center left-side'>
                  {data?.profile &&
                  data?.profile !== false &&
                  data?.profile !== null &&
                  data?.profile !== undefined ? (
                    <>
                      <Avatar
                        img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${data?.profile}`}
                        imgHeight='32'
                        imgWidth='32'
                        content={data?.label}
                        initials
                      />
                    </>
                  ) : data?.label && data.label !== '' ? (
                    <>
                      <Avatar
                        color={'light-primary'}
                        content={data?.label}
                        initials
                      />
                    </>
                  ) : (
                    <>
                      <Avatar
                        img={defaultAvatar}
                        imgHeight='32'
                        imgWidth='32'
                      />
                    </>
                  )}
                  <div className='ms-1 title'>
                    <span>{data.label}</span>
                    {data.companyName && <div>{data.companyName}</div>}
                  </div>
                </div>
                {currentAssignee.find((obj) => obj._id === data.value) && (
                  <Check className='ms-1 text-success' color='#a3db59' />
                )}
              </div>
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </UncontrolledButtonDropdown>
  );
};

export default AssigneeInnerListDropdown;
