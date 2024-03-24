import { Card, CardHeader, CardBody, CardTitle } from 'reactstrap';
import ComingSoon from '../../../components/ComingSoon';

const WebForms = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Web Forms</CardTitle>
        </CardHeader>
        <CardBody>
          <ComingSoon />
        </CardBody>
      </Card>
    </div>
  );
};

export default WebForms;
