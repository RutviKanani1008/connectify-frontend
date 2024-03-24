// import _ from 'lodash';
import React, { memo } from 'react';
import _ from 'lodash';
import { Draggable } from 'react-beautiful-dnd';

import TasksListItem from './TasksListItem';
import { CellMeasurer } from 'react-virtualized';

const TasksListItemDraggable = React.forwardRef((props, ref) => {
  const { currentTasks, cache, index, style, parent } = props;

  const tasks = _.cloneDeep(currentTasks)
    .sort((a, b) => (b?.pinned || 0) - (a?.pinned || 0))
    ?.sort(({ snoozeDetail: a }, { snoozeDetail: b }) => !!a - !!b);

  const item = tasks[index];

  return (
    <CellMeasurer
      cache={cache}
      parent={parent}
      columnIndex={0}
      rowIndex={index}
    >
      {({ registerChild, measure }) => (
        <Draggable
          draggableId={item._id}
          index={index}
          key={item._id}
          style={{}}
          ref={ref}
          isDragDisabled={!!item.pinned}
        >
          {(provided) => (
            <div
              ref={(el) => {
                provided.innerRef(el);
                registerChild(el);
              }}
              {...provided.draggableProps}
              style={{
                userSelect: 'none',
                ...style,
                ...provided.draggableProps.style,
              }}
            >
              <TasksListItem
                {...props}
                item={item}
                index={index}
                measure={measure}
                provided={provided}
              />
            </div>
          )}
        </Draggable>
      )}
    </CellMeasurer>
  );
});

TasksListItemDraggable.displayName = 'TasksListItemDraggable';

export default memo(TasksListItemDraggable);
