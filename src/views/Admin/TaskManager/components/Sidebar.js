/* eslint-disable no-tabs */
// ** Third Party Components
import classnames from 'classnames';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  ArrowLeft,
  ArrowRight,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Edit2,
  Mail,
  MoreVertical,
  Plus,
  Settings,
  Trash,
} from 'react-feather';

// ** Reactstrap Imports
import {
  Accordion,
  AccordionBody,
  Badge,
  Button,
  ListGroup,
  ListGroupItem,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap';
import { Fragment, useState } from 'react';
import useHandleSideBar from '../hooks/useHelper';
import { ReactSortable } from 'react-sortablejs';
import { useReOrderTaskOption } from '../service/taskOption.services';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import {
  singleElementRemoveFromArray,
  toggleElementFromArray,
} from '../../../../utility/Utils';
import CompleteSetStatusModal from './CompleteSetStatusModal';
import {
  AVAILABLE_KANBAN_VIEW,
  AVAILABLE_TASK_MANAGER_VIEW,
} from '../TaskManager';
// import { Icon } from '@iconify/react';

const TodoSidebar = (props) => {
  // ** Props
  const {
    clearTaskData,
    currentSelection,
    taskLoading,
    mainSidebar,
    handleSetShowTaskModal,
    currentFilter,
    setCurrentFilter,
    taskOptions,
    handleTaskOptions,
    handleOptionDelete,
    setTaskOptions,
    initialContactData,
    initialUserData,
    setCollapse,
    collapse,
    currentSelectCategory,
    setCurrentSelectCategory,
    categoryOpen,
    setCategoryOpen,
    setExpandAll,
    setCurrentTaskPagination,
    handleQuickAdd,
    totalSnoozedTasks,
    handleMainSidebar,
  } = props;

  const currentUser = useSelector(userData);
  const isUserRole = currentUser?.role === 'user';
  const isAdminRole = currentUser?.role === 'admin';

  // ** State
  const [isOpenCompleteModal, setIsOpenCompleteModal] = useState(false);

  // ** custom hooks
  const { reOrderTaskOption } = useReOrderTaskOption();
  const { handleSidebar } = useHandleSideBar({
    setCurrentFilter,
    initialContactData,
    initialUserData,
    setCurrentTaskPagination,
  });
  const [sideBarOpen, setSideBarOpen] = useState([]);
  const [updateAccordian, setUpdateAccordian] = useState({
    category: 0,
    status: 0,
    priority: 0,
  });
  const sidebarToggle = (id) => {
    setSideBarOpen((prev) => toggleElementFromArray(prev, id));
    setUpdateAccordian({
      [id]: Math.random(),
      ...updateAccordian,
    });
  };

  const renderCategory = () => {
    return (
      <ListGroup className='list-group-labels'>
        <ReactSortable
          list={taskOptions?.filter((option) => option.type === 'category')}
          handle='.drag-icon'
          setList={(newState) => {
            setTaskOptions([
              ...newState,
              ...taskOptions?.filter((option) => option.type === 'status'),
              ...taskOptions?.filter((option) => option.type === 'priority'),
            ]);
          }}
          onEnd={() => {
            reOrderTaskOption(
              taskOptions?.filter((option) => {
                return (
                  option._id !== 'unassigned' && option.type === 'category'
                );
              })
            );
          }}
        >
          {taskOptions
            ?.filter((option) => option.type === 'category')
            ?.map((option, index) => {
              return (
                <Fragment key={`${index}_category`}>
                  <ListGroupItem
                    active={
                      currentSelectCategory?.find(
                        (category) => category.value === option.value
                      )
                        ? true
                        : false
                    }
                    className='filter-item-inner'
                    onClick={() => {
                      setExpandAll(false);
                      // here toggle the filter
                      if (
                        currentSelectCategory?.find(
                          (category) => category.value === option.value
                        )
                      ) {
                        let tempObj = JSON.parse(
                          JSON.stringify(currentSelectCategory)
                        );
                        tempObj = tempObj.filter(
                          (category) => category.value !== option.value
                        );
                        setCurrentSelectCategory(tempObj);
                        // clearTaskData();
                      } else {
                        setCurrentSelectCategory([
                          ...currentSelectCategory,
                          option,
                        ]);
                      }

                      if (currentSelectCategory.length === 1) {
                        handleSidebar({
                          open: true,
                          currentView: currentFilter?.currentView,
                        });
                      }

                      if (categoryOpen?.includes(`${option.value}`)) {
                        setCategoryOpen((prev) =>
                          toggleElementFromArray(prev, `${option.value}`)
                        );
                      }
                    }}
                  >
                    <div className='drag-icon-wrapper'>
                      {isAdminRole && option.label !== 'Unassigned' && (
                        <>
                          <MoreVertical className='drag-icon' />
                          <MoreVertical className='drag-icon' />
                        </>
                      )}
                    </div>

                    <div className='contantCN' id={`category-label-${index}`}>
                      <span
                        className={`bullet`}
                        style={{ backgroundColor: option.color }}
                      ></span>

                      {collapse ? (
                        <UncontrolledTooltip target={`category-label-${index}`}>
                          {option?.label}
                        </UncontrolledTooltip>
                      ) : option?.helperText ? (
                        <UncontrolledTooltip target={`category-label-${index}`}>
                          {option?.helperText}
                        </UncontrolledTooltip>
                      ) : null}

                      <span className='text'>{option?.label}</span>
                    </div>
                    {!isUserRole && option.label !== 'Unassigned' && (
                      <div className='action-btn-wrapper'>
                        <>
                          <div
                            className='action-btn edit-btn'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskOptions(option, 'category');
                            }}
                          >
                            <Edit2
                              id={`edit_category_${index}`}
                              className='cursor-pointer'
                              size={12}
                            />
                            <UncontrolledTooltip
                              placement='top'
                              target={`edit_category_${index}`}
                            >
                              Edit
                            </UncontrolledTooltip>
                          </div>
                        </>
                        <>
                          {taskLoading &&
                          currentSelection._id === option._id ? (
                            <div className='action-btn spinner-btn'>
                              <Spinner size='sm' />
                            </div>
                          ) : (
                            <>
                              <div
                                className='action-btn delete-btn'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOptionDelete(option);
                                }}
                              >
                                <Trash
                                  id={`delete_category_${index}`}
                                  size={15}
                                  color='red'
                                  className='cursor-pointer'
                                />
                                <UncontrolledTooltip
                                  placement='top'
                                  target={`delete_category_${index}`}
                                >
                                  Delete
                                </UncontrolledTooltip>
                              </div>
                            </>
                          )}
                        </>
                      </div>
                    )}
                  </ListGroupItem>
                </Fragment>
              );
            })}
        </ReactSortable>
      </ListGroup>
    );
  };

  const renderStatus = () => {
    return (
      <ListGroup className='filter-item-inner'>
        <ReactSortable
          list={taskOptions?.filter((option) => option.type === 'status')}
          handle='.drag-icon'
          setList={(newState) => {
            setTaskOptions([
              ...newState,
              ...taskOptions?.filter((option) => option.type === 'priority'),
              ...taskOptions?.filter((option) => option.type === 'category'),
            ]);
          }}
          onEnd={() => {
            reOrderTaskOption(
              taskOptions?.filter(
                (option) =>
                  option._id !== 'unassigned' && option.type === 'status'
              )
            );
          }}
        >
          {taskOptions
            ?.filter((option) => option.type === 'status')
            .map((option, index) => {
              return (
                <Fragment key={`${index}_status`}>
                  <ListGroupItem
                    active={currentFilter.status.includes(option.value)}
                    className='filter-item-inner'
                    onClick={() => {
                      // here toggle the filter
                      if (currentFilter?.status.includes(option.value)) {
                        handleSidebar({
                          ...currentFilter,
                          status: singleElementRemoveFromArray(
                            currentFilter?.status,
                            option.value
                          ),
                        });
                        clearTaskData();
                      } else {
                        handleSidebar({
                          ...currentFilter,
                          status: [
                            ...(currentFilter?.status || []),
                            option.value,
                          ],
                        });
                        clearTaskData();
                      }
                    }}
                  >
                    <div className='drag-icon-wrapper'>
                      {isAdminRole && option.label !== 'Unassigned' && (
                        <>
                          <MoreVertical className='drag-icon' />
                          <MoreVertical className='drag-icon' />
                        </>
                      )}
                    </div>

                    <div className='contantCN' id={`status-label-${index}`}>
                      <span
                        className={`bullet`}
                        style={{ backgroundColor: option.color }}
                      ></span>

                      {collapse ? (
                        <UncontrolledTooltip target={`status-label-${index}`}>
                          {option?.label}
                        </UncontrolledTooltip>
                      ) : option?.helperText ? (
                        <UncontrolledTooltip target={`status-label-${index}`}>
                          {option?.helperText}
                        </UncontrolledTooltip>
                      ) : null}

                      <span className='text'>{option?.label}</span>
                    </div>
                    {!isUserRole && option.label !== 'Unassigned' && (
                      <div className='action-btn-wrapper'>
                        <>
                          <div
                            className='action-btn edit-btn'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskOptions(option, 'status');
                            }}
                          >
                            <Edit2
                              id={`edit_status_${index}`}
                              className='cursor-pointer'
                              size={12}
                            />
                            <UncontrolledTooltip
                              placement='top'
                              target={`edit_status_${index}`}
                            >
                              Edit
                            </UncontrolledTooltip>
                          </div>
                        </>
                        <>
                          {taskLoading &&
                          currentSelection._id === option._id ? (
                            <div className='action-btn spinner-btn'>
                              <Spinner size='sm' />
                            </div>
                          ) : (
                            <>
                              <div
                                className='action-btn spinner-btn'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOptionDelete(option);
                                }}
                              >
                                <Trash
                                  id={`delete_status_${index}`}
                                  size={15}
                                  color='red'
                                  className='cursor-pointer'
                                />
                                <UncontrolledTooltip
                                  placement='top'
                                  target={`delete_status_${index}`}
                                >
                                  Delete
                                </UncontrolledTooltip>
                              </div>
                            </>
                          )}
                        </>
                      </div>
                    )}
                  </ListGroupItem>
                </Fragment>
              );
            })}
        </ReactSortable>
      </ListGroup>
    );
  };

  const renderPriority = () => {
    return (
      <ListGroup className='list-group-labels'>
        <ReactSortable
          list={taskOptions?.filter((option) => option.type === 'priority')}
          handle='.drag-icon'
          setList={(newState) => {
            setTaskOptions([
              ...newState,
              ...taskOptions?.filter((option) => option.type === 'status'),
              ...taskOptions?.filter((option) => option.type === 'category'),
            ]);
          }}
          onEnd={() => {
            reOrderTaskOption(
              taskOptions?.filter(
                (option) =>
                  option._id !== 'unassigned' && option.type === 'priority'
              )
            );
          }}
        >
          {taskOptions
            ?.filter((option) => option.type === 'priority')
            .map((option, index) => {
              return (
                <Fragment key={`${index}_priority`}>
                  <ListGroupItem
                    active={currentFilter.priority.includes(option.value)}
                    className='filter-item-inner'
                    onClick={() => {
                      // here toggle the filter
                      if (currentFilter?.priority.includes(option.value)) {
                        handleSidebar({
                          ...currentFilter,
                          priority: singleElementRemoveFromArray(
                            currentFilter?.priority,
                            option.value
                          ),
                        });
                        clearTaskData();
                      } else {
                        handleSidebar({
                          ...currentFilter,
                          priority: [
                            ...(currentFilter?.priority || []),
                            option.value,
                          ],
                        });
                        clearTaskData();
                      }
                    }}
                  >
                    <div className='drag-icon-wrapper'>
                      {isAdminRole && option.label !== 'Unassigned' && (
                        <>
                          <MoreVertical className='drag-icon' />
                          <MoreVertical className='drag-icon' />
                        </>
                      )}
                    </div>
                    <div className='contantCN' id={`priority-label-${index}`}>
                      <span
                        className={`bullet`}
                        style={{ backgroundColor: option.color }}
                      ></span>

                      {collapse ? (
                        <UncontrolledTooltip target={`priority-label-${index}`}>
                          {option?.label}
                        </UncontrolledTooltip>
                      ) : option?.helperText ? (
                        <UncontrolledTooltip target={`priority-label-${index}`}>
                          {option?.helperText}
                        </UncontrolledTooltip>
                      ) : null}
                      <span className='text'>{option?.label}</span>
                    </div>

                    {!isUserRole && option.label !== 'Unassigned' && (
                      <div className='action-btn-wrapper'>
                        <>
                          <div
                            className='action-btn edit-btn'
                            onClick={(event) => {
                              event.stopPropagation();
                              handleTaskOptions(option, 'priority');
                            }}
                          >
                            <Edit2
                              id={`edit_priority_${index}`}
                              className='cursor-pointer'
                              size={12}
                            />
                            <UncontrolledTooltip
                              placement='top'
                              target={`edit_priority_${index}`}
                            >
                              Edit
                            </UncontrolledTooltip>
                          </div>
                        </>
                        {taskLoading && currentSelection._id === option._id ? (
                          <div className='action-btn spinner-btn'>
                            <Spinner size='sm' />
                          </div>
                        ) : (
                          <>
                            <div
                              className='action-btn edit-btn'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOptionDelete(option);
                              }}
                            >
                              <Trash
                                id={`delete_priority_${index}`}
                                size={15}
                                color='red'
                                className='cursor-pointer'
                              />
                              <UncontrolledTooltip
                                placement='top'
                                target={`delete_priority_${index}`}
                              >
                                Delete
                              </UncontrolledTooltip>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </ListGroupItem>
                </Fragment>
              );
            })}
        </ReactSortable>
      </ListGroup>
    );
  };
  return (
    <div
      className={classnames('sidebar-left', {
        show: mainSidebar === true,
        taskSideBarCollapse: collapse,
      })}
    >
      <div className='add-task-btn-wrapper'>
        {/* {collapse ? ( */}
        <>
          <button
            onClick={() => handleSetShowTaskModal()}
            className={`btn-primary add__task__btn ${
              collapse ? 'sidebarCollapse__addTask__BtnShow' : ''
            }`}
            id='add-task-btn'
          >
            <Plus />
          </button>
          <UncontrolledTooltip target='add-task-btn'>
            Add Task
          </UncontrolledTooltip>
          <Button
            className={`defaultAddTask__btn ${
              collapse ? 'sidebarCollapse__addTask__BtnShow' : ''
            }`}
            color='primary'
            onClick={() => handleSetShowTaskModal()}
            block
          >
            Add Task
          </Button>
        </>
        {/* ) : (
          
        )} */}
      </div>
      <PerfectScrollbar
        className='scroll-area'
        options={{ wheelPropagation: false }}
      >
        <div className='page-tab'>
          <div
            className={`page-tab-item ${
              currentFilter.open && !isOpenCompleteModal ? 'active' : ''
            }`}
            // HELLO-D
            // active={currentFilter.open}
            onClick={() => {
              if (!currentFilter.open) {
                handleQuickAdd(false);
                handleSidebar({
                  open: true,
                  currentView: currentFilter?.currentView,
                  currentKanbanView: currentFilter?.currentKanbanView || null,
                });
                clearTaskData();
              }
            }}
          >
            <div className='icon-wrapper'>
              <Mail className='' size={18} id='open-task-tooltip' />
            </div>
            {collapse && (
              <UncontrolledTooltip target='open-task-tooltip'>
                Open Tasks
              </UncontrolledTooltip>
            )}
            <span className='text-label'>Open Tasks</span>
          </div>
          <div
            className={`page-tab-item archived ${
              currentFilter.completed || isOpenCompleteModal ? 'active' : ''
            }`}
            // HELLO-D
            // active={currentFilter.completed}
            onClick={() => {
              if (!currentFilter.completed) {
                handleQuickAdd(false);
                handleSidebar({
                  ...(currentFilter?.category?.length && {
                    category: currentFilter.category,
                  }),
                  currentView: currentFilter?.currentView,
                  currentKanbanView: currentFilter?.currentKanbanView || null,
                  completed: true,
                });
                clearTaskData();
              }
            }}
          >
            <div className='icon-wrapper'>
              <CheckSquare className='' size={18} id='completed-tooltip' />
            </div>
            {collapse && (
              <UncontrolledTooltip target='completed-tooltip'>
                Archived
              </UncontrolledTooltip>
            )}
            <span className='text-label'>Archived</span>
            <div
              className='icon-wrapper setting'
              onClick={(e) => {
                e.stopPropagation();
                setIsOpenCompleteModal(true);
              }}
            >
              <Settings className='' size={18} id='completed-default-status' />
              <UncontrolledTooltip target='completed-default-status'>
                Set Status
              </UncontrolledTooltip>
            </div>
          </div>
          <div
            className={`page-tab-item ${
              currentFilter.trash && !isOpenCompleteModal ? 'active' : ''
            }`}
            // HELLO-D
            // active={currentFilter.trash}
            onClick={() => {
              if (!currentFilter.trash) {
                handleQuickAdd(false);
                handleSidebar({
                  ...(currentFilter?.category?.length && {
                    category: currentFilter.category,
                  }),
                  trash: true,
                  currentView: currentFilter?.currentView,
                  currentKanbanView: currentFilter?.currentKanbanView || null,
                });
                clearTaskData();
              }
            }}
          >
            <div className='icon-wrapper'>
              <Trash className='' size={18} id='trash-tooltip' />
            </div>
            {collapse && (
              <UncontrolledTooltip target='trash-tooltip'>
                Trash
              </UncontrolledTooltip>
            )}
            <span className='text-label'>Trash</span>
          </div>
          <div
            className={`page-tab-item snooze-tasks ${
              currentFilter.snoozedTask && !isOpenCompleteModal ? 'active' : ''
            }`}
            // HELLO-D
            // active={currentFilter.snoozedTask}
            onClick={() => {
              if (!currentFilter.snoozedTask) {
                handleQuickAdd(false);
                handleSidebar({
                  snoozedTask: true,
                  currentView: currentFilter?.currentView,
                  currentKanbanView: currentFilter?.currentKanbanView || null,
                });
                clearTaskData();
              }
            }}
          >
            <div className='icon-wrapper'>
              <svg
                id='snoozed-task-tooltip'
                version='1.1'
                x='0px'
                y='0px'
                viewBox='0 0 40 40'
                xmlSpace='preserve'
              >
                <path
                  d='M29.7,31.8C29.7,31.8,29.7,31.8,29.7,31.8H10.3c0,0,0,0,0,0c-2.4,0-4.4-2-4.4-4.4c0-0.8,0.2-1.6,0.6-2.3
	c1.8-2.9,2.7-6.3,2.7-9.7v-2.1c0-4.9,4-8.9,8.9-8.9h3.8c0,0,0,0,0,0c1.7,0,3.4,0.5,4.8,1.4c0.6,0.4,0.7,1.2,0.4,1.7
	c-0.4,0.6-1.2,0.7-1.7,0.4c-1-0.7-2.2-1-3.5-1c0,0,0,0,0,0h-3.8c-3.5,0-6.4,2.9-6.4,6.4v2.1c0,3.9-1,7.6-3,11
	c-0.2,0.3-0.3,0.6-0.3,1c0,1,0.8,1.9,1.9,1.9c0,0,0,0,0,0h19.4c0,0,0,0,0,0c0.3,0,0.7-0.1,1-0.3c0.4-0.3,0.7-0.7,0.9-1.2
	c0.1-0.5,0-1-0.2-1.4c-2-3.3-3-7.1-3-11c0-0.7,0.6-1.2,1.2-1.2s1.2,0.6,1.2,1.2c0,3.4,0.9,6.8,2.7,9.7c0.6,1,0.8,2.2,0.5,3.3
	c-0.3,1.1-1,2.1-2,2.7C31.3,31.6,30.5,31.8,29.7,31.8z M25.8,34.1c0.4-0.6,0.2-1.4-0.3-1.7c-0.6-0.4-1.3-0.2-1.7,0.3
	c-1,1.5-2.2,2.3-3.7,2.3s-2.7-0.8-3.7-2.3c-0.4-0.6-1.2-0.7-1.7-0.3c-0.6,0.4-0.7,1.2-0.3,1.7c1.5,2.3,3.5,3.4,5.8,3.4
	C22.3,37.5,24.3,36.3,25.8,34.1z M25.1,17.2c0-0.7-0.6-1.2-1.2-1.2h-1.5l2.5-3.8c0.3-0.4,0.3-0.9,0.1-1.3c-0.2-0.4-0.6-0.7-1.1-0.7
	H20c-0.7,0-1.2,0.6-1.2,1.2s0.6,1.2,1.2,1.2h1.5L19,16.5c-0.3,0.4-0.3,0.9-0.1,1.3c0.2,0.4,0.6,0.7,1.1,0.7h3.8
	C24.5,18.4,25.1,17.9,25.1,17.2z M34.6,11.5c0-0.7-0.6-1.2-1.2-1.2h-3.2l4.2-5.6c0.3-0.4,0.3-0.9,0.1-1.3s-0.6-0.7-1.1-0.7h-5.7
	c-0.7,0-1.2,0.6-1.2,1.2s0.6,1.2,1.2,1.2h3.2l-4.2,5.6c-0.3,0.4-0.3,0.9-0.1,1.3s0.6,0.7,1.1,0.7h5.7C34,12.7,34.6,12.2,34.6,11.5z'
                />
              </svg>
            </div>
            {collapse && (
              <UncontrolledTooltip target='snoozed-task-tooltip'>
                Snoozed Tasks
              </UncontrolledTooltip>
            )}
            <span className='text-label'>
              <span className='text'>Snoozed Tasks</span>

              <Badge color='primary' className='mx-1' pill>
                {totalSnoozedTasks || 0}
              </Badge>
            </span>
          </div>
        </div>
        <div className='filter-wrapper'>
          {![AVAILABLE_TASK_MANAGER_VIEW.kanbanView.value].includes(
            currentFilter?.currentView
          ) ? (
            <>
              {/* {!collapse ? ( */}
              <>
                <Accordion
                  className='filter-item'
                  open={sideBarOpen}
                  // onClick={() => {
                  //   sidebarToggle(`category`);
                  // }}
                  // key={updateAccordian.category}
                >
                  <div className='header-item-wrapper'>
                    {!isUserRole && (
                      <>
                        <div className='icon-wrapper plus-arrow'>
                          <Plus
                            id='add_category_btn'
                            className=''
                            size={14}
                            onClick={() => {
                              handleTaskOptions(null, 'category');
                            }}
                          />
                          <UncontrolledTooltip
                            placement='top'
                            target='add_category_btn'
                          >
                            Add Category
                          </UncontrolledTooltip>
                        </div>
                      </>
                    )}
                    <div
                      className='header-item'
                      onClick={(e) => {
                        e.stopPropagation();
                        sidebarToggle(`category`);
                      }}
                    >
                      <span className='text-label'>
                        <span className='text'>Category</span>
                        {currentSelectCategory?.length ? (
                          <>
                            {false && (
                              <svg
                                className='sidebar-refresh-btn'
                                x='0px'
                                y='0px'
                                viewBox='0 0 50 50'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentSelectCategory([]);
                                  handleSidebar({
                                    open: true,
                                    currentView: currentFilter?.currentView,
                                  });
                                  setCategoryOpen([]);
                                }}
                              >
                                <path
                                  fill='#82868b'
                                  d='M11.4,13.6c2.4,0,4.7,0,7,0c0.4,0,0.8,0,1.2,0.1c1.1,0.3,1.8,1.4,1.6,2.7c-0.1,1.3-1,2.2-2.3,2.3c-0.2,0-0.3,0-0.5,0
	c-4.1,0-8.2,0-12.3,0c-1.8,0-2.8-0.9-2.8-2.7c0-4.1,0-8.2,0-12.3c0-1.7,0.9-2.7,2.5-2.7c1.6,0,2.6,0.9,2.6,2.5c0,1.7,0,3.4,0,5.1
	c0,0.2,0,0.4,0,0.6c0.9-0.7,1.7-1.4,2.6-2c11.6-7.8,27-3.5,33.1,9.2c4.5,9.5,2.3,22.4-9,29.5c-9.4,5.9-20.9,3.5-27.9-3.7
	c-1-1-1.9-2.2-2.7-3.3c-0.7-0.9-0.7-2.1,0-3c0.7-0.9,1.9-1.4,2.9-0.9C8,35.1,8.6,35.5,8.9,36c2.8,4,6.5,6.5,11.3,7.5
	c9.8,2,17.7-4,20.4-11.9c3.1-9-1.4-18.7-10.9-22.2C23,6.9,17,8.6,11.7,13.3C11.6,13.3,11.6,13.4,11.4,13.6z'
                                />
                              </svg>
                            )}
                            <Badge color='primary' className='mx-1' pill>
                              {currentSelectCategory?.length}
                            </Badge>
                          </>
                        ) : null}
                      </span>
                      {sideBarOpen.includes(`category`) ? (
                        <div className='icon-wrapper up-arrow'>
                          <ChevronUp
                            className='up-arrow'
                            // onClick={(e) => {
                            //   e.stopPropagation();
                            //   sidebarToggle(`category`);
                            // }}
                          />
                        </div>
                      ) : (
                        <div className='icon-wrapper down-arrow'>
                          <ChevronDown
                            className='down-arrow'
                            // onClick={() => {
                            //   sidebarToggle(`category`);
                            // }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <AccordionBody
                    className='filter-body-toggle-wrapper'
                    accordionId={'category'}
                  >
                    {renderCategory()}
                  </AccordionBody>
                </Accordion>
                <div
                  className={`sidebarCollapse__CN ${
                    !collapse ? 'show__cn' : ''
                  }`}
                >
                  <h5 className='collapse-filter-letter' id='category-option'>
                    C
                  </h5>
                  <UncontrolledTooltip target='category-option'>
                    Category
                  </UncontrolledTooltip>
                  <div className='filter-body-toggle-wrapper'>
                    {renderCategory()}
                  </div>
                </div>
              </>
              {/* ) : (
              )} */}

              {/* {!collapse ? ( */}
              <>
                <Accordion
                  className='filter-item'
                  open={sideBarOpen}

                  // key={updateAccordian.status}
                >
                  <div className='header-item-wrapper'>
                    {!isUserRole && (
                      <>
                        <div className='icon-wrapper plus-arrow'>
                          <Plus
                            id='add_status_btn'
                            className='cursor-pointer'
                            size={14}
                            onClick={() => {
                              handleTaskOptions(null, 'status');
                            }}
                          />
                          <UncontrolledTooltip
                            placement='top'
                            target='add_status_btn'
                          >
                            Add Status
                          </UncontrolledTooltip>
                        </div>
                      </>
                    )}
                    <div
                      className='header-item'
                      onClick={(e) => {
                        e.stopPropagation();
                        sidebarToggle(`status`);
                      }}
                    >
                      <span className='text-label'>
                        <span className='text'>Status</span>
                        {currentFilter?.status?.length ? (
                          <>
                            {false && (
                              <svg
                                className='sidebar-refresh-btn'
                                x='0px'
                                y='0px'
                                viewBox='0 0 50 50'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSidebar({
                                    ...currentFilter,
                                    status: [],
                                  });
                                  clearTaskData();
                                }}
                              >
                                <path
                                  fill='#82868b'
                                  d='M11.4,13.6c2.4,0,4.7,0,7,0c0.4,0,0.8,0,1.2,0.1c1.1,0.3,1.8,1.4,1.6,2.7c-0.1,1.3-1,2.2-2.3,2.3c-0.2,0-0.3,0-0.5,0
	c-4.1,0-8.2,0-12.3,0c-1.8,0-2.8-0.9-2.8-2.7c0-4.1,0-8.2,0-12.3c0-1.7,0.9-2.7,2.5-2.7c1.6,0,2.6,0.9,2.6,2.5c0,1.7,0,3.4,0,5.1
	c0,0.2,0,0.4,0,0.6c0.9-0.7,1.7-1.4,2.6-2c11.6-7.8,27-3.5,33.1,9.2c4.5,9.5,2.3,22.4-9,29.5c-9.4,5.9-20.9,3.5-27.9-3.7
	c-1-1-1.9-2.2-2.7-3.3c-0.7-0.9-0.7-2.1,0-3c0.7-0.9,1.9-1.4,2.9-0.9C8,35.1,8.6,35.5,8.9,36c2.8,4,6.5,6.5,11.3,7.5
	c9.8,2,17.7-4,20.4-11.9c3.1-9-1.4-18.7-10.9-22.2C23,6.9,17,8.6,11.7,13.3C11.6,13.3,11.6,13.4,11.4,13.6z'
                                />
                              </svg>
                            )}
                            <Badge color='primary' className='mx-1' pill>
                              {currentFilter?.status?.length}
                            </Badge>
                          </>
                        ) : null}
                      </span>
                      {sideBarOpen.includes(`status`) ? (
                        <div className='icon-wrapper up-arrow'>
                          <ChevronUp
                            className='up-arrow'
                            // onClick={(e) => {
                            //   e.stopPropagation();
                            //   sidebarToggle(`status`);
                            // }}
                          />
                        </div>
                      ) : (
                        <div className='icon-wrapper down-arrow'>
                          <ChevronDown
                            className='down-arrow'
                            // onClick={() => {
                            //   sidebarToggle(`status`);
                            // }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <AccordionBody
                    className='filter-body-toggle-wrapper'
                    accordionId={'status'}
                  >
                    {renderStatus()}
                  </AccordionBody>
                </Accordion>
                <div
                  className={`sidebarCollapse__CN ${
                    !collapse ? 'show__cn' : ''
                  }`}
                >
                  <h5 className='collapse-filter-letter' id='status-option'>
                    S
                  </h5>
                  <UncontrolledTooltip target='status-option'>
                    Status
                  </UncontrolledTooltip>
                  <div className='filter-body-toggle-wrapper'>
                    {renderStatus()}
                  </div>
                </div>
              </>
              {/* ) : (
              )} */}

              {/* {!collapse ? ( */}
              <>
                <Accordion
                  className='filter-item'
                  open={sideBarOpen}
                  // onClick={() => {
                  //   sidebarToggle(`priority`);
                  // }}
                  // key={updateAccordian.priority}
                >
                  <div className='header-item-wrapper'>
                    {!isUserRole && (
                      <>
                        <div className='icon-wrapper plus-arrow'>
                          <Plus
                            id='add_priority_btn'
                            className='cursor-pointer'
                            size={14}
                            onClick={() => {
                              handleTaskOptions(null, 'priority');
                            }}
                          />
                          <UncontrolledTooltip
                            placement='top'
                            target='add_priority_btn'
                          >
                            Add Priority
                          </UncontrolledTooltip>
                        </div>
                      </>
                    )}
                    <div
                      className='header-item'
                      onClick={(e) => {
                        e.stopPropagation();
                        sidebarToggle(`priority`);
                      }}
                    >
                      <span className='text-label'>
                        <span className='text'>Priority</span>
                        {currentFilter?.priority?.length ? (
                          <>
                            {false && (
                              <svg
                                className='sidebar-refresh-btn'
                                x='0px'
                                y='0px'
                                viewBox='0 0 50 50'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSidebar({
                                    ...currentFilter,
                                    priority: [],
                                  });
                                  clearTaskData();
                                }}
                              >
                                <path
                                  fill='#82868b'
                                  d='M11.4,13.6c2.4,0,4.7,0,7,0c0.4,0,0.8,0,1.2,0.1c1.1,0.3,1.8,1.4,1.6,2.7c-0.1,1.3-1,2.2-2.3,2.3c-0.2,0-0.3,0-0.5,0
    c-4.1,0-8.2,0-12.3,0c-1.8,0-2.8-0.9-2.8-2.7c0-4.1,0-8.2,0-12.3c0-1.7,0.9-2.7,2.5-2.7c1.6,0,2.6,0.9,2.6,2.5c0,1.7,0,3.4,0,5.1
    c0,0.2,0,0.4,0,0.6c0.9-0.7,1.7-1.4,2.6-2c11.6-7.8,27-3.5,33.1,9.2c4.5,9.5,2.3,22.4-9,29.5c-9.4,5.9-20.9,3.5-27.9-3.7
    c-1-1-1.9-2.2-2.7-3.3c-0.7-0.9-0.7-2.1,0-3c0.7-0.9,1.9-1.4,2.9-0.9C8,35.1,8.6,35.5,8.9,36c2.8,4,6.5,6.5,11.3,7.5
    c9.8,2,17.7-4,20.4-11.9c3.1-9-1.4-18.7-10.9-22.2C23,6.9,17,8.6,11.7,13.3C11.6,13.3,11.6,13.4,11.4,13.6z'
                                />
                              </svg>
                            )}
                            <Badge color='primary' className='mx-1' pill>
                              {currentFilter?.priority?.length}
                            </Badge>
                          </>
                        ) : null}
                      </span>{' '}
                      {sideBarOpen.includes(`priority`) ? (
                        <div className='icon-wrapper up-arrow'>
                          <ChevronUp
                            className='up-arrow'
                            // onClick={(e) => {
                            //   e.stopPropagation();
                            //   sidebarToggle(`priority`);
                            // }}
                          />
                        </div>
                      ) : (
                        <div className='icon-wrapper down-arrow'>
                          <ChevronDown
                            className='down-arrow'
                            // onClick={() => {
                            //   sidebarToggle(`priority`);
                            // }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <AccordionBody
                    className='filter-body-toggle-wrapper'
                    accordionId={'priority'}
                  >
                    {renderPriority()}
                  </AccordionBody>
                </Accordion>
                <div
                  className={`sidebarCollapse__CN ${
                    !collapse ? 'show__cn' : ''
                  }`}
                >
                  <h5 className='collapse-filter-letter' id='priority-option'>
                    P
                  </h5>
                  <UncontrolledTooltip target='priority-option'>
                    Priority
                  </UncontrolledTooltip>
                  <div className='filter-body-toggle-wrapper'>
                    {renderPriority()}
                  </div>
                </div>
              </>
              {/* ) : (  
              )} */}
            </>
          ) : (
            <>
              {!collapse ? (
                <div className='page-tab'>
                  <div
                    className={`page-tab-item ${
                      currentFilter.currentKanbanView ===
                      AVAILABLE_KANBAN_VIEW.category
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => {
                      setCurrentFilter({
                        ...currentFilter,
                        currentKanbanView: AVAILABLE_KANBAN_VIEW.category,
                      });
                    }}
                  >
                    <div className='icon-wrapper'>
                      <Mail className='' size={18} id='category-kanban-view' />
                    </div>
                    {collapse && (
                      <UncontrolledTooltip target='category-kanban-view'>
                        Category View
                      </UncontrolledTooltip>
                    )}
                    <span className='text-label'>Category View</span>
                  </div>
                  <div
                    className={`page-tab-item ${
                      currentFilter.currentKanbanView ===
                      AVAILABLE_KANBAN_VIEW.status
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => {
                      setCurrentFilter({
                        ...currentFilter,
                        currentKanbanView: AVAILABLE_KANBAN_VIEW.status,
                      });
                    }}
                  >
                    <div className='icon-wrapper'>
                      <Mail className='' size={18} id='status-kanban-view' />
                    </div>
                    {collapse && (
                      <UncontrolledTooltip target='status-kanban-view'>
                        Status View
                      </UncontrolledTooltip>
                    )}
                    <span className='text-label'>Status View</span>
                  </div>
                  <div
                    className={`page-tab-item ${
                      currentFilter.currentKanbanView ===
                      AVAILABLE_KANBAN_VIEW.priority
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => {
                      setCurrentFilter({
                        ...currentFilter,
                        currentKanbanView: AVAILABLE_KANBAN_VIEW.priority,
                      });
                    }}
                  >
                    <div className='icon-wrapper'>
                      <Mail className='' size={18} id='priority-kanban-view' />
                    </div>
                    {collapse && (
                      <UncontrolledTooltip target='priority-kanban-view'>
                        Priority View
                      </UncontrolledTooltip>
                    )}
                    <span className='text-label'>Priority View</span>
                  </div>
                </div>
              ) : (
                <>
                  <h5
                    className={`collapse-filter-letter ${
                      currentFilter.currentKanbanView ===
                      AVAILABLE_KANBAN_VIEW.category
                        ? 'active'
                        : ''
                    }`}
                    id='category-view-option'
                    onClick={() => {
                      setCurrentFilter({
                        ...currentFilter,
                        currentKanbanView: AVAILABLE_KANBAN_VIEW.category,
                      });
                    }}
                  >
                    C
                  </h5>
                  <UncontrolledTooltip target='category-view-option'>
                    Category View
                  </UncontrolledTooltip>
                  <h5
                    className={`collapse-filter-letter ${
                      currentFilter.currentKanbanView ===
                      AVAILABLE_KANBAN_VIEW.status
                        ? 'active'
                        : ''
                    }`}
                    id='status-view-option'
                    onClick={() => {
                      setCurrentFilter({
                        ...currentFilter,
                        currentKanbanView: AVAILABLE_KANBAN_VIEW.status,
                      });
                    }}
                  >
                    S
                  </h5>
                  <UncontrolledTooltip target='status-view-option'>
                    Status View
                  </UncontrolledTooltip>
                  <h5
                    className={`collapse-filter-letter ${
                      currentFilter.currentKanbanView ===
                      AVAILABLE_KANBAN_VIEW.priority
                        ? 'active'
                        : ''
                    }`}
                    id='priority-view-option'
                    onClick={() => {
                      setCurrentFilter({
                        ...currentFilter,
                        currentKanbanView: AVAILABLE_KANBAN_VIEW.priority,
                      });
                    }}
                  >
                    P
                  </h5>
                  <UncontrolledTooltip target='priority-view-option'>
                    Priority View
                  </UncontrolledTooltip>
                </>
              )}
            </>
          )}
        </div>
      </PerfectScrollbar>
      <span
        className='collapse__menu__icon__wp'
        onClick={() => setCollapse(!collapse)}
      >
        {collapse ? (
          <ArrowRight className='collapse__menu__icon' color='white' />
        ) : (
          <ArrowLeft className='collapse__menu__icon' color='white' />
        )}
      </span>
      <span
        className='collapse__menu__icon__wp responsive__btn'
        onClick={() => setCollapse(!collapse)}
      >
        {collapse ? (
          <ArrowRight className='collapse__menu__icon' color='white' />
        ) : (
          <ArrowLeft className='collapse__menu__icon' color='white' />
        )}
      </span>
      <span
        className='collapse__menu__icon__wp responsive__btn before1439'
        onClick={handleMainSidebar}
      >
        {collapse ? (
          <ArrowRight className='collapse__menu__icon' color='white' />
        ) : (
          <ArrowLeft className='collapse__menu__icon' color='white' />
        )}
      </span>
      {isOpenCompleteModal && (
        <CompleteSetStatusModal
          taskLoading={taskLoading}
          taskOptions={taskOptions}
          close={() => setIsOpenCompleteModal(false)}
          isOpen={isOpenCompleteModal}
        />
      )}
    </div>
  );
};

export default TodoSidebar;
