import { useState } from 'react';
import { Plus } from 'react-feather';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
} from 'reactstrap';
import InvoiceCard from './InvoiceCard';

const InvoiceCardList = ({
  invoiceData,
  onClickAdd,
  handleDelete,
  isLoading,
  sendInvoice,
  sendInvoiceLoading,
  reloadInvoice,
}) => {
  // ========================== states ================================
  const [itemPerPage, setItemPerPage] = useState(9);

  return (
    <Card>
      <CardHeader>
        <CardTitle tag='h4' className='text-primary'>
          Invoice
        </CardTitle>
        <Button className='ms-2' color='primary' onClick={onClickAdd}>
          <Plus size={15} />
          <span className='align-middle ms-50'>Add Invoice</span>
        </Button>
      </CardHeader>
      <CardBody className='pb-0'>
        <Row>
          {invoiceData && invoiceData.length > 0 ? (
            invoiceData.map((item, index) => {
              if (index < itemPerPage) {
                return (
                  <Col lg='4' md='6' sm='12' key={index}>
                    <InvoiceCard
                      sendInvoiceLoading={sendInvoiceLoading}
                      sendInvoice={sendInvoice}
                      item={item}
                      handleDelete={handleDelete}
                      reloadInvoice={reloadInvoice}
                    />
                  </Col>
                );
              }
            })
          ) : (
            <div className='d-flex justify-content-center m-4'>
              <span className='no-data-found'>
                {!isLoading ? 'No Invoice found!' : ''}
              </span>
            </div>
          )}
          {itemPerPage < invoiceData?.length && (
            <div className='text-center mb-2'>
              <Button
                outline={true}
                color='primary'
                onClick={() => {
                  let temp = itemPerPage;
                  temp = temp + 6;
                  setItemPerPage(temp);
                }}
              >
                Load More
              </Button>
            </div>
          )}
        </Row>
      </CardBody>
    </Card>
  );
};

export default InvoiceCardList;
