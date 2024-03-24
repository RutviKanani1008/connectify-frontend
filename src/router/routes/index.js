import { lazy } from 'react';

// ** Document title
const TemplateTitle = '%s - Vuexy React Admin Template';

// ** Default Route
const DefaultRoute = '/home';

// ** Merge Routes
const Routes = [
  {
    path: '/login',
    component: lazy(() => import('../../views/login/Login')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/unsubscribe',
    component: lazy(() => import('../../views/public/Unsubscribe')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/verify-email',
    component: lazy(() => import('../../views/public/VerifyEmail')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  /* SignUp Disable */

  // {
  //   path: '/register',
  //   component: lazy(() => import('../../views/register/Register')),
  //   layout: 'BlankLayout',
  //   meta: {
  //     publicRoute: true,
  //   },
  // },

  /* */
  {
    path: '/forgot-password',
    component: lazy(() => import('../../views/forgotPassword/ForgotPassword')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/change-password',
    component: lazy(() => import('../../views/forgotPassword/resetPassword')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/set-password',
    component: lazy(() => import('../../views/verifyAccount/VerifyAccount')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/error',
    component: lazy(() => import('../../views/Error')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/forms/:id',
    component: lazy(() => import('../../views/forms/form')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/checklist-details/:id',
    component: lazy(() =>
      import('../../views/checklistDetails/publicChecklistDetails')
    ),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/support-report-forms',
    component: lazy(() => import('../../views/supportForms/supportsForm')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/embed/:id',
    component: lazy(() => import('../../views/forms/embedForm')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/rsvp/:id',
    component: lazy(() => import('../../views/Admin/event/Rsvp')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/shared-note/:id',
    component: lazy(() => import('../../views/sharedNotes/sharedNotes')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/invoice/preview/:slug',
    component: lazy(() =>
      import('../../views/Admin/billing/Invoice/PreviewInvoice')
    ),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/quote/preview/:slug',
    component: lazy(() =>
      import('../../views/Admin/billing/Quote/PreviewQuote')
    ),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/task-manager',
    component: lazy(() =>
      import('../../views/Admin/TaskManager/components/TaskManagerEntryPoint')
    ),
  },
];

export { DefaultRoute, TemplateTitle, Routes };
