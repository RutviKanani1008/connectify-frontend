import React, { useEffect, useState } from 'react';

// ** React Imports
import { Link, useParams } from 'react-router-dom';
// ** Reactstrap Imports
import {
  // Card,
  CardBody,
  CardTitle,
  Label,
  Row,
  Spinner,
} from 'reactstrap';

// ** Styles
import '@styles/react/pages/page-authentication.scss';
import UILoader from '@components/ui-loader';
import themeConfig from '../../configs/themeConfig';
import { useGetSpecificChecklistTemplates } from '../templates/hooks/checklistApis';
import { decrypt } from '../../helper/common.helper';
import ChecklistDetailFromFieldsView from '../templates/components/ChecklistDetailFromView';

const SupportForms = () => {
  const [loading] = useState(false);
  const params = useParams();
  const { getSpecificChecklistTemplates, isLoading } =
    useGetSpecificChecklistTemplates();
  const [checklistDetails, setChecklistDetails] = useState(null);
  const [showChecklistNotFound, setShowChecklistNotFound] = useState(false);

  console.log({ checklistDetails });
  const getChecklistDetail = async () => {
    const { data, error } = await getSpecificChecklistTemplates(
      decrypt(params?.id)
    );
    if (!error) {
      setChecklistDetails(data);
    }
    if (error) {
      setShowChecklistNotFound(true);
    }
  };

  useEffect(() => {
    if (params.id) {
      // Get checklist
      getChecklistDetail();
    } else {
      // Invalid
      setShowChecklistNotFound(true);
    }
  }, []);

  return (
    <UILoader blocking={loading} className='public-checklist-module'>
      <Row className='my-2 d-flex justify-content-center'>
        <CardBody>
          <Link
            to='/'
            onClick={(e) => e.preventDefault()}
            className='mb-2 mt-2'
          >
            <div className='text-center mb-1'>
              <img src={themeConfig.app.connectifyLogo} width='50' alt='logo' />
            </div>
            <h2 className='text-center brand-text text-primary ms-1'>
              {process.env.REACT_APP_COMPANY_NAME}
            </h2>
          </Link>
          <CardTitle tag='h4' className='mb-2 mt-2 text-center'></CardTitle>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              {showChecklistNotFound ? (
                <>
                  <Label>No Checklist Found</Label>
                </>
              ) : (
                <div className='public-checklist-view'>
                  <div className='folder-template-names-wrapper'>
                    <div className='data-row'>
                      <Label>Template Name: </Label>{' '}
                      <Label> {checklistDetails?.name || '-'}</Label>
                    </div>
                  </div>
                  <div>
                    {checklistDetails && (
                      <ChecklistDetailFromFieldsView
                        currentChecklistDetails={checklistDetails}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Row>
    </UILoader>
  );
};

export default SupportForms;
