import { lazy } from 'react'

export const memberDefaultRoute = '/member/home'

export const memberRoutes = [
  {
    path: '/member/home',
    component: lazy(() => import('../../views/Admin/Home/index')),
    userGuide: 'dashboard',
  },
  {
    path: '/member/company/checklists',
    component: lazy(() => import('../../views/Admin/checklists/Checklists')),
    id: 'templates',
    userGuide: 'company-checklist',
  },
  {
    path: '/member/marketing/web-forms/response/:id',
    component: lazy(() => import('../../views/forms/formResponse')),
    id: 'forms',
  },
  {
    path: '/member/marketing/web-forms/:id',
    component: lazy(() => import('../../views/forms/addForms')),
    id: 'forms',
  },
  {
    path: '/member/marketing/web-forms',
    component: lazy(() => import('../../views/forms/FormList')),
    id: 'forms',
    userGuide: 'marketing-forms',
  },
  {
    path: '/member/company/templates',
    component: lazy(() => import('../../views/templates/Templates')),
    id: 'templates',
  },
  {
    path: '/member/company/documents',
    component: lazy(() => import('../../views/document/Document')),
    id: 'documents',
    userGuide: 'company-files',
  },
  {
    path: '/member/company',
    component: lazy(() => import('../../views/Admin/company/CompanyDetail')),
    id: 'company-profile',
    userGuide: 'company-profile',
  },
  {
    path: '/member/group/contacts/:groupId/:groupName',
    component: lazy(() => import('../../views/Admin/groups/groupsPage')),
    id: 'manage-groups',
  },
  {
    path: '/member/contacts/all',
    component: lazy(() => import('../../views/Admin/contact')),
    id: 'contacts-list',
    userGuide: 'contacts-contacts',
  },
  {
    path: '/member/contact/:id',
    className: 'todo-application',
    component: lazy(() => import('../../views/Admin/contact/AddContact')),
    id: 'contacts-list',
  },
  {
    path: '/member/groups/manage-groups',
    component: lazy(() => import('../../views/Admin/groups')),
    id: 'manage-groups',
    userGuide: 'contacts-manage-groups',
  },
  {
    path: '/member/contacts/status',
    component: lazy(() => import('../../views/Admin/groups/Status')),
    id: 'status',
    userGuide: 'contacts-status',
  },
  {
    path: '/member/contacts/category',
    component: lazy(() => import('../../views/Admin/groups/Category')),
    id: 'categories',
    userGuide: 'contacts-category',
  },
  {
    path: '/member/contacts/tags',
    component: lazy(() => import('../../views/Admin/groups/Tags')),
    id: 'tags',
    userGuide: 'contacts-tags',
  },
  {
    path: '/member/contacts/custom-field',
    component: lazy(() => import('../../views/Admin/groups/CustomFields')),
    id: 'custom-fields',
    userGuide: 'contacts-custom-fields',
  },
  {
    path: '/member/pipeline/:id',
    component: lazy(() => import('../../views/Admin/pipeline/PipelineStages')),
    id: 'pipeline',
  },
  {
    path: '/member/pipeline',
    component: lazy(() => import('../../views/Admin/pipeline/index')),
    id: 'pipeline',
    userGuide: 'pipeline',
  },
  {
    path: '/member/templates/mass-sms',
    component: lazy(() =>
      import('../../views/superAdmin/marketing/SMSTemplates')
    ),
    id: 'mass-sms-tool',
    userGuide: 'marketing-sms-templates',
  },
  {
    path: '/member/mass-sms',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-sms-tool/MassSMS')
    ),
    id: 'mass-sms-tool',
    userGuide: 'marketing-mass-sms-blast',
  },
  {
    path: '/member/templates/mass-emails',
    component: lazy(() =>
      import('../../views/superAdmin/marketing/EmailTemplates')
    ),
    id: 'mass-email-tool',
    userGuide: 'marketing-mass-email-templates',
  },
  {
    path: '/member/mass-email/:id',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-email-tool/CreateMassEmail')
    ),
    id: 'mass-email-tool',
  },
  {
    path: '/member/mass-email',
    component: lazy(() =>
      import('../../views/Admin/campaigns/mass-email-tool/MassEmail')
    ),
    id: 'mass-email-tool',
    userGuide: 'marketing-mass-email-blast',
  },

  {
    path: '/member/event',
    component: lazy(() => import('../../views/Admin/event/Event')),
    userGuide: 'events',
  },

  // Direct Mail
  {
    path: '/member/templates/direct-mail/:id',
    component: lazy(() =>
      import(
        '../../views/directMail/DirectMailTemplate/components/AddEditDirectMailTemplate'
      )
    ),
    id: 'mass-email-tool',
    userGuide: 'marketing-direct-mail-templates',
  },
  {
    path: '/member/templates/direct-mail',
    component: lazy(() => import('../../views/directMail/DirectMailTemplate')),
    id: 'mass-email-tool',
    userGuide: 'marketing-direct-mail-templates',
  },
  {
    path: '/member/direct-mail/:id',
    component: lazy(() =>
      import('../../views/directMail/DirectMail/components/CreateDirectMail')
    ),
    id: 'mass-email-tool',
  },
  {
    path: '/member/direct-mail',
    component: lazy(() => import('../../views/directMail/DirectMail')),
    id: 'mass-email-tool',
    userGuide: 'marketing-create-direct-mail',
  },
  {
    path: '/member/envelope/:id',
    component: lazy(() =>
      import('../../views/directMail/Envelope/AddEditEnvelop')
    ),
    id: 'mass-email-tool',
    userGuide: 'envelope',
  },
  {
    path: '/member/envelope',
    component: lazy(() => import('../../views/directMail/Envelope')),
    id: 'mass-email-tool',
    userGuide: 'envelope',
  },

  // reports
  {
    path: '/member/reports',
    component: lazy(() => import('../../views/Admin/reports/Reports')),
    id: 'reports',
    userGuide: 'report',
  },

  // Billing
  {
    path: '/member/invoice/preview/:slug',
    component: lazy(() =>
      import('../../views/Admin/billing/Invoice/PreviewInvoice')
    ),
    id: 'invoice',
  },

  {
    path: '/member/invoice/print/:id',
    component: lazy(() =>
      import('../../views/Admin/billing/Invoice/components/InvoicePrint')
    ),
    layout: 'BlankLayout',
    id: 'invoice',
  },
  {
    path: '/member/invoice/:id',
    component: lazy(() =>
      import('../../views/Admin/billing/Invoice/AddInvoice')
    ),
    id: 'invoice',
  },
  {
    path: '/member/invoice/',
    component: lazy(() => import('../../views/Admin/billing/Invoice')),
    id: 'invoice',
    userGuide: 'billing-invoice',
  },
  {
    path: '/member/quote/print/:id',
    component: lazy(() =>
      import('../../views/Admin/billing/Quote/components/QuotePrint')
    ),
    layout: 'BlankLayout',
    id: 'quote',
  },
  {
    path: '/member/quote/preview/:slug',
    component: lazy(() =>
      import('../../views/Admin/billing/Quote/PreviewQuote')
    ),
    id: 'quote',
  },
  {
    path: '/member/quote/:id',
    component: lazy(() => import('../../views/Admin/billing/Quote/AddQuote')),
    id: 'quote',
  },
  {
    path: '/member/quote',
    component: lazy(() => import('../../views/Admin/billing/Quote/')),
    id: 'quote',
    userGuide: 'billing-quote',
  },
  {
    path: '/member/products',
    component: lazy(() => import('../../views/Admin/billing/Products')),
    id: 'products',
  },
  {
    path: '/member/product/one-time-product',
    component: lazy(() =>
      import('../../views/Admin/billing/Products/OneTimeProduct')
    ),
    id: 'products',
    userGuide: 'billing-one-time-products',
  },
  {
    path: '/member/product/recurring-product',
    component: lazy(() =>
      import('../../views/Admin/billing/Products/RecurringProduct')
    ),
    id: 'products',
    userGuide: 'billing-reccurring-products',
  },
  {
    path: '/member/product/product-category',
    component: lazy(() =>
      import('../../views/Admin/billing/Products/ProductCategory')
    ),
    id: 'products',
    userGuide: 'billing-product-categories',
  },
  {
    path: '/member/billing-profiles',
    component: lazy(() => import('../../views/Admin/billing/BillingProfiles')),
    id: 'billing-profiles',
    userGuide: 'billing-billing-profiles',
  },
  {
    path: '/member/payment-methods/:id',
    component: lazy(() =>
      import('../../views/Admin/billing/BillingProfiles/PaymentMethods')
    ),
    id: 'billing-profiles',
  },
  {
    path: '/member/billing-templates',
    component: lazy(() => import('../../views/Admin/billing/Templates')),
    id: 'billing-templates',
    userGuide: 'billing-templates',
  },

  // Task Manager
  {
    path: '/member/task-manager',
    exact: true,
    appLayout: true,
    className: 'todo-application',
    component: lazy(() => import('../../views/Admin/TaskManager/TaskManager')),
    id: 'task-manager',
    userGuide: 'task-manager',
  },

  {
    path: '/feature-request',
    component: lazy(() =>
      import('../../views/superAdmin/settings/FeatureRequests')
    ),
    userGuide: 'settings-feature-requests',
  },
  {
    path: '/report-problem',
    component: lazy(() =>
      import('../../views/superAdmin/settings/ReportProblems')
    ),
  },
  {
    exact: true,
    path: '/member/profile/:tab',
    component: lazy(() => import('../../views/settings/UserProfile')),
    userGuide: 'settings-profiles',
  },
  {
    path: '/member/change-logs',
    component: lazy(() => import('../../views/settings/ChangeLogs')),
    userGuide: 'settings-change-logs',
  },
  //inventory
  {
    path: '/member/product/all',
    component: lazy(() =>
      import('../../views/Admin/inventory/Products/ProductList')
    ),
    id: 'product-list',
    userGuide: 'inventory-products',
  },
  {
    path: '/member/product/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Products/AddProduct')
    ),
    id: 'product-list',
  },
  {
    path: '/member/product-details/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Products/ProductDetails')
    ),
    id: 'product-list',
  },
  {
    path: '/member/inventory-settings',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Settings/InventorySetting')
    ),
    id: 'inventory-setting',
    userGuide: 'inventory-settings',
  },
  {
    path: '/member/add-order/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Orders/AddOrder')
    ),
  },
  {
    path: '/member/orders',
    className: 'todo-application',
    component: lazy(() => import('../../views/Admin/inventory/Orders/Orders')),
    id: 'inventory-orders',
    userGuide: 'inventory-orders',
  },
  {
    path: '/member/offline-order-details/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Orders/OfflineOrderDetails')
    ),
    id: 'inventory-orders',
    userGuide: 'inventory-orders',
  },
  {
    path: '/member/online-order-details/:id',
    className: 'todo-application',
    component: lazy(() =>
      import('../../views/Admin/inventory/Orders/OnlineOrderDetails')
    ),
    id: 'inventory-orders',
    userGuide: 'inventory-orders',
  },
  {
    path: '/member/notification',
    component: lazy(() => import('../../views/settings/Notification')),
    userGuide: 'settings-notifications',
  },
  {
    path: '/member/faq',
    component: lazy(() => import('../../views/settings/Faq')),
    userGuide: 'settings-faq',
  },
  {
    path: '/logout',
    component: lazy(() => import('../../views/logout')),
  },
]
