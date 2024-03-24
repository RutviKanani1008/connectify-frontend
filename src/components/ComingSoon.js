import React from 'react';
// ** Reactstrap Imports

// ** Custom Hooks
// import { useSkin } from '@hooks/useSkin';

// ** Styles
import '@styles/base/pages/page-misc.scss';

const ComingSoon = () => {
  // ** Hooks
  // const { skin } = useSkin();

  // const illustration =
  //     skin === 'dark' ? 'coming-soon-dark.svg' : 'coming-soon.svg',
    // source = require(`@src/assets/images/pages/${illustration}`).default;
   const source = '/images/login-img.png';
    
  return (
    <div className='comingSoon-wrapper'>
      <div className='inner-wrapper'>
        <div className='header-text'>
          <h2 className='title'>We are launching soon 🚀</h2>
          <p className='text'>
            We're creating something awesome. Please subscribe to get notified
            when it's ready!
          </p>
        </div>
        <div className="img-wrapper">
          <img className='img-fluid' src={source} alt='Coming soon page' />
        </div>
      </div>
    </div>
  );
};
export default ComingSoon;
