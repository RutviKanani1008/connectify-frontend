// ==================== Packages =======================
import React, { useState } from 'react';
import { Grid, List } from 'react-feather';
import { Button, ButtonGroup } from 'reactstrap';
import classnames from 'classnames';
// ====================================================
import TermsTemplate from './components/TermsTemplate';

const BillingTemplates = () => {
  const [activeView, setActiveView] = useState('grid');

  return (
    <>
      <div className='d-flex mt-md-0 mt-1 mb-1 justify-content-end'>
        <ButtonGroup className={'mx-1'}>
          <Button
            tag='label'
            className={classnames('btn-icon view-btn grid-view-btn', {
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
            className={classnames('btn-icon view-btn list-view-btn', {
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
      <TermsTemplate activeView={activeView} />
    </>
  );
};

export default BillingTemplates;
