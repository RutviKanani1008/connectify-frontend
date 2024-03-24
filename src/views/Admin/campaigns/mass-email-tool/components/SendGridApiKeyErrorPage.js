import React from 'react';
// ** Reactstrap Imports

// ** Custom Hooks
import { useSkin } from '@hooks/useSkin';

// ** Styles
import '@styles/base/pages/page-misc.scss';
import { useHistory } from 'react-router-dom';

export const SendGridApiKeyErrorPage = () => {
  // ** Hooks
  const { skin } = useSkin();
  const history = useHistory();

  const illustration =
      skin === 'dark' ? 'coming-soon-dark.svg' : 'coming-soon.svg',
    source = require(`@src/assets/images/pages/${illustration}`).default;

  return (
    <div className='misc-wrapper'>
      <div className='misc-inner p-2 p-sm-3'>
        <div className='w-100 text-center'>
          <h2 className='mb-1'>Please connect your sendgrid account first</h2>
          <p className='mb-3 h5'>
            To connect your sendgrid account
            <a
              className='text-primary'
              onClick={() => {
                history.push('/admin/integration');
              }}
            >
               click here
            </a>{' '}
          </p>

          <img className='img-fluid' src={source} alt='Coming soon page' />
        </div>
      </div>
    </div>
  );
};
