import {
  useAddWebPushSubscribeAPI,
  useDeleteWebPushSubscribe,
} from './useWebPushAPI'

const useWebPushHelper = () => {
  const { addWebPushSubscribeAPI } = useAddWebPushSubscribeAPI()
  const { deleteWebPushSubscribe } = useDeleteWebPushSubscribe()

  async function regSw() {
    if ('serviceWorker' in navigator) {
      const url = `${process.env.PUBLIC_URL}/sw.js`
      try {
        const reg = await navigator.serviceWorker.register(url, {
          scope: '/',
        })
        // console.log('Service Worker registered successfully:', { reg })
        return reg
      } catch (error) {
        // console.error('Service Worker registration failed:', error)
      }
    }
    throw Error('Service worker not supported')
  }

  async function subscribe(serviceWorkerReg) {
    try {
      let subscription = await serviceWorkerReg.pushManager.getSubscription()
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        subscription = await serviceWorkerReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.REACT_APP_WEB_PUSH_PUBLIC_KEY,
        })
        await addWebPushSubscribeAPI(subscription)
      }
      if (permission === 'denied') {
        await deleteWebPushSubscribe()
      }
    } catch (error) {
      console.error('Error:subscribe', error?.message || error)
    }
  }

  return { subscribe, regSw }
}

export default useWebPushHelper
