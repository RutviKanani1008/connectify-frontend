import classNames from 'classnames';
import { useState } from 'react';
import { Grid, List } from 'react-feather';
import { Button, ButtonGroup } from 'reactstrap';
import ChecklistTemplateList from '../../../templates/components/ChecklistTemplateList';

const ContactChecklistTab = ({ contactId, type = 'Contacts' }) => {
  // **state
  const [activeView, setActiveView] = useState('grid');

  return (
    <div className='contact__checklist__wrapper'>
      <div className='list-grid-btn-wrapper'>
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
      <ChecklistTemplateList
        activeView={activeView}
        type={type}
        contactId={contactId}
      />
    </div>
  );
};

export default ContactChecklistTab;
