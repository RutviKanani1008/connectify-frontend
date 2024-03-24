import { Card } from 'reactstrap';
import GroupView from '../../../@core/components/new-kanban-view/GroupView';

const ManageGroups = () => {
  return (
    <div
      className={`pipeline-page-wrapper pipeline-page-wrapper-new ${'kanban-view-active'}`}
    >
      <Card className={`pipeline-card pipeline-kanbanView-wrapper`}>
        <div className='rightCN full-width'>
          <GroupView defaultView='list' />
        </div>
      </Card>
    </div>
  );
};

export default ManageGroups;
