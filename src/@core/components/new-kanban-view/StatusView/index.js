import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Grid, Menu, Plus } from 'react-feather';
import { Button, ButtonGroup } from 'reactstrap';
import React, { useEffect, useState } from 'react';

import useGetStatus from './hooks/useGetStatus';
import useGetContacts from './hooks/useGetContacts';
import useUpdateStatus from './hooks/useUpdateStatus';
import useDeleteStatus from './hooks/useDeleteStatus';
import { useDraggable } from '../../data-table/hooks/useDragging';
import useStatusListingColumns from './hooks/useStatusListingColumns';

import { userData } from '../../../../redux/user';

import NewKanBanView from '../index';
import { AddEditStatus } from './components/AddEditStatus';
import DeleteStatus from './components/DeleteStatus';
import SortableTable from '../../data-table/SortableTable';
import ExportData from '../../../../components/ExportData';
import RelatedContactsModal from './components/RelatedContactsModal';

const StatusView = ({
  group,
  groupSelect,
  setActiveView = () => {},
  activeView = 'kanban',
}) => {
  // ** Vars **
  const moduleKey = 'status';

  // ** Redux **
  const user = useSelector(userData);

  // ** State **
  const [refreshData, setRefreshData] = useState(true);
  const [modal, setModal] = useState({
    addEdit: false,
    delete: false,
    relatedContact: false,
    id: null,
    data: {},
  });

  // ** Custom Hooks **
  const { getStatus, status, setStatus, loading, setStages, stages } =
    useGetStatus({ user });
  const { columns } = useStatusListingColumns({
    status,
    onEditStage,
    onEditStatus,
    onViewDeleteStatus,
  });

  const { onDragEnd, sortableHandle } = useDraggable({
    originalDataList: status,
    setOriginalDataList: (newList) => {
      setStatus([...newList]);
    },
    model: 'status',
  });
  const { contactLoading, contacts, getContacts, remainingStatus } =
    useGetContacts({ group, handleDeleteStatus, setModal, user, status });

  const { updateStatus } = useUpdateStatus({ setStatus });

  const { deleteStatus, selectedNewStatus, setSelectedNewStatus } =
    useDeleteStatus({
      contacts,
      setModal,
      setRefreshData,
    });

  useEffect(() => {
    if (group?._id && refreshData) {
      getStatus({ groupId: group._id });
      setRefreshData(false);
    }
  }, [group, refreshData]);

  function onEditStage({ id }) {
    const tempData = status.find((obj) => obj._id === id);
    setModal((prev) => ({ ...prev, addEdit: true, id, data: tempData }));
  }

  function onEditStatus(args) {
    updateStatus(...args);
  }

  async function onViewDeleteStatus(row, isDelete) {
    getContacts({
      id: row._id,
      data: { ...row, id: row?._id, title: row?.statusName },
      ...(isDelete && { deleteStatus }),
    });
  }

  function handleDeleteStatus({ id, data }) {
    setModal((prev) => ({ ...prev, delete: true, id, data }));
  }

  return (
    <>
      <div className='pipeline-stage-kanban-view'>
        <div className='pipline-stage-kanban-view-header'>
          {groupSelect?.() || <h2 className='title'>Status Pipeline</h2>}
          <div className='right'>
            {activeView === 'list' && (
              <>
                {group && group._id !== 'unAssigned' && (
                  <ExportData model='status' query={{ groupId: group._id }} />
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
              <span className='align-middle'>Add Status</span>
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
                <NewKanBanView
                  stages={stages}
                  setStages={setStages}
                  loading={loading}
                  moduleData={status}
                  setRefreshData={setRefreshData}
                  refreshData={refreshData}
                  moduleKey={moduleKey}
                  group={group}
                  onEditStage={onEditStage}
                  onDeleteStage={(data) => {
                    getContacts({ ...data, deleteStatus });
                    setModal((prev) => ({ ...prev, delete: true }));
                  }}
                  getStages={getStatus}
                />
              ) : (
                <SortableTable
                  isLoading={loading}
                  columns={columns}
                  data={status}
                  onDragEnd={onDragEnd}
                  title={'Status'}
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
        <AddEditStatus
          setRefreshData={setRefreshData}
          data={modal.data}
          user={user}
          group={group}
          id={modal.id}
          open={modal.addEdit}
          setOpen={(toggle) => {
            setModal((prev) => ({ ...prev, addEdit: toggle }));
          }}
        />
      )}
      {modal.delete && (
        <DeleteStatus
          contacts={contacts}
          status={modal.data}
          contactLoading={contactLoading}
          deleteStatus={deleteStatus}
          isOpen={modal.delete}
          remainingStatus={remainingStatus}
          selectedNewStatus={selectedNewStatus}
          setIsOpen={(toggle) =>
            setModal((prev) => ({ ...prev, delete: toggle }))
          }
          setSelectedNewStatus={setSelectedNewStatus}
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

export default StatusView;
