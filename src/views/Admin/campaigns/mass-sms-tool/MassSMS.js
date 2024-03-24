// ==================== Packages =======================
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
import { Grid, Plus, List } from 'react-feather';
import { Button, ButtonGroup, Col, Row} from 'reactstrap';

// ====================================================
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import MassSMSList from '../mass-sms-tool/components/MassSMSList';
import ScheduledMassSMSList from '../mass-sms-tool/components/ScheduledMassSMSList';

const MassSMS = () => {
  // ========================== Hooks =========================
  const history = useHistory();
  const scheduledMassSMSListRef = useRef(null);

  // ============================== states ============================
  const [activeView, setActiveView] = useState('grid');

  // ========================== Custom Hooks =========================
  const { basicRoute } = useGetBasicRoute();

  const reFetchScheduledMassSMSJobs = () => {
    scheduledMassSMSListRef.current.getScheduledSMSListForwardFun();
  };

  return (
    <>
      <div className='mass-sms-blast-page'>
        <div className='mass-sms-blast-header'>
          <Button
            className='add-new-btn'
            color='primary'
            onClick={() => {
              history.push(`${basicRoute}/mass-sms/add`);
            }}
            id={`add-btn`}
          >
            <Plus size={15} />
            <span className='align-middle ms-50'>Add New</span>
          </Button>
          <ButtonGroup>
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
        <Row className='mass-email-row'>
          <Col md="6" className='mass-sms-col'>
            <MassSMSList
              activeView={activeView}
              reFetchScheduledMassSMSJobs={reFetchScheduledMassSMSJobs}
            />
          </Col>
          <Col md="6" className='schedule-mass-sms-col'>
            <ScheduledMassSMSList
              activeView={activeView}
              ref={scheduledMassSMSListRef}
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default MassSMS;
