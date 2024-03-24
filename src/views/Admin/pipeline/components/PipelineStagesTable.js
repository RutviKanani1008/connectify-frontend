import React, { useState, useEffect, Fragment } from 'react';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Edit2, Eye, MoreVertical, Trash } from 'react-feather';
import { Input, UncontrolledTooltip } from 'reactstrap';
import { updateMemberContactStage } from '../../../../api/pipeline';

const PipelineStagesTable = ({
  currentPipeline,
  pipelineStages,
  setCurrentPipelineStages,
  stageContainContacts,
  handleEditStage,
  handleViewContacts,
  handleConfirmDelete,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [initalStages, setInitialStages] = useState([]);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setInitialStages(pipelineStages);
    const tempTableData = (pipelineStages || [])
      .map((stage) => {
        return {
          ...stage,
        };
      })
      .sort((a, b) => a.order - b.order);
    setTableData(tempTableData);
  }, [pipelineStages]);

  const tableColumns = [
    {
      name: 'Title',
      selector: (row) => row?.title,
    },
    {
      name: 'Code',
      selector: (row) => row?.code,
    },
    {
      name: 'Actions',
      cell: (stage) => (
        <div className='action-btn-wrapper'>
          <div className='action-btn edit-btn'>
            <Edit2
              size={15}
              className={
                !stageContainContacts(stage?._id)
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed'
              }
              id={`edit_${stage?._id}`}
              onClick={() => {
                if (!stageContainContacts(stage?._id)) handleEditStage(stage);
              }}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`edit_${stage?._id}`}
            >
              {stageContainContacts(stage?._id)
                ? 'Action not permited. This stage contain one or more Contacts'
                : 'Update'}
            </UncontrolledTooltip>
          </div>
          <div className='action-btn eye-btn'>
            <Eye
              size={15}
              className={'cursor-pointer'}
              id={`view_contacts_${stage?._id}`}
              onClick={() => handleViewContacts(stage)}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`view_contacts_${stage?._id}`}
            >
              {stage?.isExist
                ? 'Action not permited. This stage contain one or more Contacts'
                : 'View Contacts'}
            </UncontrolledTooltip>
          </div>
          <div className='action-btn delete-btn'>
            <Trash
              size={15}
              id={`delete_${stage?._id}`}
              color={!stageContainContacts(stage?._id) ? 'red' : 'red'}
              className={
                !stageContainContacts(stage?._id)
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed'
              }
              onClick={() => {
                if (!stageContainContacts(stage?._id))
                  handleConfirmDelete(stage);
              }}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`delete_${stage?._id}`}
            >
              {stageContainContacts(stage?._id)
                ? 'Action not permited. This stage contain one or more Contacts'
                : 'Delete'}
            </UncontrolledTooltip>
          </div>
        </div>
      ),
    },
  ];

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase().trim();

    const result = initalStages.filter((stage) => {
      return stage.title.toLowerCase().includes(value);
    });

    setSearchVal(e.target.value);
    setTableData(result);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const pipelineStages = Array.from(initalStages || []);
    const startIndex = pipelineStages.findIndex(
      (s) => s.order === result.source.index
    );
    const endIndex = pipelineStages.findIndex(
      (s) => s.order === result.destination.index
    );

    const [removed] = pipelineStages.splice(startIndex, 1);
    pipelineStages.splice(endIndex, 0, removed);

    const newPipelineStages = pipelineStages.map((stage, idx) => ({
      ...stage,
      order: idx,
    }));

    setInitialStages(newPipelineStages);
    updateMemberContactStage(currentPipeline.id, {
      stage: newPipelineStages,
    });

    // const filteredStages = newPipelineStages.filter((stage) => {
    //   return stage.title.toLowerCase().includes(searchVal.toLowerCase().trim());
    // });

    setCurrentPipelineStages([...newPipelineStages]);
    // setTableData(filteredStages);
  };

  return (
    <Fragment>
      <div className='search-box-wrapper'>
        <div className='form-element-icon-wrapper'>
          <svg version='1.1' id='Layer_1' x='0px' y='0px' viewBox='0 0 56 56'>
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
            placeholder='Search here...'
            className='dataTable-filter mb-50'
            type='text'
            bsSize='sm'
            id='search-input'
            value={searchVal}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className='pipeline-stages-table'>
        <div className='table-header'>
          <div className='table-row'>
            <div className='table-cell'></div>
            {tableColumns.map((column, index) => (
              <div className='table-cell' key={index}>
                {column.name}
              </div>
            ))}
          </div>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId='droppable'>
            {(provided) => (
              <div
                className='table-body'
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {tableData.map((row, rowId) => (
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
                          <div className='move-icon-wrapper'>
                            <MoreVertical
                              className='drag-icon'
                              onClick={(e) => e.stopPropagation()}
                            />
                            <MoreVertical
                              className='drag-icon'
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        {tableColumns.map((column) => (
                          <div
                            className='table-cell'
                            key={`${column.name}_${row._id}`}
                          >
                            {column?.cell?.(row) || column?.selector?.(row)}
                          </div>
                        ))}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </Fragment>
  );
};

export default PipelineStagesTable;
