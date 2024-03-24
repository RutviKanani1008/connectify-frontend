import React, { memo, useEffect, useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Spinner } from 'reactstrap';
import LaneHeader from '../../kanban-view/component/Board/LaneHeader';
import AddCard from './AddCard';
import ContactCard from './ContactCard';

const Column = ({
  stage,
  index,
  cardsLoading,
  viewCardDetails,
  onAddNewContact,
  loadMoreData,
  onEditStage,
  onDeleteStage,
}) => {
  // ** Custom Hooks **
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!cardsLoading && stage.cards.length === stage.total) {
      setHasMore(false);
    } else if (stage.total) {
      setHasMore(true);
    }
  }, [cardsLoading]);

  return (
    <Draggable draggableId={stage.id} index={index} key={stage.id}>
      {(provided) => (
        <div
          className='lane temp-board-column'
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <div {...provided.dragHandleProps}>
            <LaneHeader
              id={stage.id}
              stage={stage}
              onDeleteStage={onDeleteStage}
              onEditStage={onEditStage}
              title={stage.title}
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
                  hasMore={hasMore}
                  height={400}
                  loader={<Spinner />}
                >
                  {stage.cards.map((card, index) => (
                    <Draggable
                      key={card.id}
                      draggableId={card.id}
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
                            <ContactCard
                              viewCardDetails={viewCardDetails}
                              contactData={card}
                              stageId={stage.id}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </InfiniteScroll>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <AddCard stageId={stage.id} onAddNewContact={onAddNewContact} />
          {provided.placeholder}
        </div>
      )}
    </Draggable>
  );
};

export default memo(Column);
