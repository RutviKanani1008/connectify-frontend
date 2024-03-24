import { Button, ButtonGroup } from 'reactstrap';
import classnames from 'classnames';

const ArchiveAndActiveTab = ({
  title = true,
  setCurrentTab,
  currentTab,
  tableRef,
}) => {
  return (
    <ButtonGroup className={`contact-archive-tab ${title ? 'cml' : ''}`}>
      <Button
        tag='label'
        className={classnames('btn-icon view-btn grid-view-btn', {
          active: currentTab === 'active',
        })}
        color='primary'
        outline
        onClick={() => {
          if (currentTab !== 'active') {
            setCurrentTab('active');
            tableRef?.current?.refreshTable({
              filterArgs: { archived: false },
              reset: true,
            });
          }
        }}
      >
        Active
      </Button>
      <Button
        tag='label'
        className={classnames('btn-icon view-btn list-view-btn', {
          active: currentTab === 'archive',
        })}
        color='primary'
        outline
        onClick={() => {
          if (currentTab !== 'archive') {
            setCurrentTab('archive');
            tableRef?.current?.refreshTable({
              filterArgs: { archived: true },
              reset: true,
            });
          }
        }}
      >
        Archived
      </Button>
    </ButtonGroup>
  );
};
export const ArchiveActiveAndUnsubscribeTab = ({
  title = true,
  currentGroup,
  setCurrentTab,
  currentTab,
  tableRef,
}) => {
  const groupFilter = {
    'group.id': currentGroup?.value ? currentGroup.value : undefined,
  };

  return (
    <ButtonGroup className={`horizontal-button-tab ${title ? 'cml' : ''}`}>
      <Button
        tag='label'
        className={classnames('btn-icon view-btn grid-view-btn', {
          active: currentTab === 'active',
        })}
        color='primary'
        outline
        onClick={() => {
          if (currentTab !== 'active') {
            setCurrentTab('active');
            tableRef?.current?.refreshTable({
              filterArgs: { ...groupFilter, archived: false },
              reset: true,
            });
          }
        }}
      >
        Active
      </Button>
      <Button
        tag='label'
        className={classnames('btn-icon view-btn list-view-btn', {
          active: currentTab === 'archive',
        })}
        color='primary'
        outline
        onClick={() => {
          if (currentTab !== 'archive') {
            setCurrentTab('archive');
            tableRef?.current?.refreshTable({
              filterArgs: { ...groupFilter, archived: true },
              reset: true,
            });
          }
        }}
      >
        Archived
      </Button>
      <Button
        tag='label'
        className={classnames('btn-icon view-btn border-left-0 list-view-btn', {
          active: currentTab === 'unsubscribed',
        })}
        color='primary'
        outline
        onClick={() => {
          if (currentTab !== 'unsubscribed') {
            setCurrentTab('unsubscribed');
            tableRef?.current?.refreshTable({
              filterArgs: { ...groupFilter, hasUnsubscribed: true },
              reset: true,
            });
          }
        }}
      >
        Unsubscribed
      </Button>
    </ButtonGroup>
  );
};

export default ArchiveAndActiveTab;
