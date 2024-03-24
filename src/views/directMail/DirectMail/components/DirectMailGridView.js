import React, { useEffect, useState } from 'react';
import { Plus } from 'react-feather';
import { Button, CardBody, CardHeader, CardTitle, Col, Row } from 'reactstrap';
import UILoader from '@components/ui-loader';
import DirectMailCard from './DirectMailCard';
import { useHistory } from 'react-router-dom';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { useGetDirectMail } from '../hooks/useApi';

const initialFilters = {
  limit: 9,
  page: 1,
  search: '',
  sort: null,
};
function DirectMailGridView({
  handleConfirmDelete,
  setShowDirectMailPreview,
  getSpecifTemplateContactsDetail,
  currentLoadingId,
}) {
  const [directMails, setDirectMails] = useState({
    results: [],
    total: 0,
  });
  const [currentFilters, setCurrentFilters] = useState(initialFilters);
  const history = useHistory();
  const { basicRoute } = useGetBasicRoute();

  const { getDirectMail, isLoading: fetching } = useGetDirectMail();

  useEffect(() => {
    getDirectMailFunc(initialFilters);
  }, []);

  const getDirectMailFunc = async (filter) => {
    try {
      setCurrentFilters({
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      const { data } = await getDirectMail({
        select: 'title,directMailTemplate,totalContacts',
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      setDirectMails({
        results: [...directMails.results, ...data?.results] || [],
        total: data?.pagination?.total || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className='directmail__listing__wrapper'>
      <CardHeader>
        <CardTitle tag='h4' className=''>
          Direct Mail
        </CardTitle>
        <Button
          className='ms-2'
          color='primary'
          onClick={() => {
            history.push(`${basicRoute}/direct-mail/add`);
          }}
        >
          <Plus size={15} />
          <span className='align-middle ms-50'>Add New</span>
        </Button>
      </CardHeader>
      <CardBody
        className={`hide-scrollbar ${
          currentFilters.limit * currentFilters.page < directMails.total &&
          'load-more-active'
        }`}
      >
        <UILoader blocking={fetching}>
          <div
            className={`company-email-inner-scroll hide-scrollbar ${
              currentFilters.limit * currentFilters.page < directMails.total &&
              'load-more-active'
            }`}
          >
            <Row className='company-email-temp-card-row'>
              {directMails && directMails.results.length > 0 ? (
                directMails.results.map((item, key) => (
                  <Col className='company-email-temp-card-col' md='4' key={key}>
                    <DirectMailCard
                      item={item}
                      getSpecifTemplateContactsDetail={
                        getSpecifTemplateContactsDetail
                      }
                      handleConfirmDelete={handleConfirmDelete}
                      setShowDirectMailPreview={setShowDirectMailPreview}
                      currentLoadingId={currentLoadingId}
                    />
                  </Col>
                ))
              ) : (
                <div className='d-flex justify-content-center m-4'>
                  <span className='no-data-found'>
                    {!fetching && 'No email template found!'}
                  </span>
                </div>
              )}
            </Row>
          </div>
        </UILoader>
      </CardBody>
      {currentFilters.limit * currentFilters.page < directMails.total && (
        <div className='text-center loadMore-btn-wrapper'>
          <Button
            outline={true}
            color='primary'
            onClick={() => {
              setCurrentFilters({
                ...currentFilters,
                page: currentFilters.page + 1,
              });
              getDirectMailFunc({
                ...currentFilters,
                page: currentFilters.page + 1,
              });
            }}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

export default DirectMailGridView;
