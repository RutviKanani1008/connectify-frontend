import React, { useEffect, useState } from 'react';
import UILoader from '@components/ui-loader';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { getCmsPageContent } from '../../../helper/cms.helper';

const Home = () => {
  const [currentPageContent, setCurrentPageContent] = useState(null);

  useEffect(() => {
    const pageContent = getCmsPageContent('dashboard');
    setCurrentPageContent(pageContent);
  }, []);

  return (
    <UILoader>
      <Card className='dashboard-page'>
        <CardTitle className='text-primary'>
          {currentPageContent?.title}
        </CardTitle>
        <CardBody>
          {currentPageContent ? (
            <div
              dangerouslySetInnerHTML={{ __html: currentPageContent.content }}
            ></div>
          ) : null}
        </CardBody>
      </Card>
    </UILoader>
  );
};

export default Home;
