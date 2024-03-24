/* eslint-disable no-unused-vars */
/* eslint-disable no-tabs */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Plus, Printer } from 'react-feather';
import {
  Button,
  DropdownItem,
  Input,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap';
import _ from 'lodash';
import { useExpandAllTask } from '../hooks/useTaskService';
import { useSelector } from 'react-redux';
import { useDebounce } from '../../../../hooks/useDebounce';
import { userData } from '../../../../redux/user';
import TaskFilterDropdown from './TaskFilterDropdown';
import ExportData from '../../../../components/ExportData';
import { usePrintTasks } from '../service/task.services';
import { useReactToPrint } from 'react-to-print';
import PrintTask from './PrintTask';
import useHandleSideBar from '../hooks/useHelper';
import { Global } from 'recharts';
import { useExportTaskDataAPI } from '../../../../hooks/useGeneralAPI';
import { downloadFile } from '../../../../helper/common.helper';
import { baseURL } from '../../../../api/axios-config';
import {
  AVAILABLE_KANBAN_VIEW,
  AVAILABLE_TASK_MANAGER_VIEW,
} from '../TaskManager';

export const TaskHeader = (props) => {
  const {
    setOpen,
    open,
    currentFilter,
    usersOptions,
    initialFilters,
    setCurrentFilter,
    initialContactData,
    initialUserData,
    setExpandAll,
    isExpandingAll,
    setIsExpandingAll,
    handleMainSidebar,
    relatedGroupOptions,
    groupsOptions,
    setCurrentTaskPaginationMain,
    handleQuickAdd,
    taskOptions,
    currentSelectCategory,
    setCurrentSelectCategory,
    setCategoryOpen,
  } = props;
  const user = useSelector(userData);
  const [searchVal, setSearchVal] = useState(currentFilter.search || '');
  const { getPrintTask, isLoading: printLoading } = usePrintTasks();
  const [printTaskData, setPrintTaskData] = useState([]);
  const debouncedSearchVal = useDebounce(searchVal);
  const printComponentRef = useRef();
  const [showPrinting, setShowPrinting] = useState(false);
  const { exportDataAPI: exportTaskDataApi, isLoading: exportTaskLoading } =
    useExportTaskDataAPI();

  const { handleSidebar } = useHandleSideBar({
    setCurrentFilter,
    initialContactData,
    initialUserData,
  });

  useEffect(() => {
    setSearchVal(currentFilter.search);
  }, [currentFilter.search]);

  useEffect(() => {
    setCurrentFilter({
      ...currentFilter,
      page: 1,
      search: debouncedSearchVal,
    });

    /* reset pagination on search */
    setCurrentTaskPaginationMain({ page: 1, loadMore: true, pagination: null });
  }, [debouncedSearchVal]);

  const containsSubTasks = currentFilter?.open;

  const { expandingAllTask } = useExpandAllTask({
    user,
    setExpandAll,
    setIsExpandingAll,
    setOpen,
    currentFilter,
  });

  const resetDisabled = useMemo(() => {
    return _.isEqual(initialFilters, currentFilter);
  }, [currentFilter]);

  const resetAllFilter = () =>
    setCurrentFilter({
      ...initialFilters,
      ...(currentFilter.currentView ===
        AVAILABLE_TASK_MANAGER_VIEW.kanbanView.value && {
        currentKanbanView: AVAILABLE_KANBAN_VIEW.category,
      }),
      currentView: currentFilter.currentView,
    });

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
  });

  const handlePrintTask = async () => {
    setPrintTaskData([]);
    const { data, error } = await getPrintTask({ ...currentFilter });
    if (data && !error && _.isArray(data)) {
      setPrintTaskData(data?.sort(({ order: a }, { order: b }) => a - b));
      setShowPrinting(true);
    }

    handlePrint(); /* Print */
  };

  const isAllCategoriesSelected = () => {
    return (
      currentSelectCategory?.length &&
      taskOptions?.filter((option) => option.type === 'category')?.length ===
        currentSelectCategory?.length
    );
  };

  const exportData = async () => {
    const { data, error } = await exportTaskDataApi(currentFilter);
    if (data && !error) {
      downloadFile(`${baseURL}/${data}`);
    }
  };

  return (
    <>
      <div className='task-manager-top-header'>
        <div
          className='task-manager-sidebar-toggle-btn'
          onClick={handleMainSidebar}
        >
          <span className='line'></span>
          <span className='line'></span>
          <span className='line'></span>
        </div>
        <div className='left'>
          <div className='task-manager-serach-box'>
            <div className='form-element-icon-wrapper'>
              <svg
                version='1.1'
                id='Layer_1'
                x='0px'
                y='0px'
                viewBox='0 0 56 56'
              >
                <path
                  style={{ fill: '#acacac' }}
                  d='M52.8,49.8c-4-4.1-7.9-8.2-11.9-12.4c-0.2-0.2-0.5-0.5-0.7-0.8c2.5-3,4.1-6.4,4.8-10.2c0.7-3.8,0.4-7.6-1-11.2
    c-1.3-3.6-3.5-6.7-6.5-9.2C29.4-0.8,17.8-0.9,9.6,5.9C1,13.1-0.8,25.3,5.4,34.7c2.9,4.3,6.8,7.3,11.8,8.8c6.7,2,13,0.9,18.8-3
    c0.1,0.2,0.3,0.3,0.4,0.4c3.9,4.1,7.9,8.2,11.8,12.3c0.7,0.7,1.3,1.3,2.2,1.6h1.1c0.5-0.3,1.1-0.5,1.5-0.9
    C54.1,52.8,54,51.1,52.8,49.8z M23.5,38.7c-8.8,0-16.1-7.2-16.1-16.1c0-8.9,7.2-16.1,16.1-16.1c8.9,0,16.1,7.2,16.1,16.1
    C39.6,31.5,32.4,38.7,23.5,38.7z'
                />
              </svg>
              <Input
                id='search-task'
                className='text-primary search__task__input'
                value={searchVal}
                placeholder='Search task'
                onChange={(e) => setSearchVal(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className='right'>
          {containsSubTasks && (
            <>
              {currentFilter.currentView ===
                AVAILABLE_TASK_MANAGER_VIEW.normalView.value && (
                <>
                  <div
                    className='searchInSubtask-input-wrapper show__categories'
                    id='show_categories_rows'
                  >
                    <div className='category-inner-wrapper'>
                      <Input
                        checked={isAllCategoriesSelected()}
                        type='checkbox'
                        onChange={(e) => {
                          if (isAllCategoriesSelected()) {
                            setCurrentSelectCategory([]);
                            handleSidebar({
                              ...currentFilter,
                              category: [],
                            });
                          } else {
                            setCurrentSelectCategory(
                              taskOptions?.filter(
                                (option) => option.type === 'category'
                              )
                            );
                            handleSidebar({
                              ...currentFilter,
                              category: taskOptions
                                ?.filter((option) => option.type === 'category')
                                .map((option) => option._id),
                            });
                            const firstCategory = taskOptions
                              ?.filter((option) => option.type === 'category')
                              ?.map((option) => option._id)?.[0];
                            setCategoryOpen([firstCategory]);
                          }
                        }}
                      />
                      <span className='text'>Show Categories Rows</span>
                    </div>
                  </div>
                  <UncontrolledTooltip
                    placement='top'
                    target='show_categories_rows'
                  >
                    Show Categories Rows
                  </UncontrolledTooltip>
                  {/* <div
                    className='searchInSubtask-input-wrapper'
                    id='searchInSubtask__wrapper'
                  >
                    <div className='inner-wrapper'>
                      <Input
                        checked={currentFilter.includeSubTasks}
                        type='checkbox'
                        onChange={(e) => {
                          setCurrentFilter((prev) => ({
                            ...prev,
                            includeSubTasks: e.target.checked,
                          }));
                        }}
                      />
                      <span className='text'>Also Search in Subtasks</span>
                    </div>
                  </div>
                  <UncontrolledTooltip
                    placement='top'
                    target='searchInSubtask__wrapper'
                  >
                    Also Search in Subtasks
                  </UncontrolledTooltip> */}
                </>
              )}
              <button
                className='reset-filters-btn'
                id='reset-filters'
                disabled={resetDisabled}
                onClick={resetAllFilter}
              >
                <svg x='0px' y='0px' viewBox='0 0 50 50'>
                  <path
                    fill='#82868b'
                    d='M11.4,13.6c2.4,0,4.7,0,7,0c0.4,0,0.8,0,1.2,0.1c1.1,0.3,1.8,1.4,1.6,2.7c-0.1,1.3-1,2.2-2.3,2.3c-0.2,0-0.3,0-0.5,0
	c-4.1,0-8.2,0-12.3,0c-1.8,0-2.8-0.9-2.8-2.7c0-4.1,0-8.2,0-12.3c0-1.7,0.9-2.7,2.5-2.7c1.6,0,2.6,0.9,2.6,2.5c0,1.7,0,3.4,0,5.1
	c0,0.2,0,0.4,0,0.6c0.9-0.7,1.7-1.4,2.6-2c11.6-7.8,27-3.5,33.1,9.2c4.5,9.5,2.3,22.4-9,29.5c-9.4,5.9-20.9,3.5-27.9-3.7
	c-1-1-1.9-2.2-2.7-3.3c-0.7-0.9-0.7-2.1,0-3c0.7-0.9,1.9-1.4,2.9-0.9C8,35.1,8.6,35.5,8.9,36c2.8,4,6.5,6.5,11.3,7.5
	c9.8,2,17.7-4,20.4-11.9c3.1-9-1.4-18.7-10.9-22.2C23,6.9,17,8.6,11.7,13.3C11.6,13.3,11.6,13.4,11.4,13.6z'
                  />
                </svg>
              </button>
              <UncontrolledTooltip placement='top' target='reset-filters'>
                Reset Filters
              </UncontrolledTooltip>
            </>
          )}

          {currentFilter.currentView ===
            AVAILABLE_TASK_MANAGER_VIEW.normalView.value && (
            <>
              <span
                id='expand-collapse-task-btn-tooltip'
                className={`${expandingAllTask ? 'opacity-50' : ''} ${
                  open.length ? 'collapse-all' : 'expand-all'
                } expand-collapse-task-btn`}
                onClick={() => {
                  if (!expandingAllTask) {
                    if (open.length) {
                      setExpandAll(false);
                      setOpen([]);
                    } else {
                      setExpandAll(true);
                    }
                  }
                }}
              >
                <span className='icon-wrapper'>
                  {isExpandingAll ? (
                    <Spinner size='sm' className='text-primary' />
                  ) : (
                    <svg id='Layer_1' x='0px' y='0px' viewBox='0 0 116 116'>
                      <path
                        d='M57.5,64.8c-12.1,0-24.3,0-36.4,0c-9,0-16.2-5.8-18.1-14.4c-0.3-1.3-0.4-2.7-0.4-4.1c0-8,0-16.1,0-24.1
	C2.5,11.7,10.6,3.6,21,3.6c24.4,0,48.8,0,73.2,0c10.4,0,18.5,8.1,18.5,18.6c0,8,0,16,0,24c0,10.6-8,18.6-18.6,18.6
	C81.9,64.9,69.7,64.8,57.5,64.8z M57.8,15.9c-12.1,0-24.1,0-36.2,0c-4.5,0-6.8,2.4-6.8,6.8c0,7.6,0,15.3,0,22.9c0,4.6,2.4,7,7,7
	c23.9,0,47.8,0,71.7,0c4.6,0,7-2.4,7-7c0-7.6,0-15.1,0-22.7c0-4.8-2.3-7.1-7.1-7.1C81.5,15.9,69.6,15.9,57.8,15.9z'
                      />
                      <g>
                        <path
                          d='M57.6,77.1c16.2,0,32.3,0,48.5,0c2.6,0,4.6,0.9,5.8,3.2c2,3.6-0.1,8.1-4.1,8.9c-0.7,0.1-1.3,0.2-2,0.2
		c-32.1,0-64.3,0-96.4,0c-1.9,0-3.7-0.4-5.1-1.8c-1.8-1.9-2.3-4.1-1.4-6.5c0.9-2.4,2.8-3.7,5.3-3.9c1-0.1,2.1,0,3.2,0
		C26.8,77.1,42.2,77.1,57.6,77.1z'
                        />
                        <path
                          d='M57.6,113.8c-16.2,0-32.3,0-48.5,0c-3.3,0-5.6-1.7-6.4-4.6c-0.9-3.2,1.2-6.7,4.4-7.4c0.7-0.2,1.5-0.2,2.3-0.2
		c32.1,0,64.3,0,96.4,0c2.2,0,4.2,0.5,5.6,2.4c1.5,1.9,1.8,4.1,0.8,6.3c-1,2.2-2.8,3.3-5.2,3.6c-0.5,0-1.1,0-1.6,0
		C89.5,113.8,73.5,113.8,57.6,113.8z'
                        />
                      </g>
                    </svg>
                  )}
                  {/* {open.length ? 'Collapse All' : 'Expand All'} */}
                </span>
              </span>
              <UncontrolledTooltip
                placement='top'
                target='expand-collapse-task-btn-tooltip'
              >
                {open.length ? 'Collapse All' : 'Expand All'}
              </UncontrolledTooltip>
            </>
          )}
          <TaskFilterDropdown
            setCurrentTaskPaginationMain={setCurrentTaskPaginationMain}
            currentFilter={currentFilter}
            initialContactData={initialContactData}
            initialUserData={initialUserData}
            setCurrentFilter={setCurrentFilter}
            usersOptions={usersOptions}
            relatedGroupOptions={relatedGroupOptions}
            groupsOptions={groupsOptions}
          />
          <div style={{ display: 'none' }}>
            <ExportData
              model='task'
              parentLoading={printLoading}
              query={currentFilter}
              childDropDownOptions={
                <>
                  <DropdownItem
                    className='cursor-pointer w-100'
                    onClick={() => {
                      handlePrintTask();
                    }}
                    // disabled={() => {}}
                  >
                    <Printer size={15} />
                    <span className='align-middle ms-50'>Print</span>
                  </DropdownItem>
                </>
              }
            />
          </div>
          {currentFilter.currentView !==
            AVAILABLE_TASK_MANAGER_VIEW.kanbanView.value && (
            <>
              <div
                id='export_tasks'
                className='task-export-btn'
                onClick={() => {
                  exportData();
                }}
              >
                {exportTaskLoading ? <Spinner /> : <Download size={15} />}
              </div>
              <UncontrolledTooltip placement='top' target='export_tasks'>
                Export Tasks
              </UncontrolledTooltip>
              <div
                id='print_tasks'
                className='task-print-btn'
                onClick={() => {
                  handlePrintTask();
                }}
              >
                {printLoading ? <Spinner /> : <Printer size={15} />}
              </div>
              <UncontrolledTooltip placement='top' target='print_tasks'>
                Print Tasks
              </UncontrolledTooltip>
            </>
          )}
          {!(
            currentFilter.trash ||
            currentFilter.completed ||
            currentFilter.snoozedTask
          ) &&
            currentFilter.currentView ===
              AVAILABLE_TASK_MANAGER_VIEW.normalView.value && (
              <Button
                className='new-task-btn'
                color='primary'
                onClick={() => handleQuickAdd(true)}
              >
                <Plus size={15} />
                <span className='text'>Quick Add</span>
              </Button>
            )}
        </div>
      </div>
      {showPrinting && (
        <div className='d-none'>
          <PrintTask ref={printComponentRef} data={printTaskData} />
        </div>
      )}
    </>
  );
};
