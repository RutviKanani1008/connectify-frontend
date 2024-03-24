import { useRef, useEffect } from 'react';
import TaskDetails from './TaskDetails';

export const CategorizeAccordianTask = (props) => {
  const {
    currentFilter,
    setCurrentFilter,
    expandAll,
    setExpandAll,
    setIsExpandingAll,
    setOpen,
    open,
    isMounted,
    usersOptions,
    taskOptionLoading,
    taskOptions,
    unreadUpdatesTaskIds,
    setIsSubTask,
    isSubTask,
    show,
    setShow,
    notifyUserForNewTask,
    category,
    clearTasksData,
    currentTaskPaginationMain,
    setTaskOptions,
    selectedCategory,
    refreshCategories,
    categoryQuickAdd,
    refreshCategoriesKey,
    updateCategoryCounts,
    updateTask,
    setUpdateTask,
    handleClearAddUpdateTask,
    isPersistFilterAlreadySet,
    setCurrentTaskPaginationMain,
    initialContactData,
    initialUserData,
    setTotalSnoozedTasks,
  } = props;

  const taskDetailRef = useRef(null);

  useEffect(() => {
    if (categoryQuickAdd) {
      taskDetailRef.current.handleQuickAdd(open);
    }
  }, [categoryQuickAdd]);

  useEffect(() => {
    if (refreshCategoriesKey) {
      taskDetailRef.current.getTasks();
    }
  }, [refreshCategoriesKey]);

  return (
    <>
      <TaskDetails
        ref={taskDetailRef}
        currentTaskPaginationMain={currentTaskPaginationMain}
        currentFilter={{
          ...currentFilter,
          category: [category !== 'unassigned' ? category : null],
        }}
        currentCategory={category !== 'unassigned' ? category : null}
        currentCategoryId={category}
        refreshCategories={refreshCategories}
        setCurrentFilter={setCurrentFilter}
        expandAll={expandAll}
        setExpandAll={setExpandAll}
        setIsExpandingAll={setIsExpandingAll}
        setOpen={setOpen}
        open={open}
        isMounted={isMounted}
        usersOptions={usersOptions}
        taskOptionLoading={taskOptionLoading}
        taskOptions={taskOptions}
        unreadUpdatesTaskIds={unreadUpdatesTaskIds}
        setIsSubTask={setIsSubTask}
        isSubTask={isSubTask}
        show={show}
        setShow={setShow}
        notifyUserForNewTask={notifyUserForNewTask}
        clearTasksData={clearTasksData}
        setTaskOptions={setTaskOptions}
        selectedCategory={selectedCategory}
        updateCategoryCounts={updateCategoryCounts}
        updateTask={updateTask}
        setUpdateTask={setUpdateTask}
        handleClearAddUpdateTask={handleClearAddUpdateTask}
        isPersistFilterAlreadySet={isPersistFilterAlreadySet}
        setCurrentTaskPaginationMain={setCurrentTaskPaginationMain}
        initialContactData={initialContactData}
        initialUserData={initialUserData}
        setTotalSnoozedTasks={setTotalSnoozedTasks}
      />
    </>
  );
};
