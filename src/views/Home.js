import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  ButtonGroup,
  Button,
} from 'reactstrap';
import { Grid, List } from 'react-feather';
import classNames from 'classnames';
import { getCompany } from '../api/company';

const Home = () => {
  const [activeView, setActiveView] = useState('grid');

  const getCompanyNames = async () => {
    const companyName = await getCompany({ select: 'name,contactStages' });
    const company = [];
    const contactStage = [];
    companyName?.data?.data?.forEach((companyData) => {
      const obj = {};
      obj['value'] = companyData._id;
      obj['label'] = companyData.name;
      company.push(obj);

      const stage = {};
      stage[companyData._id] = companyData.contactStages;
      contactStage.push(stage);
    });
  };

  useEffect(() => {
    getCompanyNames();
  }, []);
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <ButtonGroup>
            <Button
              tag='label'
              className={classNames('btn-icon view-btn grid-view-btn', {
                active: activeView === 'grid',
              })}
              color='primary'
              outline
              onClick={() => setActiveView('grid')}
            >
              <List size={18} />
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
              <Grid size={18} />
            </Button>
          </ButtonGroup>
        </CardHeader>
        <CardBody></CardBody>
      </Card>
    </div>
  );
};

export default Home;
