// ** React Imports
import { useState, useEffect, useRef, Fragment } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// ** Reactstrap Imports
import { Row, Col, Spinner, Card, CardBody } from 'reactstrap';

// ** Invoice Preview Components
import InvoicePreviewCard from './components/InvoicePreviewCard';

// ** packages
import { PDFExport } from '@progress/kendo-react-pdf';

// ** Styles
import '@styles/base/pages/app-invoice.scss';

import { logger } from '../../../../utility/Utils';
import PreviewActions from '../Quote/components/PreviewActions';
import { useGetInvoice } from './hooks/invoiceApis';
import { useGetBillStatusHistory } from '../Quote/hooks/invoiceQuoteApis';
import BillStatusHistory from './components/BillStatusHistory';

const PreviewInvoice = () => {
  // ** HooksVars
  const { slug } = useParams();
  const pdfExportComponent = useRef(null);
  const location = useLocation();

  let isPublicPage = false;
  if (location.pathname === `/invoice/preview/${slug}`) {
    isPublicPage = true;
  }

  // ** States
  const [data, setData] = useState(null);
  const [statusHistoryData, setStatusHistoryData] = useState([]);

  // ** custom Hooks **
  const { getInvoice, isLoading: getInvoiceLoading } = useGetInvoice();
  const { getBillStatusHistoryAPI } = useGetBillStatusHistory();

  useEffect(() => {
    getInvoiceDetail();
  }, []);

  const getInvoiceDetail = async () => {
    try {
      const { data, error } = await getInvoice(slug, { slug, isPublicPage });
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
        type: 'Invoice',
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

  return getInvoiceLoading ? (
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
            <Col xl={9} md={8} sm={12} className='invoice__preview__card__col'>
              <PDFExport
                ref={pdfExportComponent}
                paperSize='auto'
                margin={40}
                fileName={`invoice-${data.invoiceId}.pdf`}
                author='KendoReact Team'
              >
                {data && <InvoicePreviewCard data={data} />}
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
                type='Invoice'
                exportPDFWithComponent={exportPDFWithComponent}
                notes={data?.notes}
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

export default PreviewInvoice;
