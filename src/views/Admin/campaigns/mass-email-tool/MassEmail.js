// ==================== Packages =======================

import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';
import { useHistory } from 'react-router-dom';
import { Grid, Plus, List } from 'react-feather';
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardTitle,
  Col,
  Row,
  // Col,
  // Row,
  UncontrolledTooltip,
} from 'reactstrap';

// ====================================================
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { userData } from '../../../../redux/user';
import MassEmailList from './components/MassEmailList';
import ScheduledMassEmailList from './components/ScheduledMassEmailList';
import { SendGridApiKeyErrorPage } from './components/SendGridApiKeyErrorPage';

const MassEmail = () => {
  // ========================== Hooks =========================
  const history = useHistory();
  const user = useSelector(userData);
  const scheduledMassEmailListRef = useRef(null);

  // ============================== states ============================
  const [activeView, setActiveView] = useState('grid');

  // ========================== Custom Hooks =========================
  const { basicRoute } = useGetBasicRoute();

  const reFetchScheduledMassEmailJobs = () => {
    scheduledMassEmailListRef.current.getScheduledMailsForwardFun();
  };

  return (
    <>
      {user?.integration?.sendGrid?.apiKey ? (
        <div className='mass-email-blast-page'>
          <div className='mass-email-tool-header'>
            <div className='d-flex align-items-center justify-content-between'>
              <Button
                className=''
                color='primary'
                onClick={() => {
                  if (user.role === 'superadmin') {
                    history.push('/marketing/web-forms/add');
                  } else {
                    history.push(`${basicRoute}/mass-email/add`);
                  }
                }}
                id={`add-btn`}
              >
                <Plus size={15} />
                <span className='align-middle ms-50'>Add New</span>
              </Button>
              <UncontrolledTooltip placement='top' target={`add-btn`}>
                Create New Mass Email
              </UncontrolledTooltip>
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
          </div>
          <Row className='mass-email-tool-row mass-email-tool-row-list-view'>
            <Col
              className='mass-email-col'
              sm={6}
              md={6}
              xs={6}
              lg={6}
              xl={6}
              xxl={6}
            >
              <MassEmailList
                activeView={activeView}
                reFetchScheduledMassEmailJobs={reFetchScheduledMassEmailJobs}
              />
            </Col>
            <Col
              className='scheduled-mass-email-col'
              sm={6}
              md={6}
              xs={6}
              lg={6}
              xl={6}
              xxl={6}
            >
              <ScheduledMassEmailList
                activeView={activeView}
                ref={scheduledMassEmailListRef}
                reFetchScheduledMassEmailJobs={reFetchScheduledMassEmailJobs}
              />
            </Col>
          </Row>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle tag='h4' className='text-primary'>
                Mass Emails
              </CardTitle>
            </CardHeader>
            <SendGridApiKeyErrorPage />
          </Card>
        </>
      )}
    </>
  );
};

export default MassEmail;
