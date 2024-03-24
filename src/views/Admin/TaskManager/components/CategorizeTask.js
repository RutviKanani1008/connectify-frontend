// ** Third Party Components
import { ChevronDown, ChevronUp } from 'react-feather';
// ** Reactstrap Imports
import { Accordion, AccordionItem, AccordionBody, Badge } from 'reactstrap';
import { Fragment, useEffect, useState } from 'react';
import {
  singleElementRemoveFromArray,
  toggleElementFromArray,
} from '../../../../utility/Utils';
import useHandleSideBar from '../hooks/useHelper';
import { CategorizeAccordianTask } from './CategorizeAccordianTask';
import InfiniteScroll from 'react-infinite-scroll-component';

const CategorizeTasks = (props) => {
  // ** Props
  const {
    initialContactData,
    categoryOpen,
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
    setCategoryOpen,
    currentSelectCategory,
    clearTasksData,
    currentTaskPaginationMain,
    categoryQuickAdd,
    showFirstCategory,
    availableTaskOptionCounts,
    setAvailableTaskOptionCounts,
    updateTask,
    setUpdateTask,
    handleClearAddUpdateTask,
    isPersistFilterAlreadySet,
    setCurrentTaskPaginationMain,
    initialUserData = false,
    setTotalSnoozedTasks = () => {},
  } = props;

  // ** State
  const [refreshCatKey, setRefreshCatKey] = useState(0);

  // ** Function to selectTask on click
  const categoryToggle = (id) => {
    setCategoryOpen((prev) => toggleElementFromArray(prev, id));
  };

  const { handleSidebar } = useHandleSideBar({
    setCurrentFilter,
    initialContactData,
    initialUserData,
  });

  const refreshCategories = () => setRefreshCatKey(Math.random());

  useEffect(() => {
    if (categoryQuickAdd && !categoryOpen.length) {
      const tempCategory = currentSelectCategory?.[0];
      categoryToggle(`${tempCategory._id}`);
      handleSidebar({
        ...currentFilter,
        category: singleElementRemoveFromArray(
          currentFilter?.category,
          tempCategory.value
        ),
      });
    }
  }, [categoryQuickAdd]);

  useEffect(() => {
    if (showFirstCategory && !categoryOpen.length) {
      const tempCategory = currentSelectCategory?.[0];
      categoryToggle(`${tempCategory._id}`);
      handleSidebar({
        ...currentFilter,
        category: singleElementRemoveFromArray(
          currentFilter?.category,
          tempCategory.value
        ),
      });
    }
  }, [showFirstCategory]);

  const updateCategoryCounts = (categories) => {
    const tempCounts = { ...availableTaskOptionCounts };
    categories.forEach((cat) => {
      tempCounts[cat.id] = tempCounts[cat.id] + cat.count;
    });
    setAvailableTaskOptionCounts(tempCounts);
  };

  const renderTasks = () => {
    return (
      <InfiniteScroll
        dataLength={currentSelectCategory.length || 0}
        className='todo-task-list media-list fancy__scrollbar task-manager-category-scrollbar'
      >
        <Fragment>
          <Accordion
            className='task-manager-category-wrapper'
            open={categoryOpen}
            key={currentFilter}
          >
            {currentSelectCategory
              ?.sort((a, b) => a?.order - b?.order)
              ?.sort(({ showFirst: a }, { showFirst: b }) => !!b - !!a)
              ?.map((category, index) => {
                // use "category?.color" for color
                return (
                  <AccordionItem
                    className={`task-manager-category-item ${
                      categoryOpen.includes(`${category._id}`) ? 'open' : ''
                    }`}
                    key={index}
                  >
                    <div className='task-manager-cat-headerWrapper'>
                      <div
                        className='task-manager-cat-data-header cursor-pointer'
                        onClick={(e) => {
                          e.stopPropagation();

                          if (categoryOpen.includes(`${category._id}`)) {
                            categoryToggle(`${category._id}`);
                            handleSidebar({
                              ...currentFilter,
                              category: singleElementRemoveFromArray(
                                currentFilter?.category,
                                category.value
                              ),
                            });
                          } else {
                            handleSidebar({
                              ...currentFilter,
                              category: [
                                ...(currentFilter?.category || []),
                                category.value,
                              ],
                            });

                            categoryToggle(`${category._id}`);
                          }
                        }}
                      >
                        <span
                          className='bg-span'
                          style={{ backgroundColor: category.color }}
                        ></span>
                        <span
                          className={`bullet me-1`}
                          style={{ backgroundColor: category.color }}
                        ></span>
                        <h3 className='category-name'>{category.label}</h3>
                        {availableTaskOptionCounts?.[category._id] ? (
                          <>
                            <Badge color='primary' className='' pill>
                              {availableTaskOptionCounts?.[category._id]}
                            </Badge>
                          </>
                        ) : (
                          <Badge color='primary' className='' pill>
                            0
                          </Badge>
                        )}
                        <div className='action-btn-wrapper'>
                          {categoryOpen.includes(`${category._id}`) ? (
                            <div className='action-btn up-arrow-btn'>
                              <ChevronUp
                                className='up-arrow'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  categoryToggle(`${category._id}`);
                                  handleSidebar({
                                    ...currentFilter,
                                    category: singleElementRemoveFromArray(
                                      currentFilter?.category,
                                      category.value
                                    ),
                                  });
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className='action-btn down-arrow-btn'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSidebar({
                                  ...currentFilter,
                                  category: [
                                    ...(currentFilter?.category || []),
                                    category.value,
                                  ],
                                });
                                // clearTaskData();
                                categoryToggle(`${category._id}`);
                              }}
                            >
                              <ChevronDown className='down-arrow' />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <AccordionBody accordionId={`${category._id}`}>
                      {categoryOpen.includes(category?._id) && (
                        <CategorizeAccordianTask
                          currentTaskPaginationMain={currentTaskPaginationMain}
                          key={index}
                          initialContactData={initialContactData}
                          initialUserData={initialUserData}
                          currentFilter={currentFilter}
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
                          selectedCategory={category}
                          refreshCategoriesKey={refreshCatKey}
                          refreshCategories={refreshCategories}
                          category={category._id}
                          clearTasksData={clearTasksData}
                          categoryQuickAdd={categoryQuickAdd}
                          updateCategoryCounts={updateCategoryCounts}
                          updateTask={updateTask}
                          setUpdateTask={setUpdateTask}
                          handleClearAddUpdateTask={handleClearAddUpdateTask}
                          isPersistFilterAlreadySet={isPersistFilterAlreadySet}
                          setCurrentTaskPaginationMain={
                            setCurrentTaskPaginationMain
                          }
                          setTotalSnoozedTasks={setTotalSnoozedTasks}
                        />
                      )}
                    </AccordionBody>
                  </AccordionItem>
                );
              })}
          </Accordion>
        </Fragment>
      </InfiniteScroll>
    );
  };

  return <>{renderTasks()}</>;
};

export default CategorizeTasks;
