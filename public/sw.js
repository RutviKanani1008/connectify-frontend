/* eslint-disable no-undef */
self.addEventListener('activate', async function () {
  // console.log('service worker activated')
})
self.addEventListener('push', async function (event) {
  // console.log('notifications will be displayed here')
  const message = await event.data.json()
  const { title, description, image } = message
  await event.waitUntil(
    self.registration.showNotification(title, {
      body: description,
      icon: image,
      actions: [
        {
          action: 'close',
          type: 'button',
          title: 'Close',
        },
      ],
    })
  )
})

// self.addEventListener('install', function () {
//   console.log('Service worker installed');
// });

// self.addEventListener(
//   'notificationclick',
//   (event) => {
//     const payload = event.notification.data;
//     if (event.action === 'view') {
//       clients.openWindow(payload?.url);
//     }
//   },
//   false
// );
