import { lazy } from 'react';

export const defaultRoute = '/admin/home';

export const companyAdminRoutes = [
  {
    path: '/admin/home',
    component: lazy(() => import('../../views/Admin/Home/index')),
    userGuide: 'dashboard',
  },
  {
    path: '/admin/chat',
    component: lazy(() => import('../../views/Admin/Chat')),
    userGuide: 'chat',
  },
  {
    path: '/admin/users/:id/:tab?',
    component: lazy(() => import('../../views/Admin/users/AddUser')),
    id: 'users',
  },
  {
    path: '/admin/users',
    component: lazy(() => import('../../views/Admin/users/UsersList')),
    id: 'users',
    userGuide: 'company-users',
  },

  {
    path: '/admin/marketing/web-forms/response/:id',
    component: lazy(() => import('../../views/forms/formResponse')),
    id: 'forms',
  },
  {
    path: '/admin/marketing/web-forms/:id',
    component: lazy(() => import('../../views/forms/addForms')),
    id: 'forms',
  },
  {
    path: '/admin/marketing/web-forms',
    component: lazy(() => import('../../views/forms/FormList')),
    id: 'forms',
    userGuide: 'marketing-forms',
  },
  {
    path: '/admin/company/templates',
    component: lazy(() => import('../../views/templates/Templates')),
    id: 'templates',
  },
  {
    path: '/admin/company/checklists',
    component: lazy(() => import('../../views/Admin/checklists/Checklists')),
    id: 'templates',
    userGuide: 'company-checklist',
  },
  {
    path: '/admin/company/documents',
    component: lazy(() => import('../../views/document/Document')),
    id: 'documents',
    userGuide: 'company-files',
  },
  {
    path: '/admin/company',
    component: lazy(() => import('../../views/Admin/company/CompanyDetail')),
    id: 'company-profile',
    userGuide: 'company-profile',
  },
  {
    path: '/admin/contacts/all',
    component: lazy(() => import('../../views/Admin/contact')),
    id: 'contacts-list',
    userGuide: 'contacts-contacts',
  },
  {
    path: '/admin/contact/:id/:tab?/:folder?',
    className: 'todo-application',
    component: lazy(() => import('../../views/Admin/contact/AddContact')),
    id: 'contacts-list',
  },
  {
    path: '/admin/groups/manage-groups',
    component: lazy(() => import('../../views/Admin/groups')),
    id: 'manage-groups',
    userGuide: 'contacts-manage-groups',
  },
  {
    path: '/admin/group/contacts/:groupId/:groupName',
    component: lazy(() => import('../../views/Admin/groups/groupsPage')),
    id: 'manage-groups',
  },

  {
    path: '/admin/contacts/status',
    component: lazy(() => import('../../views/Admin/groups/Status')),
    id: 'status',
    userGuide: 'contacts-status',
  },

  {
    path: '/admin/contacts/category',
    component: lazy(() => import('../../views/Admin/groups/Category')),
    id: 'categories',
    userGuide: 'contacts-category',
  },

  {
    path: '/admin/contacts/tags',
    component: lazy(() => import('../../views/Admin/groups/Tags')),
    id: 'tags',
    userGuide: 'contacts-tags',
  },
  {
    path: '/admin/pipeline/:id',
    component: lazy(() => import('../../views/Admin/pipeline/PipelineStages')),
    id: 'pipeline',
  },
  {
    path: '/admin/contacts/custom-field',
    component: lazy(() => import('../../views/Admin/groups/CustomFields')),
    id: 'custom-fields',
    userGuide: 'contacts-custom-fields',
  },
  {
    path: '/admin/pipeline',
    component: lazy(() => import('../../views/Admin/pipeline/index')),
  },

  {
    path: '/admin/event',
    component: lazy(() => import('../../views/Admin/event/Event')),
    userGuide: 'events',
  },

  /* Old pipelne kanban-view  */
  // {
  //   path: '/admin/pipeline',
  //   component: lazy(() => import('../../views/Admin/pipeline/index')),
  //   id: 'pipeline',
  //   userGuide: 'pipeline',
  // },

  // mass-sms
  {
    path: '/admin/templates/mass-sms',
    component: lazy(() =>
      import('../../views/superAdmin/marketing/SMSTemplates')
    ),
    id: 'mass-sms-tool',
    userGuide: 'marketing-sms-templates',
  },
  {
    path: '/admin/mass-sms/:id',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-sms-tool/CreateMassSMS')
    ),
    id: 'mass-sms-tool',
  },
  {
    path: '/admin/mass-sms',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-sms-tool/MassSMS')
    ),
    id: 'mass-sms-tool',
    userGuide: 'marketing-mass-sms-blast',
  },

  // mass-email
  {
    path: '/admin/templates/mass-emails',
    component: lazy(() =>
      import('../../views/superAdmin/marketing/EmailTemplates')
    ),
    id: 'mass-email-tool',
    userGuide: 'marketing-mass-email-templates',
  },
  {
    path: '/admin/mass-email/statistics/:id',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-email-tool/SendGridStatistics')
    ),
    id: 'mass-email-tool',
  },
  {
    path: '/admin/mass-email/:id',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-email-tool/CreateMassEmail')
    ),
    id: 'mass-email-tool',
  },
  {
    path: '/admin/mass-email',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-email-tool/MassEmail')
    ),
    id: 'mass-email-tool',
    userGuide: 'marketing-mass-email-blast',
  },

  // Direct Mail
  {
    path: '/admin/templates/direct-mail/:id',
    component: lazy(() =>
      import(
        '../../views/directMail/DirectMailTemplate/components/AddEditDirectMailTemplate'
      )
    ),
    id: 'mass-email-tool',
    userGuide: 'marketing-direct-mail-templates',
  },
  {
    path: '/admin/templates/direct-mail',
    component: lazy(() => import('../../views/directMail/DirectMailTemplate')),
    id: 'mass-email-tool',
    userGuide: 'marketing-direct-mail-templates',
  },
  {
    path: '/admin/direct-mail/:id',
    component: lazy(() =>
      import('../../views/directMail/DirectMail/components/CreateDirectMail')
    ),
    id: 'mass-email-tool',
  },
  {
    path: '/admin/direct-mail',
    component: lazy(() => import('../../views/directMail/DirectMail')),
    id: 'mass-email-tool',
    userGuide: 'marketing-create-direct-mail',
  },
  {
    path: '/admin/envelope/:id',
    component: lazy(() =>
      import('../../views/directMail/Envelope/AddEditEnvelop')
    ),
    id: 'mass-email-tool',
    userGuide: 'envelope',
  },
  {
    path: '/admin/envelope',
    component: lazy(() => import('../../views/directMail/Envelope')),
    id: 'mass-email-tool',
    userGuide: 'envelope',
  },

  // reports
  {
    path: '/admin/reports',
    component: lazy(() => import('../../views/Admin/reports/Reports')),
    id: 'reports',
    userGuide: 'report',
  },

  // billing
  {
    path: '/admin/invoice/preview/:slug',
    component: lazy(() =>
      import('../../views/Admin/billing/Invoice/PreviewInvoice')
    ),
    id: 'invoice',
  },

  {
    path: '/admin/invoice/print/:id',
    component: lazy(() =>
      import('../../views/Admin/billing/Invoice/components/InvoicePrint')
    ),
    layout: 'BlankLayout',
    id: 'invoice',
  },
  {
    path: '/admin/invoice/:id',
    component: lazy(() =>
      import('../../views/Admin/billing/Invoice/AddInvoice')
    ),
    id: 'invoice',
  },
  {
    path: '/admin/invoice/',
    component: lazy(() => import('../../views/Admin/billing/Invoice')),
    id: 'invoice',
    userGuide: 'billing-invoice',
  },
  {
    path: '/admin/quote/print/:id',
    component: lazy(() =>
      import('../../views/Admin/billing/Quote/components/QuotePrint')
    ),
    layout: 'BlankLayout',
    id: 'quote',
  },
  {
    path: '/admin/quote/preview/:slug',
    component: lazy(() =>
      import('../../views/Admin/billing/Quote/PreviewQuote')
    ),
    id: 'quote',
  },

  {
    path: '/admin/quote/:id',
    component: lazy(() => import('../../views/Admin/billing/Quote/AddQuote')),
    id: 'quote',
  },
  {
    path: '/admin/quote',
    component: lazy(() => import('../../views/Admin/billing/Quote/')),
    id: 'quote',
    userGuide: 'billing-quote',
  },
  {
    path: '/admin/products',
    component: lazy(() => import('../../views/Admin/billing/Products')),
    id: 'products',
  },
  {
    path: '/admin/product/one-time-product',
    component: lazy(() =>
      import('../../views/Admin/billing/Products/OneTimeProduct')
    ),
    id: 'products',
    userGuide: 'billing-one-time-products',
  },
  {
    path: '/admin/product/recurring-product',
    component: lazy(() =>
      import('../../views/Admin/billing/Products/RecurringProduct')
    ),
    id: 'products',
    userGuide: 'billing-reccurring-products',
  },
  {
    path: '/admin/product/product-category',
    component: lazy(() =>
      import('../../views/Admin/billing/Products/ProductCategory')
    ),
    id: 'products',
    userGuide: 'billing-product-categories',
  },
  {
    path: '/admin/billing-profiles',
    component: lazy(() => import('../../views/Admin/billing/BillingProfiles')),
    id: 'billing-profiles',
    userGuide: 'billing-billing-profiles',
  },
  {
    path: '/admin/payment-methods/:id',
    component: lazy(() =>
      import('../../views/Admin/billing/BillingProfiles/PaymentMethods')
    ),
    id: 'billing-profiles',
  },
  {
    path: '/admin/billing-templates',
    component: lazy(() => import('../../views/Admin/billing/Templates')),
    id: 'billing-templates',
    userGuide: 'billing-templates',
  },

  // Task Manager
  {
    path: '/admin/task-manager',
    exact: true,
    appLayout: true,
    className: 'todo-application',
    component: lazy(() => import('../../views/Admin/TaskManager/TaskManager')),
    id: 'task-manager',
    userGuide: 'task-manager',
  },
  {
    path: '/admin/task-report',
    component: lazy(() =>
      import('../../views/Admin/TaskManager/TaskTimerReport')
    ),
    id: 'task-timer-report',
    userGuide: 'task-timer-report',
  },

  // Communication
  {
    path: '/admin/communication/email/detail',
    component: lazy(() =>
      import('../../views/Admin/communication/Email/components/MailDetails')
    ),
    id: 'email',
    userGuide: 'communication-emails',
  },
  {
    exact: true,
    appLayout: true,
    className: 'email-application',
    path: '/admin/communication/email/:folder',
    component: lazy(() => import('../../views/Admin/communication/Email')),
    id: 'email',
  },
  {
    exact: true,
    appLayout: true,
    path: '/admin/communication/settings',
    component: lazy(() => import('../../views/Admin/communication/Settings')),
    id: 'communication-settings',
  },

  {
    path: '/admin/notification',
    component: lazy(() => import('../../views/settings/Notification')),
    userGuide: 'settings-notifications',
  },
  {
    path: '/admin/faq',
    component: lazy(() => import('../../views/settings/Faq')),
    userGuide: 'settings-faq',
  },
  {
    path: '/logout',
    component: lazy(() => import('../../views/logout')),
  },
  //inventory
  {
    path: '/admin/product/all',
    component: lazy(() =>
      import('../../views/Admin/inventory/Products/ProductList')
    ),
    id: 'product-list',
    userGuide: 'inventory-products',
  },
  {
    path: '/admin/product/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Products/AddProduct')
    ),
    id: 'product-list',
  },
  {
    path: '/admin/product-details/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Products/ProductDetails')
    ),
    id: 'product-list',
  },
  {
    path: '/admin/inventory-settings',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Settings/InventorySetting')
    ),
    id: 'inventory-setting',
    userGuide: 'inventory-settings',
  },
  {
    path: '/admin/add-order/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Orders/AddOrder')
    ),
  },
  {
    path: '/admin/orders',
    className: 'todo-application',
    component: lazy(() => import('../../views/Admin/inventory/Orders/Orders')),
    id: 'inventory-orders',
    userGuide: 'inventory-orders',
  },
  {
    path: '/admin/offline-order-details/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Orders/OfflineOrderDetails')
    ),
    id: 'inventory-orders',
    userGuide: 'inventory-orders',
  },
  {
    path: '/admin/online-order-details/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Orders/OnlineOrderDetails')
    ),
    id: 'inventory-orders',
    userGuide: 'inventory-orders',
  },
  // settings
  {
    path: '/feature-request',
    userGuide: 'settings-feature-requests',
    component: lazy(() =>
      import('../../views/superAdmin/settings/FeatureRequests')
    ),
  },
  {
    path: '/report-problem',
    component: lazy(() =>
      import('../../views/superAdmin/settings/ReportProblems')
    ),
    userGuide: 'settings-support-tickets',
  },
  {
    exact: true,
    path: '/admin/profile/:tab',
    component: lazy(() => import('../../views/settings/UserProfile')),
    userGuide: 'settings-profiles',
  },
  {
    path: '/admin/integration',
    component: lazy(() => import('../../views/settings/Integration/')),
    userGuide: 'settings-integration',
  },
  {
    path: '/admin/change-logs',
    component: lazy(() => import('../../views/settings/ChangeLogs')),
    userGuide: 'settings-change-logs',
  },
];
