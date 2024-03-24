import { Row } from 'reactstrap';
import Draggable from '../../../@core/components/draggable/Draggable';
import NoRecordFound from '../../../@core/components/data-table/NoRecordFound';
import { DraggableCard } from '../../../@core/components/draggable/DraggableCard';
import CheckListTemplateCard from './CheckListTemplateCard';
import { ChecklistDraggableTable } from './ChecklistDraggableTable';

export const ChecklistAccordianView = (props) => {
  const {
    activeView,
    checkListData,
    arrangeTheOrderOfDocument,
    moveActiveDocumentCard,
    handleConfirmClone,
    setChecklistId,
    handleConfirmDelete,
    setIsViewOnly,
    handlePrintIndividualChecklist,
    searchVal,
    tableColumns,
    tableData,
    onDragEnd,
    type,
  } = props;
  return (
    <>
      {activeView === 'grid' ? (
        <>
          <Row className='company-checklist-row'>
            <Draggable droppableId='droppable'>
              {checkListData && checkListData.length > 0 ? (
                checkListData?.map((item, key) => (
                  <DraggableCard
                    key={item._id}
                    index={key}
                    id={item._id}
                    arrangeTheOrderOfDocument={arrangeTheOrderOfDocument}
                    moveCard={moveActiveDocumentCard}
                    // archived={card.archived}
                  >
                    <CheckListTemplateCard
                      item={item}
                      handleConfirmClone={handleConfirmClone}
                      setChecklistId={setChecklistId}
                      handleConfirmDelete={handleConfirmDelete}
                      setIsViewOnly={setIsViewOnly}
                      handlePrintIndividualChecklist={
                        handlePrintIndividualChecklist
                      }
                      searchValue={searchVal}
                      type={type}
                    />
                  </DraggableCard>
                ))
              ) : (
                <NoRecordFound />
              )}
            </Draggable>
          </Row>
        </>
      ) : (
        <>
          {/* <Row className=''> */}
          <ChecklistDraggableTable
            tableColumns={tableColumns}
            tableData={tableData}
            onDragEnd={onDragEnd}
            searchValue={searchVal}
          />
          {/* </Row> */}
        </>
      )}
    </>
  );
};
