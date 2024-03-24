// ** Packages
import classNames from 'classnames';
import { Button, ButtonGroup } from 'reactstrap';
import { Grid, Menu, Plus } from 'react-feather';
import React, { useEffect, useState } from 'react';

// ** Hooks
import useGetGroups from './hooks/useGetGroups';
import useDeleteGroup from './hooks/useDeleteGroup';
import useGetGroupContacts from './hooks/useGetGroupContacts';
import useUpdateGroupStatus from './hooks/useUpdateGroupStatus';
import { useDraggable } from '../../data-table/hooks/useDragging';
import useGroupListingColumns from './hooks/useGroupListingColumns';

// ** Components
import NewKanBanView from '../index';
import AddEditGroup from './components/AddEditGroup';
import SortableTable from '../../data-table/SortableTable';
import ExportData from '../../../../components/ExportData';
import DeleteGroupModal from './components/DeleteGroupModal';
import RelatedContactsModal from '../StatusView/components/RelatedContactsModal';

const GroupView = ({ defaultView = 'kanban' }) => {
  // ** Vars **
  const moduleKey = 'group';

  // ** States **
  const [activeView, setActiveView] = useState(defaultView);
  const [refreshData, setRefreshData] = useState(true);
  const [modal, setModal] = useState({
    addEdit: false,
    delete: false,
    relatedContact: false,
    id: null,
    data: {},
  });

  const { groups, setGroups, stages, setStages, getGroups, loading } =
    useGetGroups();

  const { contactLoading, contacts, forms, getGroupContacts, remainingGroups } =
    useGetGroupContacts({ groups, handleDeleteGroup, setModal });

  const { updateGroupStatus } = useUpdateGroupStatus({ setGroups });

  const { deleteGroup, selectedNewGroup, setSelectedNewGroup } = useDeleteGroup(
    { contacts, forms, setModal, setRefreshData }
  );

  const { columns } = useGroupListingColumns({
    groups,
    onEditStage,
    onEditGroupStatus,
    onViewDeleteGroup,
  });

  const { onDragEnd, sortableHandle } = useDraggable({
    model: moduleKey,
    originalDataList: groups,
    setOriginalDataList: (newList) => setGroups(newList),
  });

  useEffect(() => {
    if (refreshData) {
      getGroups();
      setRefreshData(false);
    }
  }, [refreshData]);

  function onEditStage({ id }) {
    const tempData = groups.find((obj) => obj._id === id);
    setModal((prev) => ({ ...prev, addEdit: true, id, data: tempData }));
  }

  function onEditGroupStatus(...args) {
    updateGroupStatus(...args);
  }

  function onViewDeleteGroup(row, isDelete) {
    getGroupContacts({
      id: row._id,
      data: { ...row, id: row?._id, title: row?.groupName },
      ...(isDelete && { deleteGroup }),
    });
  }

  function handleDeleteGroup({ id, data }) {
    setModal((prev) => ({ ...prev, delete: true, id, data }));
  }

  return (
    <>
      <div className='pipeline-stage-kanban-view'>
        <div className='pipline-stage-kanban-view-header'>
          <h2 className='title'>Group</h2>
          <div className='right'>
            {activeView === 'list' && <ExportData model='group' />}
            <Button
              className=''
              color='primary'
              onClick={() =>
                setModal((prev) => ({ ...prev, addEdit: true, id: null }))
              }
            >
              <Plus size={15} />
              <span className='align-middle'>Add Group</span>
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
                  setActiveView('kanban');
                  setRefreshData(true);
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
                  setActiveView('list');
                  setRefreshData(true);
                }}
              >
                <Menu size={18} />
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <div className='pipline-stage-kanban-scroll'>
          <div className='cate-status-pipeline-wrapper'>
            {activeView === 'kanban' ? (
              <>
                {groups.length && stages.length ? (
                  <NewKanBanView
                    moduleKey={moduleKey}
                    moduleData={groups}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    stages={stages}
                    setStages={setStages}
                    getStages={getGroups}
                    onEditStage={onEditStage}
                    onDeleteStage={(data) => {
                      getGroupContacts({ ...data, deleteGroup });
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
                data={groups}
                onDragEnd={onDragEnd}
                title={'Group'}
                itemsPerPage={10}
                showHeader={false}
                hideButton
                ref={sortableHandle}
                hideExport={true}
              />
            )}
          </div>
        </div>
      </div>
      {modal.addEdit && (
        <AddEditGroup
          id={modal.id}
          data={modal.data}
          open={modal.addEdit}
          setOpen={(toggle) => {
            setModal((prev) => ({ ...prev, addEdit: toggle }));
          }}
          setRefreshData={setRefreshData}
        />
      )}
      {modal.delete && (
        <DeleteGroupModal
          forms={forms}
          contacts={contacts}
          group={modal.data}
          contactLoading={contactLoading}
          deleteGroup={deleteGroup}
          isOpen={modal.delete}
          remainingGroups={remainingGroups}
          selectedNewGroup={selectedNewGroup}
          setSelectedNewGroup={setSelectedNewGroup}
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

export default GroupView;
