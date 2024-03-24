/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

const TaskItem = ({ task, parentId, index, onDragEnd }) => {
  const [isOpen, setIsOpen] = useState(true);
  const droppableId = parentId ? `${parentId}-${task.id}` : `${task.id}`;

  return (
    <Draggable draggableId={droppableId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: 'none',
            padding: '5px',
            margin: '0 0 5px 0',
            color: snapshot.isDragging ? 'black' : 'white',
            background: snapshot.isDragging ? 'lightgreen' : 'grey',
            border: '1px solid black',
            borderRadius: '4px',
            ...provided.draggableProps.style,
          }}
        >
          {!parentId ? (
            <>
              <div onClick={() => setIsOpen((prev) => !prev)}>
                {task.content}
              </div>
              {isOpen && (
                <>
                  {task.subTasks && task.subTasks.length > 0 && (
                    <TaskList
                      tasks={task.subTasks}
                      parentId={task.id}
                      onDragEnd={onDragEnd}
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <div>{`=> ${task.content}`}</div>
          )}
        </div>
      )}
    </Draggable>
  );
};

const TaskList = ({ tasks, parentId, onDragEnd }) => {
  const droppableId = parentId ? `subtasks-${parentId}` : 'tasks';

  return (
    <Droppable
      isCombineEnabled
      droppableId={droppableId}
      type={'TASK'}
      direction='vertical'
    >
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={{
            background: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
            padding: '5px',
            border: '1px solid black',
            borderRadius: '4px',
            width: '100%',
          }}
        >
          {tasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              parentId={parentId}
              index={index}
              onDragEnd={onDragEnd}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

const App = () => {
  const [tasks, setTasks] = useState([
    { id: 'task-1', content: 'Task 1', subTasks: [] },
    {
      id: 'task-2',
      content: 'Task 2',
      subTasks: [
        { id: 'subtask-21', content: 'Subtask 2 1' },
        { id: 'subtask-22', content: 'Subtask 2 2' },
      ],
    },
    { id: 'task-3', content: 'Task 3', subTasks: [] },
    {
      id: 'task-4',
      content: 'Task 4',
      subTasks: [
        { id: 'subtask-41', content: 'Subtask 4 1' },
        { id: 'subtask-42', content: 'Subtask 4 2' },
      ],
    },
    { id: 'task-5', content: 'Task 5', subTasks: [] },
    { id: 'task-6', content: 'Task 6', subTasks: [] },
  ]);

  const onDragEnd = (result) => {
    console.log('HELLO END RESULT', result);

    const { source, destination, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newTasks = [...tasks];

    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'tasks') {
        const [removedTask] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, removedTask);
      }
      if (source.droppableId.includes('subtasks')) {
        const parentTaskId = source.droppableId.split('subtasks-')[1];
        const parentTask = newTasks.find((t) => t.id === parentTaskId);
        const [removedSubTask] = parentTask.subTasks.splice(source.index, 1);
        parentTask.subTasks.splice(destination.index, 0, removedSubTask);
      }
    } else {
      if (destination.droppableId === 'tasks') {
        const sParentTaskId = source.droppableId.split('subtasks-')[1];
        const sParentTask = newTasks.find((t) => t.id === sParentTaskId);

        const [removedSubTask] = sParentTask.subTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, removedSubTask);
      } else if (source.droppableId === 'tasks') {
        const dParentTaskId = destination.droppableId.split('subtasks-')[1];
        const dParentTask = newTasks.find((t) => t.id === dParentTaskId);
        const [removedSubTask] = newTasks.splice(source.index, 1);
        dParentTask.subTasks.splice(destination.index, 0, removedSubTask);
      } else {
        const sParentTaskId = source.droppableId.split('subtasks-')[1];
        const sParentTask = newTasks.find((t) => t.id === sParentTaskId);
        const dParentTaskId = destination.droppableId.split('subtasks-')[1];
        const dParentTask = newTasks.find((t) => t.id === dParentTaskId);

        const [removedSubTask] = sParentTask.subTasks.splice(source.index, 1);
        dParentTask.subTasks.splice(destination.index, 0, removedSubTask);
      }
    }

    // if (type === 'TASK') {
    //   const [removedTask] = newTasks.splice(source.index, 1);
    //   newTasks.splice(destination.index, 0, removedTask);
    // } else {
    //   const sourceTasks =
    //     source.droppableId === 'tasks'
    //       ? tasks
    //       : tasks.find((task) => task.id === source.droppableId).subTasks;
    //   const destinationTasks =
    //     destination.droppableId === 'tasks'
    //       ? tasks
    //       : tasks.find((task) => task.id === destination.droppableId).subTasks;

    //   const [removedTask] = sourceTasks.splice(source.index, 1);
    //   destinationTasks.splice(destination.index, 0, removedTask);
    // }

    setTasks(newTasks);
  };

  return (
    <div>
      <h1>Task List</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <TaskList tasks={tasks} onDragEnd={onDragEnd} />
      </DragDropContext>
    </div>
  );
};

export default App;

// ========================================================================
// ========================================================================

// /* eslint-disable react/no-find-dom-node */
// /* eslint-disable no-unused-vars */
// /* eslint-disable react/display-name */
// // @flow
// import React, { useEffect, useState } from 'react';
// import ReactDOM from 'react-dom';
// import 'react-virtualized/styles.css';
// import {
//   List,
//   InfiniteLoader,
//   AutoSizer,
//   WindowScroller,
//   CellMeasurerCache,
//   CellMeasurer,
// } from 'react-virtualized';
// import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
// import { Spinner } from 'reactstrap';

// const reorder = (list, startIndex, endIndex) => {
//   const result = Array.from(list);
//   const [removed] = result.splice(startIndex, 1);
//   result.splice(endIndex, 0, removed);
//   return result;
// };

// const cache = new CellMeasurerCache({
//   fixedWidth: true,
//   minHeight: 50,
//   defaultHeight: 50,
// });

// const getRowRender =
//   (args) =>
//   ({ key, index, style, parent }) => {
//     const { quotes } = args;
//     const quote = quotes[index];

//     return (
//       <CellMeasurer
//         key={key}
//         cache={cache}
//         parent={parent}
//         columnIndex={0}
//         rowIndex={index}
//       >
//         {({ registerChild, measure }) => (
//           <div style={style} className='row' ref={registerChild}>
//             <Draggable draggableId={quote.id} index={index} key={quote.id}>
//               {(provided, snapshot) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.draggableProps}
//                   {...provided.dragHandleProps}
//                   style={{ ...provided.draggableProps.style }}
//                 >
//                   <Row
//                     quote={quote}
//                     isDragging={snapshot.isDragging}
//                     measure={measure}
//                   />
//                 </div>
//               )}
//             </Draggable>
//           </div>
//         )}
//       </CellMeasurer>
//     );
//   };

// const Row = ({ quote, isDragging, measure }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     measure();
//   }, [isOpen]);

//   return (
//     <div>
//       <span
//         onClick={(e) => {
//           if (!isDragging) {
//             setIsOpen((prev) => !prev);
//           }
//         }}
//       >
//         {quote.content}
//       </span>

//       {isOpen && (
//         <div>
//           <Droppable droppableId={quote.id}>
//             {(provided) => (
//               <div {...provided.droppableProps} ref={provided.innerRef}>
//                 {[
//                   ...new Array(5).fill('GG').map((item, index) => (
//                     <Draggable
//                       key={`${quote.id}-${item}-${index}`}
//                       draggableId={`${quote.id}-${item}-${index}`}
//                       index={index}
//                     >
//                       {(provided) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           {...provided.dragHandleProps}
//                         >
//                           <h2 style={{ margin: 0 }}>
//                             {item}-{quote.id}-{index + 1}
//                           </h2>
//                         </div>
//                       )}
//                     </Draggable>
//                   )),
//                 ]}
//                 {provided.placeholder}
//               </div>
//             )}
//           </Droppable>
//         </div>
//       )}

//       {/* {isOpen && (
//         <div>
//           <Droppable droppableId={quote.id}>
//             {(provided) => (
//               <div {...provided.droppableProps} ref={provided.innerRef}>
//                 {quote.subtasks.map((subtask, index) => (
//                   <Draggable
//                     key={subtask.id}
//                     draggableId={subtask.id}
//                     index={index}
//                   >
//                     {(provided, snapshot) => (
//                       <div
//                         ref={provided.innerRef}
//                         {...provided.draggableProps}
//                         {...provided.dragHandleProps}
//                         style={{
//                           ...provided.draggableProps.style,
//                           opacity: snapshot.isDragging ? 0.5 : 1,
//                         }}
//                       >
//                         <h2 style={{ margin: 0 }}>{subtask.content}</h2>
//                       </div>
//                     )}
//                   </Draggable>
//                 ))}

//                 <Draggable
//                   draggableId={`new-subtask-${quote.id}`}
//                   index={quote.subtasks.length}
//                 >
//                   {(provided) => (
//                     <div
//                       ref={provided.innerRef}
//                       {...provided.draggableProps}
//                       {...provided.dragHandleProps}
//                     >
//                       <h2 style={{ margin: 0 }}>Add New Subtask</h2>
//                     </div>
//                   )}
//                 </Draggable>
//                 {provided.placeholder}
//               </div>
//             )}
//           </Droppable>
//         </div>
//       )} */}
//     </div>
//   );
// };

// function App() {
//   const [quotes, setQuotes] = useState([
//     {
//       id: '1',
//       content: 'Sometimes life is scary and dark',
//     },
//     {
//       id: '2',
//       content:
//         'Sucking at something is the first step towards being sorta good at something.',
//     },
//     {
//       id: '3',
//       content: "You got to focus on what's real, man",
//     },
//     {
//       id: '4',
//       content: 'Is that where creativity comes from? From sad biz?',
//     },
//     {
//       id: '5',
//       content: 'Homies help homies. Always',
//     },
//     {
//       id: '6',
//       content: 'Responsibility demands sacrifice',
//     },
//     {
//       id: '7',
//       content:
//         "That's it! The answer was so simple, I was too smart to see it!",
//     },
//     {
//       id: '8',
//       content:
//         "People make mistakes. It's all a part of growing up and you never really stop growing",
//     },
//     {
//       id: '9',
//       content:
//         "Don't you always call sweatpants 'give up on life pants,' Jake?",
//     },
//     {
//       id: '10',
//       content: 'I should not have drunk that much tea!',
//     },
//     {
//       id: '11',
//       content: 'Please! I need the real you!',
//     },
//     {
//       id: '12',
//       content: "Haven't slept for a solid 83 hours, but, yeah, I'm good.",
//     },
//   ]);

//   function onDragEnd(result) {
//     if (result) {
//       console.log('HELLO RESULT', result);
//       return;
//     }

//     if (!result.destination) {
//       return;
//     }
//     if (result.source.index === result.destination.index) {
//       return;
//     }

//     const newQuotes = reorder(
//       quotes,
//       result.source.index,
//       result.destination.index
//     );

//     setQuotes(newQuotes);
//   }

//   function isRowLoaded({ index }) {
//     return !!quotes[index];
//   }

//   const generateItems = (start, end) => {
//     const items = [];
//     for (let i = start; i <= end; i++) {
//       items.push({
//         id: `${i + 1}`,
//         content: `New Item ${i + 1}`,
//       });
//     }
//     return items;
//   };

//   const loadMoreRows = ({ stopIndex }) => {
//     if (stopIndex >= quotes.length - 1) {
//       // Load more rows when reaching the end of the list
//       const newItems = generateItems(quotes.length, quotes.length + 9);
//       setQuotes((prevItems) => [...prevItems, ...newItems]);
//     }
//   };

//   return (
//     <>
//       <div style={{ height: '500px', width: '600px' }}>
//         <DragDropContext onDragEnd={onDragEnd}>
//           <Droppable
//             droppableId='droppable'
//             mode='virtual'
//             type='COLUMN'
//             renderClone={(provided, snapshot, rubric) => (
//               <div
//                 ref={provided.innerRef}
//                 {...provided.draggableProps}
//                 {...provided.dragHandleProps}
//               >
//                 {quotes[rubric.source.index].content}
//               </div>
//             )}
//           >
//             {(droppableProvided) => (
//               <AutoSizer>
//                 {({ width, height }) => (
//                   <InfiniteLoader
//                     isRowLoaded={isRowLoaded}
//                     loadMoreRows={loadMoreRows}
//                     rowCount={1000}
//                     threshold={1}
//                   >
//                     {({ onRowsRendered, registerChild }) => (
//                       <>
//                         <List
//                           height={height}
//                           rowCount={quotes.length}
//                           deferredMeasurementCache={cache}
//                           rowHeight={cache.rowHeight}
//                           width={width}
//                           onRowsRendered={onRowsRendered}
//                           ref={(ref) => {
//                             if (ref) {
//                               const whatHasMyLifeComeTo =
//                                 ReactDOM.findDOMNode(ref);
//                               if (whatHasMyLifeComeTo instanceof HTMLElement) {
//                                 droppableProvided.innerRef(whatHasMyLifeComeTo);
//                               }
//                             }
//                             registerChild(ref);
//                           }}
//                           rowRenderer={getRowRender({ quotes })}
//                         />
//                         <div
//                           className='d-flex align-content-center justify-content-center py-2'
//                           style={{
//                             position: 'absolute',
//                             bottom: 0,
//                             left: 0,
//                             right: 0,
//                           }}
//                         >
//                           <Spinner />
//                         </div>
//                       </>
//                     )}
//                   </InfiniteLoader>
//                 )}
//               </AutoSizer>
//             )}
//           </Droppable>
//         </DragDropContext>
//       </div>
//     </>
//   );
// }

// export default App;
