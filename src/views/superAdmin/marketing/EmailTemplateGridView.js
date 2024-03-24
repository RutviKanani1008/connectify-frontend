import React, { useEffect, useState } from 'react';
import { Button, Col, Row } from 'reactstrap';
import EmailTemplateCard from '../../templates/components/EmailTemplateCard';
import { useGetEmailTemplates } from './hooks/useApis';
import UILoader from '@components/ui-loader';

const initialFilters = {
  limit: 9,
  page: 1,
  search: '',
  sort: null,
};
function EmailTemplateGridView({
  openPreview,
  cloneTemplateDetails,
  setEditItem,
  setShowForm,
  handleConfirmDelete,
  sendTestMail,
  currentFolder,
}) {
  const [emailTemplates, setEmailTemplates] = useState({
    results: [],
    total: 0,
  });
  const [currentFilters, setCurretFilters] = useState(initialFilters);

  const { getEmailTemplates: getEmailTemplatesApi, isLoading: fetching } =
    useGetEmailTemplates();

  useEffect(() => {
    getEmailTemplates(initialFilters);
  }, []);

  const getEmailTemplates = async (filter) => {
    try {
      setCurretFilters({
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      const { data } = await getEmailTemplatesApi({
        folder: currentFolder,
        select:
          'name,company,subject,name,body,status,htmlBody,jsonBody,isAutoResponderTemplate,tags,folder',
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      setEmailTemplates({
        results: [...emailTemplates.results, ...data?.results] || [],
        total: data?.pagination?.total || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <UILoader blocking={fetching}>
        <div
          className={`company-email-inner-scroll hide-scrollbar ${
            currentFilters.limit * currentFilters.page < emailTemplates.total &&
            'load-more-active'
          }`}
        >
          <Row className='company-email-temp-card-row'>
            {emailTemplates && emailTemplates.results.length > 0 ? (
              emailTemplates.results
                // .filter((t) => !t?.isAutoResponderTemplate)
                .map((item, key) => (
                  <Col className='company-email-temp-card-col' md='4' key={key}>
                    <EmailTemplateCard
                      item={item}
                      openPreview={openPreview}
                      cloneTemplateDetails={cloneTemplateDetails}
                      setEditItem={setEditItem}
                      setTemplateType={() => {}}
                      setShowForm={setShowForm}
                      handleConfirmDelete={handleConfirmDelete}
                      sendTestMail={sendTestMail}
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
        {currentFilters.limit * currentFilters.page < emailTemplates.total && (
          <div className='text-center loadMore-btn-wrapper'>
            <Button
              outline={true}
              color='primary'
              onClick={() => {
                setCurretFilters({
                  ...currentFilters,
                  page: currentFilters.page + 1,
                });
                getEmailTemplates({
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
    </div>
  );
}

export default EmailTemplateGridView;
