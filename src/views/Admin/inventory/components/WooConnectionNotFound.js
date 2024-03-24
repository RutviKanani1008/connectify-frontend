import React from 'react';
// ** Reactstrap Imports

// ** Custom Hooks
import { useSkin } from '@hooks/useSkin';

// ** Styles
import '@styles/base/pages/page-misc.scss';
import { Link } from 'react-router-dom';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';

const WooConnectionNotFound = () => {
  // ** Hooks
  const { skin } = useSkin();
  const { basicRoute } = useGetBasicRoute();

  const illustration =
    skin === 'dark' ? 'coming-soon-dark.svg' : 'coming-soon.svg',
    source = require(`@src/assets/images/pages/${illustration}`).default;

  return (
    <div className='misc-wrapper'>
      <div className='misc-inner p-2 p-sm-3'>
        <div className='w-100 text-center'>
          <h2 className='mb-1'> Please connect your WooCommerce store first</h2>
          <p className='mb-3 h5'>
            To connect your WooCommerce store
             <Link
               to={`${basicRoute}/inventory-settings?tabName=wooCommerceConnection`}
              >
               Click Here
            </Link>
          </p>
          <img className='img-fluid' src={source} alt='Coming soon page' />
        </div>
      </div>
    </div>
  );
};

export default WooConnectionNotFound;
