/* Packages */
import classNames from 'classnames';
import { Button, ButtonGroup } from 'reactstrap';
import { Grid, Menu, Plus } from 'react-feather';
import React, { useState, useEffect } from 'react';

/* Hooks */
import useDeleteStage from './hooks/useDeleteStage';
import { useDraggable } from '../../data-table/hooks/useDragging';
import useGetCustomPipelineStages from './hooks/useGetCustomPipelineStages';
import useCustomPipelineStagesColumns from './hooks/useCustomPipelineStagesColumns';
import useGetCustomPipelineStagesContacts from './hooks/useGetCustomPipelineStagesContacts';

/* Components */
import NewKanBanView from '../index';
import SortableTable from '../../data-table/SortableTable';
import AddEditCustomPipelineStage from './components/AddEditCustomPipelineStage';
import RelatedContactsModal from '../StatusView/components/RelatedContactsModal';

const CustomView = ({
  group,
  currentPipeline,
  setActiveView = () => {},
  activeView = 'kanban',
}) => {
  // ** Vars **
  const moduleKey = 'pipeline';

  // ** States **
  const [refreshData, setRefreshData] = useState(false);
  const [modal, setModal] = useState({
    addEdit: false,
    delete: false,
    relatedContact: false,
    id: null,
    data: {},
  });

  const {
    stages,
    setStages,
    pipelineStages,
    setPipelineStages,
    getPipelineStages,
    loading,
  } = useGetCustomPipelineStages();

  const { columns } = useCustomPipelineStagesColumns({
    onEditStage,
    onDeleteStage,
    onViewStageContacts,
    pipelineStages,
  });

  const { onDragEnd, sortableHandle } = useDraggable({
    model: moduleKey,
    customPipeline: currentPipeline,
    originalDataList: pipelineStages,
    setOriginalDataList: (newList) => setPipelineStages(newList),
  });

  const { getContacts, contacts, contactLoading } =
    useGetCustomPipelineStagesContacts({ group });

  const { deleteStage } = useDeleteStage({
    currentPipeline,
    pipelineStages,
    setRefreshData,
  });

  useEffect(() => {
    if (group?._id) {
      if (!currentPipeline) {
        setPipelineStages([]);
        return setStages([]);
      }
      getPipelineStages({
        groupId: group._id,
        pipelineId: currentPipeline._id,
      });
      setRefreshData(false);
    }
  }, [group, currentPipeline, refreshData]);

  function onEditStage({ id }) {
    const tempData = pipelineStages.find((obj) => obj._id === id);
    setModal((prev) => ({ ...prev, addEdit: true, id, data: tempData }));
  }

  function onViewStageContacts({ id }) {
    getContacts({ id });
    setModal((prev) => ({ ...prev, relatedContact: true, id, data: {} }));
  }

  function onDeleteStage({ id }) {
    const tempData = stages.find((obj) => obj.id === id);
    deleteStage({ id, data: tempData });
  }

  return (
    <>
      <div className='pipeline-stage-kanban-view'>
        <div className='pipline-stage-kanban-view-header'>
          <h2 className='title'>Pipeline Stages</h2>
          <div className='right'>
            <Button
              className=''
              color='primary'
              onClick={() =>
                setModal((prev) => ({ ...prev, addEdit: true, id: null }))
              }
            >
              <Plus size={15} />
              <span className='align-middle'>Add Stage</span>
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
            {group?._id &&
              (activeView === 'kanban' ? (
                <>
                  {pipelineStages.length && stages.length ? (
                    <NewKanBanView
                      customPipeline={currentPipeline}
                      group={group}
                      moduleKey={moduleKey}
                      moduleData={pipelineStages}
                      refreshData={refreshData}
                      setRefreshData={setRefreshData}
                      stages={stages}
                      setStages={setStages}
                      getStages={getPipelineStages}
                      onEditStage={onEditStage}
                      onDeleteStage={deleteStage}
                      loading={loading}
                    />
                  ) : null}
                </>
              ) : (
                <SortableTable
                  isLoading={loading}
                  columns={columns}
                  data={pipelineStages}
                  onDragEnd={onDragEnd}
                  title={'Stages'}
                  itemsPerPage={10}
                  showBackButton={false}
                  hideButton
                  ref={sortableHandle}
                  hideExport={true}
                />
              ))}
          </div>
        </div>
      </div>

      {modal.addEdit && (
        <AddEditCustomPipelineStage
          id={modal.id}
          data={modal.data}
          open={modal.addEdit}
          setOpen={(toggle) =>
            setModal((prev) => ({ ...prev, addEdit: toggle }))
          }
          currentPipeline={currentPipeline}
          pipelineStages={pipelineStages}
          setRefreshData={setRefreshData}
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

export default CustomView;
