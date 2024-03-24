/* eslint-disable no-unused-vars */
import { Icon } from '@iconify/react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { AccordionItem, Button, UncontrolledTooltip } from 'reactstrap';
import QuickAdd from '../../../../@core/assets/svg-icons/QuickAdd';

const TaskListHeader = ({
  setCurrentFilter,
  currentFilter,
  setIsLoadingVisible,
  taskLoading,
  childHeader = false,
  getSubTasks,
  parentTask,
  initialContactData,
  setCurrentTaskPaginationMain,
  handleTaskClick = () => {},
  setQuickAddSubTaskVisible = () => {},
}) => {
  const handleSort = ({ column, order }) => {
    if (childHeader) {
      if (parentTask.sub_tasks > 1) {
        const filter = {
          page: 1,
          subTaskSort: {
            ...(currentFilter.subTaskSort || {}),
            [parentTask._id]: { column, order },
          },
        };
        setCurrentFilter((prev) => ({
          ...prev,
          ...filter,
        }));
        if (getSubTasks)
          getSubTasks(parentTask._id, { ...currentFilter, ...filter });
      }
    } else {
      setCurrentFilter((prev) => ({
        ...prev,
        page: 1,
        sort: { column, order },
      }));
      setCurrentTaskPaginationMain({
        page: 1,
        loadMore: true,
        pagination: null,
      });
    }

    if (setIsLoadingVisible) {
      setIsLoadingVisible(false);
    }
  };

  return (
    <AccordionItem className='task-manager-table-header'>
      <div className='task-manager-row'>
        <div className='inner-wrapper'>
          <div className='task-manager-title'>
            <div className='left'>
              <div
                className={`move-icon-cell ${
                  !currentFilter.trash && !currentFilter.completed
                    ? 'active'
                    : ''
                }`}
              ></div>
              <div className='task-number-cell'>
                <span className='title'>Number</span>
                <SortElement
                  column='taskNumber'
                  currentFilter={currentFilter}
                  handleSort={handleSort}
                  child={childHeader}
                  parentTask={parentTask}
                />
              </div>
              <div className='task-name-cell'>
                <span className='title'>Name</span>
                <SortElement
                  column='name'
                  currentFilter={currentFilter}
                  handleSort={handleSort}
                  child={childHeader}
                  parentTask={parentTask}
                />
              </div>
            </div>
            <div className='right'>
              <div className='contact-cell'>
                <span className='title'>
                  {!initialContactData?._id && 'Contact'}
                </span>
                {!initialContactData?._id && (
                  <SortElement
                    column='contact'
                    currentFilter={currentFilter}
                    handleSort={handleSort}
                    width='34px'
                    child={childHeader}
                    parentTask={parentTask}
                  />
                )}
              </div>
              <div className='task-priority-cell'>
                <span className='title'>Priority</span>
                <SortElement
                  column='priority'
                  currentFilter={currentFilter}
                  handleSort={handleSort}
                  width='120px'
                  child={childHeader}
                  parentTask={parentTask}
                />
              </div>
              <div className='task-status-cell'>
                <span className='title'>Status</span>
                <SortElement
                  column='status'
                  currentFilter={currentFilter}
                  handleSort={handleSort}
                  width='120px'
                  child={childHeader}
                  parentTask={parentTask}
                />
              </div>
              <div className='task-date-cell'>
                <span className='title'>Start</span>
                <SortElement
                  column='startDate'
                  currentFilter={currentFilter}
                  handleSort={handleSort}
                  width='38px'
                  child={childHeader}
                  parentTask={parentTask}
                />
              </div>
              <div className='task-date-cell'>
                <span className='title'>Due</span>
                <SortElement
                  column='endDate'
                  currentFilter={currentFilter}
                  handleSort={handleSort}
                  width='38px'
                  child={childHeader}
                  parentTask={parentTask}
                />
              </div>
              {currentFilter.completed ? (
                <div className='task-date-cell'>
                  <span className='title'>Archived</span>
                  <SortElement
                    column='completedAt'
                    currentFilter={currentFilter}
                    handleSort={handleSort}
                    width='38px'
                    child={childHeader}
                    parentTask={parentTask}
                  />
                </div>
              ) : null}
              <div className='task-assignee-cell'>
                <span className='title'>Assignee</span>
                <SortElement
                  column='assigned'
                  currentFilter={currentFilter}
                  handleSort={handleSort}
                  width='34px'
                  child={childHeader}
                  parentTask={parentTask}
                />
              </div>

              {!currentFilter.trash && !currentFilter.completed && (
                <div className='task-snooze-cell'></div>
              )}
              <div className='task-update-cell'></div>
              <div className='task-pintask-cell'></div>
              {!currentFilter.trash && (
                <div className='task-checkbox-cell'></div>
              )}
              <div className='task-action-cell'></div>
              {!currentFilter.trash && !currentFilter.completed && (
                <div className='down-up-btn-cell'></div>
              )}
              {childHeader && (
                <div className='subtask-add-btns'>
                  <span
                    className='action-btn'
                    id={`task_quick_add`}
                    onClick={() => setQuickAddSubTaskVisible(true)}
                  >
                    <QuickAdd />
                  </span>
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`task_quick_add`}
                    color='primary'
                  >
                    Quick Add
                  </UncontrolledTooltip>
                  <span
                    className='action-btn'
                    id={`task_add_with_description`}
                    onClick={() => handleTaskClick(null, parentTask)}
                  >
                    <Icon
                      className='cursor-pointer new-subtask-details-btn'
                      icon='zondicons:add-outline'
                      width='30'
                    />
                  </span>
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`task_add_with_description`}
                  >
                    Add With Details
                  </UncontrolledTooltip>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* <div className='todo-title-wrapper'>
        <div className='todo__list_left ms-1'>
          <Badge
            className='text-capitalize invisible'
            color='light-danger'
            pill
          >
            0
          </Badge>
          <ChevronDown className='invisible' />
          <div className='todo-title-area'>
            <span className='todo-title fw-bold'>
              <SortElement
                column='name'
                currentFilter={currentFilter}
                handleSort={handleSort}
                child={childHeader}
                parentTask={parentTask}
              />
            </span>
          </div>
        </div>
        <div
          className='todo-item-action mt-lg-0 mt-50'
          style={{ marginRight: '88px' }}
        >
          <SortElement
            column='contact'
            currentFilter={currentFilter}
            handleSort={handleSort}
            width='34px'
            child={childHeader}
            parentTask={parentTask}
          />

          <SortElement
            column='priority'
            currentFilter={currentFilter}
            handleSort={handleSort}
            width='120px'
            child={childHeader}
            parentTask={parentTask}
          />

          <SortElement
            column='status'
            currentFilter={currentFilter}
            handleSort={handleSort}
            width='120px'
            child={childHeader}
            parentTask={parentTask}
          />

          <SortElement
            column='endDate'
            currentFilter={currentFilter}
            handleSort={handleSort}
            width='38px'
            child={childHeader}
            parentTask={parentTask}
          />

          <SortElement
            column='assigned'
            currentFilter={currentFilter}
            handleSort={handleSort}
            width='34px'
            child={childHeader}
            parentTask={parentTask}
          />
        </div>
      </div> */}
    </AccordionItem>
  );
};

