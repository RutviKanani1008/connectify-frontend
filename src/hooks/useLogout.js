import { useHistory } from 'react-router-dom'
import { useLogoutUserAPI } from '../api/auth'
import { unregister } from '../serviceWorker'

const useLogout = () => {
  const history = useHistory()
  const { logoutAPI, isLoading } = useLogoutUserAPI()

  const logout = async () => {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    unregister()
    await logoutAPI()
    if (
      window.location.pathname.includes('/member') &&
      localStorage.getItem('isCompanyAdmin') &&
      localStorage.getItem('memberUserId') &&
      localStorage.getItem('memberToken')
    ) {
      console.log('----------------------------')
      localStorage.removeItem('isCompanyAdmin')
      localStorage.removeItem('memberUserId')
      localStorage.removeItem('memberToken')
      localStorage.removeItem('group')
      localStorage.removeItem('currentTaskFilters')
      history.push('/')
    } else if (
      window.location.pathname.includes('/admin') &&
      localStorage.getItem('isSuperAdmin') &&
      localStorage.getItem('adminUserId') &&
      localStorage.getItem('adminToken')
    ) {
      localStorage.removeItem('isSuperAdmin')
      localStorage.removeItem('adminUserId')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('group')
      localStorage.removeItem('currentTaskFilters')
      history.push('/')
    } else {
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      document.cookie = `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
      localStorage.removeItem('userId')
      localStorage.removeItem('token')
      localStorage.removeItem('isCompanyAdmin')
      localStorage.removeItem('memberUserId')
      localStorage.removeItem('memberToken')
      localStorage.removeItem('isSuperAdmin')
      localStorage.removeItem('adminUserId')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('group')
      localStorage.removeItem('currentTaskFilters')
      history.push('/login')
    }
    window.location.reload()
  }

  return { logout, isLoading }
}

export default useLogout
