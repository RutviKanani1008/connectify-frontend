// ** Icons Import
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';

const Footer = () => {
  const user = useSelector(userData);

  const latestVersion = user.latestVersion || 1.0;

  return (
    <p className='d-flex justify-content-between'>
      <span className='float-md-start d-block d-md-inline-block mt-25'>
        © {new Date().getFullYear()}{' '}
        <a
          href={process.env.REACT_APP_APP_URL}
          target='_blank'
          rel='noopener noreferrer'
        >
          {process.env.REACT_APP_COMPANY_NAME}
        </a>
        <span className='d-none d-sm-inline-block'>, All rights Reserved</span>
      </span>
      <span className=''>version v{latestVersion}</span>
      <span className='float-md-end d-none d-md-block'>
        {/* Hand-crafted & Made with */}

        <span>
          Invite other to try this tool {'   '}
          <a
            href='https://www.xyz.com'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary'
          >
            <img
              className='fallback-logo'
              width={20}
              src='/images/favicon.png'
              alt=''
            />
            {'  '} xyz.com
          </a>
        </span>
      </span>
    </p>
  );
};

export default Footer;
