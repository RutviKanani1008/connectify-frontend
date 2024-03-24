import { useSelector } from 'react-redux';
import { userRole } from '../redux/user';

const useGetBasicRoute = () => {
  let basicRoute = useSelector(userRole);
  if (basicRoute === 'user') {
    basicRoute = '/member';
  } else if (basicRoute === 'superadmin') {
    basicRoute = '';
  } else {
    basicRoute = `/${basicRoute}`;
  }
  return { basicRoute };
};

export default useGetBasicRoute;