const SortElement = ({
  currentFilter,
  handleSort,
  column,
  width,
  child,
  parentTask,
}) => {
  const parentTaskId = parentTask?._id;
  const tempSortColumn = child
    ? currentFilter?.subTaskSort?.[parentTaskId]?.column
    : currentFilter?.sort?.column;
  const tempSortOrder = child
    ? currentFilter?.subTaskSort?.[parentTaskId]?.order
    : currentFilter?.sort?.order;
  return (
    <small
      className='text-nowrap text-primary me-1'
      {...(width && { style: { width } })}
      onClick={() => {
        if (parentTaskId && parentTask.sub_tasks < 2) {
          return;
        }

        if (tempSortColumn === column && tempSortOrder === -1) {
          handleSort({ column: '', order: null });
        } else {
          tempSortColumn === column
            ? handleSort({ column, order: -1 })
            : handleSort({ column, order: 1 });
        }
      }}
    >
      {tempSortColumn === column && column !== 'status' && column !== 'priority'
        ? 'A-Z'
        : ''}
      {tempSortColumn === column && tempSortOrder === -1 ? (
        <ChevronDown
          className='sort__icon active'
          color='#a3db59'
          //   onClick={() => handleSort({ column: '', order: null })}
        />
      ) : (
        <ChevronUp
          className={`sort__icon ${tempSortColumn === column ? 'active' : ''}`}
          color={tempSortColumn === column ? '#a3db59' : '#6e6b7b'}
          //   onClick={() =>
          //     currentFilter?.sort?.column === column
          //       ? handleSort({ column, order: -1 })
          //       : handleSort({ column, order: 1 })
          //   }
        />
      )}
    </small>
  );
};

export default TaskListHeader;
