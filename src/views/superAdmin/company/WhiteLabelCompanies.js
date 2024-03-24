import React from 'react';
import UILoader from '@components/ui-loader';
import { Card, CardBody, CardHeader, CardTitle } from 'reactstrap';
import ComingSoon from '../../../components/ComingSoon';

const WhiteLabelCompanies = () => {
  return (
    <UILoader blocking={false} loader={<></>}>
      <Card className='company-template-tab-card'>
        <CardHeader>
          <CardTitle tag='h4' className='text-primary'>
            White Label Companies
          </CardTitle>
        </CardHeader>
        <CardBody className='py-1'>
          <ComingSoon />
        </CardBody>
      </Card>
    </UILoader>
  );
};

export default WhiteLabelCompanies;
