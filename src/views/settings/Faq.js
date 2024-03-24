import { Card, CardHeader, CardBody, CardTitle } from 'reactstrap';
import ComingSoon from '../../components/ComingSoon';

const FAQ = () => {
  return (
    <div>
      <Card className='faq-card'>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardBody>
          <ComingSoon />
        </CardBody>
      </Card>
    </div>
  );
};

export default FAQ;
