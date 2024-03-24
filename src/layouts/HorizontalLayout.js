// ** Core Layout Import
// !Do not remove the Layout import
import Layout from '@layouts/HorizontalLayout';

// ** Menu Items Array
import {
  superAdminNavItems,
  companyNavItems,
  memberNavItems,
} from '@src/navigation/horizontal';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { userData } from '../redux/user';

const HorizontalLayout = (props) => {
  const [menuData, setMenuData] = useState([]);
  const user = useSelector(userData);
  // ** For ServerSide navigation
  useEffect(() => {
    if (user.role) {
      if (user.role === 'superadmin') {
        setMenuData([...superAdminNavItems]);
      } else if (user.role === 'admin') {
        setMenuData([...companyNavItems]);
      } else if (user.role === 'user') {
        setMenuData([...memberNavItems]);
      }
    }
  }, [user?.role]);

  return (
    <Layout menuData={menuData} {...props}>
      {props.children}
    </Layout>
  );
};

export default HorizontalLayout;
