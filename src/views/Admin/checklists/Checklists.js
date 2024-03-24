import React, { useState } from 'react';
import ChecklistTemplateList from '../../templates/components/ChecklistTemplateList';
import { Button, ButtonGroup, Card } from 'reactstrap';
import classNames from 'classnames';
import { Grid, List } from 'react-feather';

const Checklists = () => {
  const [activeView, setActiveView] = useState('grid');

  return (
    <>
      <div className='company-checklist-page-wrapper'>
        <div className='d-flex flex-wrap align-items-center justify-content-end tabbing-header-wrapper company-checklist-header'>
          <ButtonGroup className={''}>
            <Button
              tag='label'
              className={classNames('btn-icon view-btn grid-view-btn', {
                active: activeView === 'grid',
              })}
              color='primary'
              outline
              onClick={() => setActiveView('grid')}
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
              onClick={() => setActiveView('list')}
            >
              <List size={18} />
            </Button>
          </ButtonGroup>
        </div>
        <Card className='company-template-tab-card company-checklist'>
          <ChecklistTemplateList
            activeView={activeView}
            type={'ChecklistTemplate'}
          />
        </Card>
      </div>
    </>
  );
};

export default Checklists;
