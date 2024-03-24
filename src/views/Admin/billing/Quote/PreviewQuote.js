// ** React Imports
import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// ** Reactstrap Imports
import { Row, Col, Spinner, Card, CardBody } from 'reactstrap';

// ** Invoice Preview Components
import QuotePreviewCard from './components/QuotePreviewCard';
import PreviewActions from './components/PreviewActions';
import BillStatusHistory from '../Invoice/components/BillStatusHistory';

// ** packages
import { PDFExport } from '@progress/kendo-react-pdf';

// ** Styles
import '@styles/base/pages/app-invoice.scss';

import { useGetQuote } from './hooks/quoteApis';
import { logger } from '../../../../utility/Utils';
import { useGetBillStatusHistory } from './hooks/invoiceQuoteApis';

const PreviewQuote = () => {
  // ** HooksVars
  const { slug } = useParams();
  const pdfExportComponent = useRef(null);
  const location = useLocation();

  let isPublicPage = false;
  if (location.pathname === `/quote/preview/${slug}`) {
    isPublicPage = true;
  }

  // ** States
  const [data, setData] = useState(null);
  const [statusHistoryData, setStatusHistoryData] = useState([]);

  // ** custom Hooks **
  const { getQuote, isLoading: getQuoteLoading } = useGetQuote();
  const { getBillStatusHistoryAPI } = useGetBillStatusHistory();

  useEffect(() => {
    getQuoteDetail();
  }, []);

  const getQuoteDetail = async () => {
    try {
      const { data, error } = await getQuote(slug, { slug, isPublicPage });
      if (!error) {
        setData(data);
        getBillStatusHistory(data._id);
      }
    } catch (error) {
      logger(error);
    }
  };

  const getBillStatusHistory = async (id) => {
    try {
      const { data, error } = await getBillStatusHistoryAPI({
        recordRelationId: id,
        type: 'Quote',
      });
      if (!error && data) {
        setStatusHistoryData(data);
      }
    } catch (error) {
      logger(error);
    }
  };

  const exportPDFWithComponent = () => {
    if (pdfExportComponent.current) {
      pdfExportComponent.current.save();
    }
  };

  return getQuoteLoading ? (
    <div
      className={
        isPublicPage ? 'blank-layout-spinner' : 'fit__content__spinner__wp'
      }
    >
      <Spinner />
    </div>
  ) : (
    <div
      className={`invoice-preview-wrapper ${
        isPublicPage ? 'public-invoice-preview-wrapper' : ''
      }`}
    >
      <Row className='invoice-preview'>
        {data ? (
          <>
            <Col xl={9} md={8} sm={12}>
              <PDFExport
                ref={pdfExportComponent}
                paperSize='auto'
                margin={40}
                fileName={`invoice-${data.quoteId}.pdf`}
                author='KendoReact Team'
              >
                {data && <QuotePreviewCard data={data} />}
              </PDFExport>
            </Col>
            <Col xl={3} md={4} sm={12}>
              <PreviewActions
                isPublicPage={isPublicPage}
                slug={data.slug}
                setData={setData}
                statusHistoryData={statusHistoryData}
                setStatusHistoryData={setStatusHistoryData}
                status={data.status}
                id={data._id}
                notes={data?.notes}
                type='Quote'
                exportPDFWithComponent={exportPDFWithComponent}
              />
              {statusHistoryData.length > 0 && (
                <Card className='invoice-action-wrapper'>
                  <CardBody>
                    <BillStatusHistory
                      statusHistoryData={statusHistoryData}
                      notes={data?.notes ? data.notes : []}
                    />
                  </CardBody>
                </Card>
              )}
            </Col>
          </>
        ) : (
          <></>
        )}
      </Row>
    </div>
  );
};

export default PreviewQuote;
