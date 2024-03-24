/* Packages */
import { useState } from 'react';
import { Card } from 'reactstrap';

/* Services */
import useGroupService from './hooks/useGroupService';

/* Constants */
import { PIPELINE_TYPE } from './constant/index';

/* Components */
import GroupsList from './components/GroupsList/index';
import StatusView from '../../../@core/components/new-kanban-view/StatusView/index';
import CategoryView from '../../../@core/components/new-kanban-view/CategoryView/index';
import useCustomPipelineService from './hooks/useCustomPipelineService';
import CustomView from '../../../@core/components/new-kanban-view/CustomView';
import AddOrUpdatePipeline from './components/AddorUpdatePipeline1';
import GroupView from '../../../@core/components/new-kanban-view/GroupView';

const Pipeline = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [pipelineType, setPipelineType] = useState(PIPELINE_TYPE.GROUP);
  const [modal, setModal] = useState({ pipeline: false, id: null, data: {} });
  const [activeView, setActiveView] = useState('kanban');

  const {
    currentGroup,
    setCurrentGroup,
    availableGroups,
    isLoading: groupLoading,
  } = useGroupService();

  const {
    currentPipeline,
    setCurrentPipeline,
    availablePipelines,
    setAvailablePipelines,
    isLoading: pipelineLoading,
    onDeletePipeline,
  } = useCustomPipelineService({ currentGroup, pipelineType });

  const onAddUpdatePipelineSuccess = ({ pipeline, isNew }) => {
    if (isNew) {
      setAvailablePipelines((prev) => [pipeline, ...prev]);
      setPipelineType(PIPELINE_TYPE.CUSTOM);
      setCurrentPipeline(pipeline);
    } else {
      setAvailablePipelines((prev) =>
        prev.map((p) => (p._id === modal.id ? pipeline : p))
      );
    }
  };

  return (
    <>
      <div
        className={`pipeline-page-wrapper pipeline-page-wrapper-new ${'kanban-view-active'}`}
      >
        <Card
          className={`pipeline-card pipeline-kanbanView-wrapper ${
            sidebarCollapsed ? '' : 'open-sidebar'
          }`}
        >
          <div className='left-sidebar'>
            <GroupsList
              currentGroup={currentGroup}
              setCurrentGroup={setCurrentGroup}
              availableGroups={availableGroups}
              groupLoading={groupLoading}
              pipelineType={pipelineType}
              setPipelineType={setPipelineType}
              pipelineLoading={pipelineLoading}
              currentPipeline={currentPipeline}
              setCurrentPipeline={setCurrentPipeline}
              availablePipelines={availablePipelines}
              setSidebarCollapsed={setSidebarCollapsed}
              onAddEditPipeline={({ id = null, data = {} } = {}) => {
                setModal({ id, data, pipeline: true });
              }}
              onDeletePipeline={onDeletePipeline}
            />
          </div>
          <div className='rightCN pipeline-custom-margin'>
            {pipelineType === PIPELINE_TYPE.GROUP && <GroupView />}
            {pipelineType === PIPELINE_TYPE.CATEGORY && (
              <CategoryView
                group={currentGroup}
                activeView={activeView}
                setActiveView={setActiveView}
              />
            )}
            {pipelineType === PIPELINE_TYPE.STATUS && (
              <StatusView
                group={currentGroup}
                activeView={activeView}
                setActiveView={setActiveView}
              />
            )}
            {pipelineType === PIPELINE_TYPE.CUSTOM && (
              <CustomView
                group={currentGroup}
                currentPipeline={currentPipeline}
                activeView={activeView}
                setActiveView={setActiveView}
              />
            )}
          </div>
        </Card>
      </div>

      {modal.pipeline && (
        <AddOrUpdatePipeline
          id={modal.id}
          data={modal.data}
          currentGroup={currentGroup}
          open={modal.pipeline}
          setOpen={(toggle) => {
            setModal((prev) => ({ ...prev, pipeline: toggle }));
          }}
          onSuccess={onAddUpdatePipelineSuccess}
        />
      )}
    </>
  );
};

export default Pipeline;
