import { useState, useEffect } from 'react';
import AddCriteriaModal from '../components/AddCriteriaModal';
import {
  useDeleteCriteria,
  useGetCriteriaAll,
  useReorderCriteria,
} from '../hooks/InventoryProductCriteriaApi';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Input,
  UncontrolledTooltip,
  Spinner,
} from 'reactstrap';
import { Edit2, MoreVertical, Plus, Trash } from 'react-feather';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';

const InventoryProductCriteria = () => {
  const [addModal, setAddModal] = useState({ id: null, toggle: false });
  const [currentCriteriaDetail, setCurrentCriteriaDetail] = useState({});
  const [initialData, setInitialData] = useState([]);
  const [productCriteriaList, setProductCriteriaList] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  const { deleteCriteria } = useDeleteCriteria();
  const tableColumns = [
    { columnName: 'Label' },
    { columnName: 'Type' },
    { columnName: 'Placeholder' },
    { columnName: 'Actions' },
  ];

  const { getCriteria, isLoading: getCriteriaLoading } = useGetCriteriaAll();
  const { reOrderCriteria } = useReorderCriteria();

  useEffect(() => {
    getRecords();
  }, []);

  const handelAddNewItem = () => {
    setCurrentCriteriaDetail({});
    setAddModal({ toggle: true });
  };

  const getRecords = async () => {
    const { data } = await getCriteria();
    setProductCriteriaList(data?.sort(({ order: a }, { order: b }) => a - b));
    setInitialData(data?.sort(({ order: a }, { order: b }) => a - b));
  };
  const handleDelete = async (id = null) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Criteria?',
    });

    if (result.value) {
      const { error } = await deleteCriteria(id, 'Delete Criteria..');
      if (!error) {
        getRecords();
      }
    }
  };
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const critera = Array.from(productCriteriaList || []);
    const startIndex = critera.findIndex(
      (s) => s.order === result.source.index
    );
    const endIndex = critera.findIndex(
      (s) => s.order === result.destination.index
    );

    const [removed] = critera.splice(startIndex, 1);
    critera.splice(endIndex, 0, removed);

    const newCriteria = critera.map((stage, idx) => ({
      ...stage,
      order: idx,
    }));
    setProductCriteriaList(newCriteria);
    await reOrderCriteria(newCriteria);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  const handleFilter = () => {
    const value = searchValue;
    const filteredItems = JSON.parse(
      JSON.stringify(productCriteriaList)
    ).filter((item) =>
      JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
    );
    setProductCriteriaList(value.length > 0 ? filteredItems : initialData);
  };

  useEffect(() => {
    handleFilter();
  }, [searchValue]);

  return (
    <>
      {getCriteriaLoading ? (
        <div className='d-flex align-items-center justify-content-center loader'>
          <Spinner />
        </div>
      ) : (
        <Card className='rdt_Table_Card'>
          <CardHeader className='card-header-with-buttons'>
            <CardTitle tag='h4' className='title'>
              Product Criteria
            </CardTitle>
            <div className='d-inline-flex justify-content-end'>
              <Button
                className='add-btn'
                color='primary'
                onClick={handelAddNewItem}
              >
                <Plus size={15} />
                <span className='align-middle ms-50'>Add Criteria</span>
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className='search-box-wrapper'>
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
                  className='dataTable-filter mb-50'
                  placeholder='Search Criteria'
                  type='text'
                  bsSize='sm'
                  id='search-input'
                  value={searchValue}
                  onChange={handleSearch}
                />
              </div>
            </div>  
            {productCriteriaList?.length > 0 ?
              <div className='criteria-view-table'>
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
                        {productCriteriaList?.length > 0 ? (
                          <>
                            {productCriteriaList.map((row, rowId) => (
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
                                      <div className='table-cell'>
                                        <span className='cursor-pointer'>
                                          {row?.label}
                                        </span>
                                      </div>
                                      <div className='table-cell'>
                                        <span className='cursor-pointer'>
                                          {row?.type.label}
                                        </span>
                                      </div>
                                      <div className='table-cell'>
                                        <span className='cursor-pointer'>
                                          {row?.placeholder}
                                        </span>
                                      </div>
                                      <div className='table-cell'>
                                        <div className='action-btn-wrapper'>
                                          <div className='action-btn edit-btn'>
                                            <Edit2
                                              size={15}
                                              className='cursor-pointer'
                                              onClick={() => {
                                                setCurrentCriteriaDetail(row);
                                                if (setAddModal) {
                                                  setAddModal({
                                                    id: row?._id,
                                                    toggle: true,
                                                  });
                                                }
                                              }}
                                              id={`edit_${row?._id}`}
                                            ></Edit2>
                                            <UncontrolledTooltip
                                              placement='top'
                                              target={`edit_${row?._id}`}
                                            >
                                              Edit
                                            </UncontrolledTooltip>
                                          </div>
                                          <div className='action-btn edit-btn'>
                                            <Trash
                                              color='red'
                                              size={15}
                                              className='cursor-pointer'
                                              onClick={() =>
                                                handleDelete(row?._id)
                                              }
                                              id={`delete_${row?._id}`}
                                            ></Trash>
                                            <UncontrolledTooltip
                                              placement='top'
                                              target={`delete_${row?._id}`}
                                            >
                                              Delete
                                            </UncontrolledTooltip>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              </>
                            ))}
                          </>
                        ) : null}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div> :
              <NoRecordFound/>
            }    
          </CardBody>
        </Card>
      )}
      {addModal.toggle && (
        <AddCriteriaModal
          addModal={addModal}
          setAddModal={setAddModal}
          getCriteria={getRecords}
          setCurrentCriteriaDetail={setCurrentCriteriaDetail}
          currentCriteriaDetail={currentCriteriaDetail}
        />
      )}
    </>
  );
};
export default InventoryProductCriteria;
