/* eslint-disable no-unused-vars */
import { ChevronDown, ChevronUp } from 'react-feather';
import { AccordionItem, Badge } from 'reactstrap';

const SubTaskListHeader = ({
  setCurrentFilter,
  currentFilter,
  setIsLoadingVisible,
  taskLoading,
  childHeader = false,
  getSubTasks,
  parentTask,
}) => {
  const handleSort = ({ column, order }) => {
    if (childHeader) {
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
    } else {
      setCurrentFilter((prev) => ({
        ...prev,
        sort: { column, order },
      }));
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
              <div className='move-icon-cell'></div>
              <div className='task-number-cell'>
                <span className='title'>Number</span>
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
                <span className='title'>Contact</span>
                <SortElement
                  column='contact'
                  currentFilter={currentFilter}
                  handleSort={handleSort}
                  width='34px'
                  child={childHeader}
                  parentTask={parentTask}
                />
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
              <div className='task-pintask-cell'></div>
              {!currentFilter.trash && (
                <div className='task-checkbox-cell'></div>
              )}
              <div className='task-action-cell'></div>
              {!currentFilter.trash && !currentFilter.completed && (
                <div className='down-up-btn-cell'></div>
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

export default SubTaskListHeader;
