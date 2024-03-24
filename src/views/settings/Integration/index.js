/* eslint-disable no-constant-condition */
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from 'reactstrap';
import { useGetIntegration } from '../hooks/integrationApi';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';
import SendGridForm from './components/SendGridForm';
import ComponentSpinner from '../../../@core/components/spinner/Loading-spinner';
import ImapConnection from './components/ImapConnection';

const Integration = () => {
  const [currentIntegration, setCurrentIntegration] = useState();
  const user = useSelector(userData);

  const { getIntegration, isLoading: loadingCurrentIntegration } =
    useGetIntegration();

  const getIntegrationDetails = async () => {
    const { data, error } = await getIntegration({
      company: user?.company?._id,
    });
    if (!error) {
      if (data) {
        setCurrentIntegration(data);
      }
    }
  };

  useEffect(() => {
    getIntegrationDetails();
  }, []);

  return (
    <div>
      <Card className='integration-card'>
        <CardHeader>
          <CardTitle>Integration</CardTitle>
        </CardHeader>
        <CardBody>
          {loadingCurrentIntegration ? (
            <ComponentSpinner />
          ) : (
            <>
              <SendGridForm
                currentIntegration={currentIntegration}
                setCurrentIntegration={setCurrentIntegration}
              />
              {/* <TwilioForm
                currentIntegration={currentIntegration}
                setCurrentIntegration={setCurrentIntegration}
              />
              <SmtpForm
                currentIntegration={currentIntegration}
                setCurrentIntegration={setCurrentIntegration}
              /> */}
            </>
          )}
          <ImapConnection />
        </CardBody>
      </Card>
    </div>
  );
};

export default Integration;
