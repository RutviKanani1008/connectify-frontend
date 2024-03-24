import { Card, CardHeader, CardBody, CardTitle } from 'reactstrap';
import ComingSoon from '../../components/ComingSoon';

const Notification = () => {
  return (
    <div>
      <Card className='notifications-card'>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardBody>
          <ComingSoon />
        </CardBody>
      </Card>
    </div>
  );
};

export default Notification;
