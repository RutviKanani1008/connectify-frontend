import { useEffect } from 'react'
import useLogout from '../hooks/useLogout'
import { Spinner } from 'reactstrap'

const Logout = () => {
  const { logout } = useLogout()

  useEffect(() => {
    logout()
  }, [])

  return (
    <div className='comingSoon-wrapper'>
      <div className='inner-wrapper'>
        <div className='header-text'>
          <p className='text'>You are logging out... 🚀</p>
        </div>
        <div className='d-flex justify-content-center'>
          <Spinner color='primary' />
        </div>
      </div>
    </div>
  )
}

export default Logout
