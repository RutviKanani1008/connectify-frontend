import { useCallback } from 'react'
import { encrypt } from '../../../../../../helper/common.helper'
import useGetBasicRoute from '../../../../../../hooks/useGetBasicRoute'
import { NOTIFICATION_MODULE_TYPE } from '../constants'

const useGetNotificationUrl = () => {
  // ** Custom Hooks **
  const { basicRoute } = useGetBasicRoute()

  const getNotificationUrl = useCallback(
    ({ modelName, modelId }) => {
      switch (modelName) {
        case NOTIFICATION_MODULE_TYPE.TASK_MANAGER:
          return `${basicRoute}/task-manager?task=${encrypt(modelId)}`
        case NOTIFICATION_MODULE_TYPE.CONTACT:
          return `${basicRoute}/contact/${modelId}`
        case NOTIFICATION_MODULE_TYPE.USER:
          return `${basicRoute}/users/${modelId}`
      }
    },
    [basicRoute]
  )
  return { getNotificationUrl }
}

export default useGetNotificationUrl
