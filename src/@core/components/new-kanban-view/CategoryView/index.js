/* Packages */
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import { Grid, Menu, Plus } from 'react-feather';

/* Hooks */
import useGetCategory from './hooks/useGetCategory';
import useDeleteCategory from './hooks/useDeleteCategory';
import useUpdateCategoryStatus from './hooks/useUpdateCategoryStatus';
import useCategoryListingColumns from './hooks/useCategoryListingColumns';
import { useDraggable } from '../../data-table/hooks/useDragging';

/* Components */
import NewKanBanView from '../index';
import AddEditCategory from './components/AddEditCategory';
import DeleteCategory from './components/DeleteCategory';
import useGetCategoryContacts from './hooks/useGetCategoryContacts';
import RelatedContactsModal from '../StatusView/components/RelatedContactsModal';
import ExportData from '../../../../components/ExportData';
import SortableTable from '../../data-table/SortableTable';

const CategoryView = ({
  group,
  groupSelect,
  setActiveView = () => {},
  activeView = 'kanban',
}) => {
  // ** Vars **
  const moduleKey = 'category';

  // ** States **
  const [refreshData, setRefreshData] = useState(true);
  const [modal, setModal] = useState({
    addEdit: false,
    delete: false,
    relatedContact: false,
    id: null,
    data: {},
  });

  // ** Custom Hooks **
  const { category, setCategory, stages, setStages, getCategories, loading } =
    useGetCategory();

  const { contactLoading, contacts, getCategoryContacts, remainingCategory } =
    useGetCategoryContacts({
      group,
      handleDeleteCategory,
      setModal,
      category,
    });

  const { updateCategoryStatus } = useUpdateCategoryStatus({ setCategory });

  const { deleteCategory, selectedNewCategory, setSelectedNewCategory } =
    useDeleteCategory({ contacts, setModal, setRefreshData });

  const { columns } = useCategoryListingColumns({
    category,
    onEditStage,
    onEditCategoryStatus,
    onViewDeleteCategory,
  });

  const { onDragEnd, sortableHandle } = useDraggable({
    model: moduleKey,
    originalDataList: category,
    setOriginalDataList: (newList) => setCategory(newList),
  });

  useEffect(() => {
    if (group?._id && refreshData) {
      getCategories({ groupId: group._id });
      setRefreshData(false);
    }
  }, [group, refreshData]);

  function onEditStage({ id }) {
    const tempData = category.find((obj) => obj._id === id);
    setModal((prev) => ({ ...prev, addEdit: true, id, data: tempData }));
  }

  function onEditCategoryStatus(...args) {
    updateCategoryStatus(...args);
  }

  function onViewDeleteCategory(row, isDelete) {
    getCategoryContacts({
      id: row._id,
      data: { ...row, id: row?._id, title: row?.categoryName },
      ...(isDelete && { deleteCategory }),
    });
  }

  function handleDeleteCategory({ id, data }) {
    setModal((prev) => ({ ...prev, delete: true, id, data }));
  }

  return (
    <>
      <div className='pipeline-stage-kanban-view'>
        <div className='pipline-stage-kanban-view-header'>
          {groupSelect?.() || <h2 className='title'>Category Pipeline</h2>}
          <div className='right'>
            {activeView === 'list' && (
              <>
                {group && group._id !== 'unAssigned' && (
                  <ExportData model='category' query={{ groupId: group._id }} />
                )}
              </>
            )}
            <Button
              className=''
              color='primary'
              onClick={() =>
                setModal((prev) => ({ ...prev, addEdit: true, id: null }))
              }
            >
              <Plus size={15} />
              <span className='align-middle'>Add Category</span>
            </Button>
            <ButtonGroup className='list-grid-view-group'>
              <Button
                tag='label'
                className={classNames('btn-icon view-btn grid-view-btn', {
                  active: activeView === 'kanban',
                })}
                color='primary'
                outline
                onClick={() => {
                  if (activeView !== 'kanban') {
                    setActiveView('kanban');
                    setRefreshData(true);
                  }
                }}
              >
                <Grid size={18} />
              </Button>
              <Button
                tag='label'
                className={classNames('btn-icon view-btn list-view-btn', {
                  active: activeView === 'list',
                })}
                color='primary'
                outline
                onClick={() => {
                  if (activeView !== 'list') {
                    setActiveView('list');
                    setRefreshData(true);
                  }
                }}
              >
                <Menu size={18} />
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <div className='pipline-stage-kanban-scroll'>
          <div className='cate-status-pipeline-wrapper'>
            {group?._id &&
              (activeView === 'kanban' ? (
                <>
                  {category.length && stages.length ? (
                    <NewKanBanView
                      group={group}
                      moduleKey={moduleKey}
                      moduleData={category}
                      refreshData={refreshData}
                      setRefreshData={setRefreshData}
                      stages={stages}
                      setStages={setStages}
                      getStages={getCategories}
                      onEditStage={onEditStage}
                      onDeleteStage={(data) => {
                        getCategoryContacts({ ...data, deleteCategory });
                        setModal((prev) => ({ ...prev, delete: true }));
                      }}
                      loading={loading}
                    />
                  ) : null}
                </>
              ) : (
                <SortableTable
                  isLoading={loading}
                  columns={columns}
                  data={category}
                  onDragEnd={onDragEnd}
                  title={'Category'}
                  itemsPerPage={10}
                  showHeader={false}
                  hideButton
                  ref={sortableHandle}
                  hideExport={true}
                />
              ))}
          </div>
        </div>
      </div>
      {modal.addEdit && (
        <AddEditCategory
          id={modal.id}
          group={group}
          data={modal.data}
          open={modal.addEdit}
          setOpen={(toggle) => {
            setModal((prev) => ({ ...prev, addEdit: toggle }));
          }}
          setRefreshData={setRefreshData}
        />
      )}

      {modal.delete && (
        <DeleteCategory
          contacts={contacts}
          category={modal.data}
          contactLoading={contactLoading}
          deleteCategory={deleteCategory}
          isOpen={modal.delete}
          remainingCategory={remainingCategory}
          selectedNewCategory={selectedNewCategory}
          setSelectedNewCategory={setSelectedNewCategory}
          setIsOpen={(toggle) =>
            setModal((prev) => ({ ...prev, delete: toggle }))
          }
        />
      )}
      {modal.relatedContact && (
        <RelatedContactsModal
          isOpen={modal.relatedContact}
          setIsOpen={(toggle) =>
            setModal((prev) => ({ ...prev, relatedContact: toggle }))
          }
          contacts={contacts}
          contactLoading={contactLoading}
        />
      )}
    </>
  );
};

export default CategoryView;
