import React, { useEffect, useState } from 'react';
import { Plus } from 'react-feather';
import { Button, CardBody, CardHeader, CardTitle, Col, Row } from 'reactstrap';
import { useGetSmsTemplates } from './hooks/useApis';
import SmsTemplateCard from '../../templates/components/SmsTemplateCard';
import UILoader from '@components/ui-loader';

const initialFilters = {
  limit: 9,
  page: 1,
  search: '',
  sort: null,
};
function SmsTemplateGridView({
  cloneTemplateDetails,
  setEditItem,
  setShowForm,
  handleConfirmDelete,
  sendTestSMS,
}) {
  const [smsTemplates, setSmsTemplates] = useState({
    results: [],
    total: 0,
  });
  const [currentFilters, setCurretFilters] = useState(initialFilters);

  const { getSmsTemplates: getSmsTemplatesApi, isLoading: smsTemplateLoading } =
    useGetSmsTemplates();

  useEffect(() => {
    getSmsTemplates(initialFilters);
  }, []);

  const getSmsTemplates = async (filter) => {
    try {
      setCurretFilters({
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      const { data } = await getSmsTemplatesApi({
        select: 'name,company,name,body',
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      setSmsTemplates({
        results: [...smsTemplates.results, ...data?.results] || [],
        total: data?.pagination?.total || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <CardHeader className='sms__templates__header'>
        <CardTitle tag='h4' className=''>
          SMS Templates
        </CardTitle>
        <Button
          className='ms-2'
          color='primary'
          onClick={() => {
            setShowForm(true);
          }}
        >
          <Plus size={15} />
          <span className='align-middle ms-50'>Add New</span>
        </Button>
      </CardHeader>
      <CardBody className='py-1'>
        <UILoader blocking={smsTemplateLoading}>
          <div
            className={`company-sms-inner-scroll hide-scrollbar ${
              currentFilters.limit * currentFilters.page < smsTemplates.total &&
              'load-more-active'
            }`}
          >
            <Row className='company-sms-temp-card-row'>
              {smsTemplates && smsTemplates.results.length > 0 ? (
                smsTemplates.results.map((item, key) => (
                  <Col className='company-sms-temp-card-col' md='4' key={key}>
                    <SmsTemplateCard
                      item={item}
                      cloneTemplateDetails={cloneTemplateDetails}
                      setEditItem={setEditItem}
                      setTemplateType={() => {}}
                      setShowForm={setShowForm}
                      handleConfirmDelete={handleConfirmDelete}
                      sendTestSMS={sendTestSMS}
                    />
                  </Col>
                ))
              ) : (
                <div className='d-flex justify-content-center m-4'>
                  <span className='no-data-found'>
                    {!smsTemplateLoading && 'No SMS template found!'}
                  </span>
                </div>
              )}
            </Row>
          </div>
          {currentFilters.limit * currentFilters.page < smsTemplates.total && (
            <div className='text-center loadMore-btn-wrapper'>
              <Button
                outline={true}
                color='primary'
                onClick={() => {
                  setCurretFilters({
                    ...currentFilters,
                    page: currentFilters.page + 1,
                  });
                  getSmsTemplates({
                    ...currentFilters,
                    page: currentFilters.page + 1,
                  });
                }}
              >
                Load More
              </Button>
            </div>
          )}
        </UILoader>
      </CardBody>
    </>
  );
}

export default SmsTemplateGridView;
