import React, { useEffect, useState } from 'react'

// ** Core Layout Import
// !Do not remove the Layout import
import Layout from '@layouts/VerticalLayout'

// ** Menu Items Array
import { superAdminNavItems, companyNavItems } from '@src/navigation/vertical'
import { userPendingChangeLogCount } from '../redux/user'
import { useSelector } from 'react-redux'
import {
  permissionBasedSetSideBarObj,
  setSidebarUpdatesCount,
} from '../helper/layout.helper'
import { memberNavItems } from '../navigation/vertical'
import { selectSidebarCount } from '../redux/common'

const VerticalLayout = (props) => {
  const [menuData, setMenuData] = useState([])
  // -------------------------------------------
  const user = props.useData
  const pendingChangeLogCount = useSelector(userPendingChangeLogCount)
  const sidebarCount = useSelector(selectSidebarCount)

  // ** For ServerSide navigation
  useEffect(() => {
    if (user.role) {
      if (user.role === 'superadmin') {
        const itemsWithBadgeCount = setSidebarUpdatesCount({
          navBarItems: [...superAdminNavItems],
          sidebarCount,
        })

        setMenuData([...itemsWithBadgeCount])
      } else if (user.role === 'admin') {
        //--------------- permission wise set layout-------------
        const tempCompanyNavItems = permissionBasedSetSideBarObj({
          pendingChangeLogCount,
          user,
          navBarItems: companyNavItems,
        })
        setMenuData([...tempCompanyNavItems])
      } else if (user.role === 'user') {
        //--------------- permission wise set layout-------------
        const tempMemberNavItems = permissionBasedSetSideBarObj({
          pendingChangeLogCount,
          user,
          navBarItems: memberNavItems,
        })
        setMenuData([...tempMemberNavItems])
      }
    }
  }, [user?.role, pendingChangeLogCount, sidebarCount])

  return (
    <Layout menuData={menuData} {...props}>
      {props.children}
    </Layout>
  )
}

export default VerticalLayout
