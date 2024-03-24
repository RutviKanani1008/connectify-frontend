/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { getNewUpdatesCount } from '../../../api/profile';
import { setSidebarCount } from '../../../redux/common';
import { getCmsPageContent } from '../../../helper/cms.helper';

const Home = () => {
  const dispatch = useDispatch();
  const [currentPageContent, setCurrentPageContent] = useState(null);

  const getNewSidebarUpdates = async () => {
    const result = await getNewUpdatesCount();
    if (result.data.response_type !== 'error') {
      const updateCounts = result.data?.data || {};
      const supportTicketCount = updateCounts.reportProblem || 0;
      const featureRequestCount = updateCounts.featureRequest || 0;
      dispatch(
        setSidebarCount({
          supportTicket: supportTicketCount,
          featureRequest: featureRequestCount,
        })
      );
    }
  };

  useEffect(() => {
    getNewSidebarUpdates();
    const pageContent = getCmsPageContent('dashboard');
    setCurrentPageContent(pageContent);
  }, []);

  return (
    <div>
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
    </div>
  );
};

export default Home;
