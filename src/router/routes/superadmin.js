import { lazy } from 'react';

export const defaultRoute = '/home';

export const superAdminRoutes = [
  {
    path: '/home',
    component: lazy(() => import('../../views/superAdmin/dashboard/Dashboard')),
    userGuide: 'dashboard',
  },

  {
    path: '/users/:id',
    component: lazy(() => import('../../views/Admin/users/AddUser')),
    id: 'users',
  },
  {
    path: '/users',
    component: lazy(() => import('../../views/Admin/users/UsersList')),
    id: 'users',
    userGuide: 'company-users',
  },

  /* Forms */
  {
    path: '/marketing/web-forms/response/:id',
    component: lazy(() => import('../../views/forms/formResponse')),
  },
  {
    path: '/marketing/web-forms/:id',
    component: lazy(() => import('../../views/forms/addForms')),
  },
  {
    path: '/marketing/web-forms',
    component: lazy(() => import('../../views/forms/FormList')),
    userGuide: 'marketing-forms',
  },
  /* */

  {
    path: '/company/templates',
    component: lazy(() => import('../../views/templates/Templates')),
    id: 'templates',
  },
  {
    path: '/company/checklists',
    component: lazy(() => import('../../views/Admin/checklists/Checklists')),
    id: 'templates',
    userGuide: 'company-checklist',
  },
  {
    path: '/inter-communications-templates',
    component: lazy(() =>
      import('../../views/superAdmin/inter-communication-template/Templates')
    ),
    id: 'inter-communications-templates',
  },
  {
    path: '/company/documents',
    component: lazy(() => import('../../views/document/Document')),
    id: 'documents',
    userGuide: 'company-files',
  },

  /* All Companies */
  {
    path: '/companies/all',
    component: lazy(() => import('../../views/superAdmin/company/CompanyList')),
  },
  {
    path: '/companies/white-label',
    component: lazy(() =>
      import('../../views/superAdmin/company/WhiteLabelCompanies')
    ),
  },
  {
    path: '/companies/child',
    component: lazy(() =>
      import('../../views/superAdmin/company/ChildCompanies')
    ),
  },
  {
    path: '/companies/:id',
    component: lazy(() => import('../../views/superAdmin/company/AddCompany')),
  },

  {
    path: '/company',
    component: lazy(() => import('../../views/Admin/company/CompanyDetail')),
    id: 'company-profile',
    userGuide: 'company-profile',
  },

  {
    path: '/contacts/all',
    component: lazy(() => import('../../views/Admin/contact')),
    id: 'contacts-list',
    userGuide: 'contacts-contacts',
  },
  {
    path: '/contact/:id',
    className: 'todo-application',
    component: lazy(() => import('../../views/Admin/contact/AddContact')),
    id: 'contacts-list',
  },
  {
    path: '/groups/manage-groups',
    component: lazy(() => import('../../views/Admin/groups')),
    id: 'manage-groups',
    userGuide: 'contacts-manage-groups',
  },
  {
    path: '/group/contacts/:groupId/:groupName',
    component: lazy(() => import('../../views/Admin/groups/groupsPage')),
    id: 'manage-groups',
  },
  {
    path: '/contacts/status',
    component: lazy(() => import('../../views/Admin/groups/Status')),
    id: 'status',
    userGuide: 'contacts-status',
  },

  {
    path: '/contacts/category',
    component: lazy(() => import('../../views/Admin/groups/Category')),
    id: 'categories',
    userGuide: 'contacts-category',
  },

  {
    path: '/contacts/tags',
    component: lazy(() => import('../../views/Admin/groups/Tags')),
    id: 'tags',
    userGuide: 'contacts-tags',
  },
  {
    path: '/pipeline/:id',
    component: lazy(() => import('../../views/Admin/pipeline/PipelineStages')),
    id: 'contact-pipeline',
  },
  {
    path: '/pipeline',
    component: lazy(() => import('../../views/Admin/pipeline/index')),
    id: 'pipeline',
    userGuide: 'pipeline',
  },
  {
    path: '/contacts/custom-field',
    component: lazy(() => import('../../views/Admin/groups/CustomFields')),
    id: 'custom-fields',
    userGuide: 'contacts-custom-fields',
  },

  /* Event */
  {
    path: '/event',
    component: lazy(() => import('../../views/Admin/event/Event')),
    userGuide: 'events',
  },

  /* mass-sms */

  {
    path: '/templates/mass-sms',
    component: lazy(() =>
      import('../../views/superAdmin/marketing/SMSTemplates')
    ),
    id: 'mass-sms-tool',
    userGuide: 'marketing-sms-templates',
  },
  {
    path: '/mass-sms/:id',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-sms-tool/CreateMassSMS')
    ),
    id: 'mass-sms-tool',
  },
  {
    path: '/mass-sms',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-sms-tool/MassSMS')
    ),
    id: 'mass-sms-tool',
    userGuide: 'marketing-mass-sms-blast',
  },

  /* mass-email */
  {
    path: '/mass-email/statistics/:id',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-email-tool/SendGridStatistics')
    ),
    id: 'mass-email-tool',
  },
  {
    path: '/templates/mass-emails',
    component: lazy(() =>
      import('../../views/superAdmin/marketing/EmailTemplates')
    ),
    id: 'mass-email-tool',
    userGuide: 'marketing-mass-email-templates',
  },
  {
    path: '/mass-email/:id',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-email-tool/CreateMassEmail')
    ),
    id: 'mass-email-tool',
  },
  {
    path: '/mass-email',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-email-tool/MassEmail')
    ),
    id: 'mass-email-tool',
    userGuide: 'marketing-mass-email-blast',
  },

  {
    path: '/reports',
    component: lazy(() => import('../../views/superAdmin/reports/Reports')),
    userGuide: 'report',
  },

  /* billing */
  {
    path: '/invoice/preview/:slug',
    component: lazy(() =>
      import('../../views/Admin/billing/Invoice/PreviewInvoice')
    ),
    id: 'invoice',
  },
  {
    path: '/invoice/print/:id',
    component: lazy(() =>
      import('../../views/Admin/billing/Invoice/components/InvoicePrint')
    ),
    layout: 'BlankLayout',
    id: 'invoice',
  },
  {
    path: '/invoice/:id',
    component: lazy(() =>
      import('../../views/Admin/billing/Invoice/AddInvoice')
    ),
    id: 'invoice',
  },
  {
    path: '/invoice/',
    component: lazy(() => import('../../views/Admin/billing/Invoice')),
    id: 'invoice',
    userGuide: 'billing-invoice',
  },
  {
    path: '/quote/print/:id',
    component: lazy(() =>
      import('../../views/Admin/billing/Quote/components/QuotePrint')
    ),
    layout: 'BlankLayout',
    id: 'quote',
  },
  {
    path: '/quote/preview/:slug',
    component: lazy(() =>
      import('../../views/Admin/billing/Quote/PreviewQuote')
    ),
    id: 'quote',
  },

  {
    path: '/quote/:id',
    component: lazy(() => import('../../views/Admin/billing/Quote/AddQuote')),
    id: 'quote',
  },
  {
    path: '/quote',
    component: lazy(() => import('../../views/Admin/billing/Quote/')),
    id: 'quote',
    userGuide: 'billing-quote',
  },
  {
    path: '/products',
    component: lazy(() => import('../../views/Admin/billing/Products')),
    id: 'products',
  },
  {
    path: '/product/one-time-product',
    component: lazy(() =>
      import('../../views/Admin/billing/Products/OneTimeProduct')
    ),
    id: 'products',
    userGuide: 'billing-one-time-products',
  },
  {
    path: '/product/recurring-product',
    component: lazy(() =>
      import('../../views/Admin/billing/Products/RecurringProduct')
    ),
    id: 'products',
    userGuide: 'billing-reccurring-products',
  },
  {
    path: '/product/product-category',
    component: lazy(() =>
      import('../../views/Admin/billing/Products/ProductCategory')
    ),
    id: 'products',
    userGuide: 'billing-product-categories',
  },
  {
    path: '/billing-profiles',
    component: lazy(() => import('../../views/Admin/billing/BillingProfiles')),
    id: 'billing-profile',
    userGuide: 'billing-billing-profiles',
  },
  {
    path: '/payment-methods/:id',
    component: lazy(() =>
      import('../../views/Admin/billing/BillingProfiles/PaymentMethods')
    ),
    id: 'billing-profile',
  },
  {
    path: '/billing-templates',
    component: lazy(() => import('../../views/Admin/billing/Templates')),
    id: 'billing-templates',
    userGuide: 'billing-templates',
  },

  /* Task Manager */
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

  {
    path: '/forms-preview/:id',
    component: lazy(() => import('../../views/forms/form')),
  },

  {
    path: '/cms-content',
    component: lazy(() =>
      import('../../views/superAdmin/cmsContent/CmsContent')
    ),
  },
  {
    path: '/user-guide',
    component: lazy(() => import('../../views/superAdmin/userGuide/userGuild')),
  },
  {
    path: '/feature-request',
    component: lazy(() =>
      import('../../views/superAdmin/settings/FeatureRequests')
    ),
  },
  {
    path: '/report-problem',
    component: lazy(() =>
      import('../../views/superAdmin/settings/ReportProblems')
    ),
  },

  /* inventroy */
  {
    path: '/product/all',
    component: lazy(() =>
      import('../../views/Admin/inventory/Products/ProductList')
    ),
    id: 'product-list',
    userGuide: 'inventory-products',
  },
  {
    path: '/product/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Products/AddProduct')
    ),
    id: 'product-list',
  },
  {
    path: '/product-details/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Products/ProductDetails')
    ),
    id: 'product-list',
  },
  {
    path: '/inventory-settings',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Settings/InventorySetting')
    ),
    id: 'inventory-setting',
    userGuide: 'inventory-settings',
  },
  {
    path: '/add-order/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Orders/AddOrder')
    ),
  },
  {
    path: '/orders',
    className: 'todo-application',
    component: lazy(() => import('../../views/Admin/inventory/Orders/Orders')),
    id: 'inventory-orders',
    userGuide: 'inventory-orders',
  },
  {
    path: '/offline-order-details/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Orders/OfflineOrderDetails')
    ),
    id: 'inventory-orders',
    userGuide: 'inventory-orders',
  },
  {
    path: '/online-order-details/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Orders/OnlineOrderDetails')
    ),
    id: 'inventory-orders',
    userGuide: 'inventory-orders',
  },

  /* settings */
  {
    exact: true,
    path: '/profile/:tab',
    component: lazy(() => import('../../views/settings/UserProfile')),
    userGuide: 'settings-profiles',
  },
  {
    path: '/integration',
    component: lazy(() => import('../../views/settings/Integration')),
  },
  {
    path: '/notification',
    component: lazy(() => import('../../views/settings/Notification')),
  },
  {
    path: '/faq',
    component: lazy(() => import('../../views/settings/Faq')),
  },
  {
    path: '/change-logs/:id',
    component: lazy(() => import('../../views/settings/AddChangeLog')),
  },
  {
    path: '/change-logs',
    component: lazy(() => import('../../views/settings/ChangeLogs')),
  },
  {
    path: '/logout',
    component: lazy(() => import('../../views/logout')),
  },
];
