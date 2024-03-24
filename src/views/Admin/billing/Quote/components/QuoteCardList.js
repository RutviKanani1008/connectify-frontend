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
import QuoteCard from './QuoteCard';

const QuoteCardList = ({
  quoteData,
  onClickAdd,
  handleDelete,
  isLoading,
  sendQuote,
  sendQuoteLoading,
  reloadQuote,
}) => {
  // ========================== states ================================
  const [itemPerPage, setItemPerPage] = useState(9);
  return (
    <Card>
      <CardHeader>
        <CardTitle tag='h4' className='text-primary'>
          Quote
        </CardTitle>
        <Button className='ms-2' color='primary' onClick={onClickAdd}>
          <Plus size={15} />
          <span className='align-middle ms-50'>Add Quote</span>
        </Button>
      </CardHeader>
      <CardBody className='pb-0'>
        <Row>
          {quoteData && quoteData.length > 0 ? (
            quoteData.map((item, index) => {
              if (index < itemPerPage) {
                return (
                  <Col lg='4' md='6' sm='12' key={index}>
                    <QuoteCard
                      sendQuoteLoading={sendQuoteLoading}
                      sendQuote={sendQuote}
                      item={item}
                      handleDelete={handleDelete}
                      reloadQuote={reloadQuote}
                    />
                  </Col>
                );
              }
            })
          ) : (
            <div className='d-flex justify-content-center m-4'>
              <span className='no-data-found'>
                {!isLoading ? 'No Quote found!' : ''}
              </span>
            </div>
          )}
          {itemPerPage < quoteData?.length && (
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

export default QuoteCardList;
