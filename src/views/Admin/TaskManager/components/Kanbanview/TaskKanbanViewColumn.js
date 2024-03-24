import React, { memo } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Spinner } from 'reactstrap';

import TaskKanbanViewHeader from './TaskKanbanViewHeader';
import TaskKanbanViewTaskCard from './TaskKanbanViewTaskCard';
import { Plus } from 'react-feather';

const TaskKanbanViewColumn = ({
  stage,
  index,
  // cardsLoading,
  viewCardDetails,
  // onAddNewContact,
  loadMoreData,
  onEditStage,
  onDeleteStage,
  currentKanbanView,
  handleChangeParentModal,
  handleTaskDelete,
  handleUpdateTask,
  handleSnoozeTask,
  handleCompleteTask,
  handleSnoozeOffTasks,
  setShowTaskModal,
  setKanbanViewAddTaskDetails,
}) => {
  return (
    <Draggable draggableId={stage.id} index={index} key={stage.id}>
      {(provided) => (
        <div
          className='taskKanbanView-board-col'
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <div {...provided.dragHandleProps}>
            <TaskKanbanViewHeader
              id={stage.id}
              stage={stage}
              onDeleteStage={onDeleteStage}
              onEditStage={onEditStage}
              title={stage.title}
              currentKanbanView={currentKanbanView}
              handleAddNewTask={() => {
                //
                setShowTaskModal(true);
                setKanbanViewAddTaskDetails({
                  [currentKanbanView]: stage?.stageDetails,
                });
              }}
            />
          </div>
          <Droppable droppableId={stage.id}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className='lane-main'
              >
                <InfiniteScroll
                  dataLength={stage.cards.length}
                  next={() => loadMoreData(stage.id)}
                  hasMore={stage?.hasMoreContacts || false}
                  height={400}
                  loader={<Spinner />}
                >
                  {stage.cards.map((card, index) => (
                    <Draggable
                      key={card._id}
                      draggableId={card._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div
                            style={{ height: '100px' }}
                            className='card-main'
                          >
                            <TaskKanbanViewTaskCard
                              viewCardDetails={viewCardDetails}
                              taskData={card}
                              stageId={stage.id}
                              handleChangeParentModal={handleChangeParentModal}
                              handleTaskDelete={handleTaskDelete}
                              handleUpdateTask={handleUpdateTask}
                              handleSnoozeTask={handleSnoozeTask}
                              handleCompleteTask={handleCompleteTask}
                              handleSnoozeOffTasks={handleSnoozeOffTasks}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  <div
                    style={{ height: '100px' }}
                    className='card-main'
                    onClick={() => {
                      //
                      setShowTaskModal(true);
                      setKanbanViewAddTaskDetails({
                        [currentKanbanView]: stage?.stageDetails,
                      });
                    }}
                  >
                    <div className='cursor-pointer taskKanbanCard__box'>
                      <div className='text-center h5 mt-1 inner-wrapper-tc'>
                        <Plus
                          id='add_category_btn'
                          className='cursor-pointer'
                          size={14}
                        />
                        Add New Task
                      </div>
                    </div>
                  </div>
                </InfiniteScroll>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {provided.placeholder}
        </div>
      )}
    </Draggable>
  );
};

export default memo(TaskKanbanViewColumn);
