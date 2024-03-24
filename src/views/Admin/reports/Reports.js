import { Card, CardHeader, CardBody, CardTitle } from 'reactstrap';
import ComingSoon from '../../../components/ComingSoon';

const Reports = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardBody>
          <ComingSoon />
        </CardBody>
      </Card>
    </div>
  );
};

export default Reports;
