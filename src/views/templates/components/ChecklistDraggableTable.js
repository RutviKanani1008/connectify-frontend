import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { MoreVertical } from 'react-feather';
import NoRecordFound from '../../../@core/components/data-table/NoRecordFound';
import { highlightedString } from '../../../helper/common.helper';
// import { Table } from 'reactstrap';

export const ChecklistDraggableTable = (props) => {
  const { tableColumns, tableData, onDragEnd, searchValue } = props;
  return (
    <>
      <div className='checklist-list-view-table-wrapper'>
        <div className='checklist-list-view-table'>
          <div className='table-header'>
            <div className='table-row'>
              <div className='table-cell'></div>
              {tableColumns.map((column, index) => (
                <div className='table-cell' key={index}>
                  {column.columnName}
                </div>
              ))}
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId='droppable'>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className='table-body'
                >
                  {tableData?.length > 0 ? (
                    <>
                      {tableData.map((row, rowId) => (
                        <>
                          <Draggable
                            key={`sort-${rowId}`}
                            draggableId={`sort-${rowId}`}
                            index={row.order}
                          >
                            {(provided) => (
                              <div
                                className='table-row'
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className='table-cell'>
                                  <MoreVertical
                                    className='drag-icon'
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <MoreVertical
                                    className='drag-icon'
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                {(row.data || []).map((field, fieldId) => {
                                  if (fieldId === 0) {
                                    const highlightedHeader = highlightedString(
                                      field ? field : '',
                                      searchValue
                                    );
                                    return (
                                      <div
                                        className='table-cell'
                                        key={fieldId}
                                        dangerouslySetInnerHTML={{
                                          __html: highlightedHeader,
                                        }}
                                      ></div>
                                    );
                                  }
                                  return (
                                    <div className='table-cell' key={fieldId}>
                                      {field}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </Draggable>
                        </>
                      ))}
                    </>
                  ) : (
                    <>
                      <NoRecordFound />
                    </>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </>
  );
};
