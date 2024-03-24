import React from 'react';
import {
  Mail,
  Home,
  Circle,
  Box,
  Users,
  Sliders,
  PieChart,
  Settings,
  User,
  Feather,
  ArrowUpRight,
  Activity,
  Calendar,
  Bell,
  HelpCircle,
  Power,
  FileText,
  ShoppingBag,
} from 'react-feather';
import { Icon } from '@iconify/react';

import { ReactComponent as CompanyIcon } from '@src/assets/images/icons/company-icon.svg';

export default [
  {
    id: 'home',
    title: 'Home',
    icon: <Home size={20} />,
    navLink: '/home',
  },
  {
    id: 'secondPage',
    title: 'Second Page',
    icon: <Mail size={20} />,
    navLink: '/second-page',
  },
];

export const superAdminNavItems = [
  {
    header: 'Superadmin',
  },
  {
    id: 'companies',
    title: 'Companies',
    icon: <Home size={20} />,
    children: [
      {
        id: 'list-of-companies',
        title: 'Direct Companies',
        icon: <Circle size={12} />,
        navLink: '/companies/all',
      },
      {
        id: 'white-label-companies',
        title: 'White Label Companies ',
        icon: <Circle size={12} />,
        navLink: '/companies/white-label',
      },
      {
        id: 'child-companies',
        title: 'Child Companies ',
        icon: <Circle size={12} />,
        navLink: '/companies/child',
      },
    ],
  },

  {
    id: 'templates',
    title: 'Email Templates',
    icon: <Mail size={20} />,
    children: [
      {
        id: 'inter-communications-templates',
        title: 'Internal Communication Templates',
        icon: <Circle size={12} />,
        navLink: '/inter-communications-templates',
      },
    ],
  },
  {
    id: 'sendRequest',
    title: 'Support Tickets ',
    icon: <ArrowUpRight size={20} />,
    navLink: '/report-problem',
  },
  {
    id: 'featureRequest',
    title: 'Feature Request',
    icon: <Feather size={12} />,
    navLink: '/feature-request',
  },
  {
    id: 'userGuide',
    title: 'User Guide',
    icon: <Icon icon='icon-park-outline:guide-board' width='12' />,
    navLink: '/user-guide',
  },
  {
    id: 'cmsContent',
    title: 'CMS Content',
    icon: <Icon icon='mdi:code-block-html' width='12' />,
    navLink: '/cms-content',
  },
  {
    header: 'General',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <Box size={20} />,
    navLink: '/home',
  },
  {
    id: 'company',
    title: 'Company',
    icon: <CompanyIcon className='sidebar-company-icon' size={20} />,
    children: [
      {
        id: 'company-profile',
        title: 'Profile',
        icon: <Circle size={12} />,
        navLink: '/company',
      },
      {
        id: 'users',
        title: 'Users',
        icon: <Circle size={12} />,
        navLink: '/users',
      },
      {
        id: 'templates',
        title: 'Checklists',
        icon: <Circle size={12} />,
        navLink: '/company/checklists',
      },
      {
        id: 'documents',
        title: 'Files',
        icon: <Circle size={12} />,
        navLink: '/company/documents',
      },
    ],
  },
  {
    id: 'contacts',
    title: 'Contacts',
    icon: <Users size={20} />,
    children: [
      {
        id: 'contacts-list',
        title: 'Contacts',
        icon: <Circle size={12} />,
        navLink: '/contacts/all',
      },
      {
        id: 'manage-groups',
        title: 'Groups',
        icon: <Circle size={12} />,
        navLink: '/groups/manage-groups',
      },
      {
        id: 'categories',
        title: 'Category',
        icon: <Circle size={12} />,
        navLink: '/contacts/category',
      },
      {
        id: 'status',
        title: 'Status',
        icon: <Circle size={12} />,
        navLink: '/contacts/status',
      },
      {
        id: 'tags',
        title: 'Tags',
        icon: <Circle size={12} />,
        navLink: '/contacts/tags',
      },
      {
        id: 'custom-fields',
        title: 'Custom Fields',
        icon: <Circle size={12} />,
        navLink: '/contacts/custom-field',
      },
    ],
  },
  {
    id: 'pipeline',
    title: 'Pipeline',
    icon: <Sliders size={20} />,
    navLink: '/pipeline',
  },
  {
    id: 'event',
    title: 'Events',
    icon: <Calendar size={20} />,
    navLink: '/event',
  },
  {
    id: 'campaigns',
    title: 'Marketing',
    icon: <Icon icon='nimbus:marketing' width='12' />,
    children: [
      {
        id: 'forms',
        title: 'Forms',
        icon: <Circle size={12} />,
        navLink: '/marketing/web-forms',
      },
      {
        id: 'mass-sms-tool',
        title: 'Mass SMS Tool',
        icon: <Circle size={12} />,
        children: [
          {
            id: 'sms-templates',
            title: 'SMS Templates',
            icon: <Circle size={12} />,
            navLink: '/templates/mass-sms',
          },
          {
            id: 'mass-sms-blast',
            title: 'Mass SMS Blast',
            icon: <Circle size={12} />,
            navLink: '/mass-sms',
          },
        ],
      },
      {
        id: 'mass-email-tool',
        title: 'Mass Emails Tool',
        icon: <Circle size={12} />,
        children: [
          {
            id: 'email-templates',
            title: 'Email Templates',
            icon: <Circle size={12} />,
            navLink: '/templates/mass-emails',
          },
          {
            id: 'mass-email-blast',
            title: 'Mass Email Blast',
            icon: <Circle size={12} />,
            navLink: '/mass-email',
          },
        ],
      },
    ],
  },

  {
    id: 'reports',
    title: 'Reports',
    icon: <PieChart size={20} />,
    navLink: '/reports',
  },
  {
    id: 'billing',
    title: 'Billing',
    icon: <FileText size={20} />,
    children: [
      {
        id: 'quote',
        title: 'Quote',
        icon: <Circle size={12} />,
        navLink: '/quote',
      },
      {
        id: 'invoice',
        title: 'Invoice',
        icon: <Circle size={12} />,
        navLink: '/invoice',
      },
      {
        id: 'products',
        title: 'Products',
        icon: <Circle size={12} />,
        children: [
          {
            id: 'one-time-product',
            title: 'One Time Product',
            icon: <Circle size={12} />,
            navLink: '/product/one-time-product',
          },
          {
            id: 'recurring-product',
            title: 'Reccurring Product',
            icon: <Circle size={12} />,
            navLink: '/product/recurring-product',
          },
          {
            id: 'product-category',
            title: 'Product Category',
            icon: <Circle size={12} />,
            navLink: '/product/product-category',
          },
        ],
      },
      {
        id: 'billing-profiles',
        title: 'Billing Profiles',
        icon: <Circle size={12} />,
        navLink: '/billing-profiles',
      },
      {
        id: 'billing-templates',
        title: 'Templates',
        icon: <Circle size={12} />,
        navLink: '/billing-templates',
      },
    ],
  },
  {
    id: 'task-manager',
    title: 'Task Manager',
    icon: <Icon icon='nimbus:marketing' width='12' />,
    children: [
      {
        id: 'task-manager',
        title: 'Task Manager',
        icon: <Icon icon='pajamas:task-done' width='12' />,
        navLink: '/admin/task-manager',
      },
      {
        id: 'task-timer-report',
        title: 'Task Report',
        icon: <Icon icon='pajamas:task-done' width='12' />,
        navLink: '/admin/task-report',
      },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: <ShoppingBag size={20} />,
    children: [
      {
        id: 'product-list',
        title: 'Products',
        icon: <Circle size={12} />,
        navLink: '/product/all',
      },
      {
        id: 'inventory-orders',
        title: 'Orders',
        icon: <Circle size={12} />,
        navLink: '/orders',
      },
      {
        id: 'inventory-setting',
        title: 'Settings',
        icon: <Circle size={12} />,
        navLink: '/inventory-settings',
      },
    ],
  },
  {
    id: 'setting',
    title: 'Setting',
    icon: <Settings size={20} />,
    children: [
      {
        id: 'profile',
        title: 'Profile',
        icon: <User size={12} />,
        navLink: '/profile/personal-information',
      },
      {
        id: 'integration',
        title: 'Integration',
        icon: <User size={12} />,
        navLink: '/integration',
      },
      {
        id: 'notification',
        title: 'Notifications',
        icon: <Bell size={12} />,
        navLink: '/notification',
      },
      {
        id: 'featureRequest',
        title: 'Feature Request',
        icon: <Feather size={12} />,
        navLink: '/feature-request',
      },
      {
        id: 'sendRequest',
        title: 'Support Tickets ',
        icon: <ArrowUpRight size={12} />,
        navLink: '/report-problem',
      },
      {
        id: 'faq',
        title: 'FAQ',
        icon: <HelpCircle size={12} />,
        navLink: '/faq',
      },
      {
        id: 'change-log',
        title: 'Change Log',
        icon: <Activity size={12} />,
        navLink: '/change-logs',
      },
      {
        id: 'logout',
        title: 'Log Out',
        icon: <Power size={12} />,
        navLink: '/logout',
      },
    ],
  },
];

export const companyNavItems = [
  {
    id: 'home',
    title: 'Dashboard',
    icon: <Box size={20} />,
    navLink: '/admin/home',
  },
  {
    id: 'company',
    title: 'Company',
    icon: <CompanyIcon className='sidebar-company-icon' size={20} />,
    children: [
      {
        id: 'company-profile',
        title: 'Profile',
        icon: <Circle size={12} />,
        navLink: '/admin/company',
      },
      {
        id: 'users',
        title: 'Users',
        icon: <Circle size={12} />,
        navLink: '/admin/users',
      },
      {
        id: 'templates',
        title: 'Checklist',
        icon: <Circle size={12} />,
        navLink: '/admin/company/checklists',
      },
      {
        id: 'documents',
        title: 'Files',
        icon: <Circle size={12} />,
        navLink: '/admin/company/documents',
      },
    ],
  },
  {
    id: 'contacts',
    title: 'Contacts',
    icon: <Users size={20} />,
    children: [
      {
        id: 'contacts-list',
        title: 'Contacts',
        icon: <Circle size={12} />,
        navLink: '/admin/contacts/all',
      },
      {
        id: 'manage-groups',
        title: 'Manage Groups',
        icon: <Circle size={12} />,
        navLink: '/admin/groups/manage-groups',
      },
      {
        id: 'categories',
        title: 'Category',
        icon: <Circle size={12} />,
        navLink: '/admin/contacts/category',
      },
      {
        id: 'status',
        title: 'Status',
        icon: <Circle size={12} />,
        navLink: '/admin/contacts/status',
      },
      {
        id: 'tags',
        title: 'Tags',
        icon: <Circle size={12} />,
        navLink: '/admin/contacts/tags',
      },
      {
        id: 'custom-fields',
        title: 'Custom Fields',
        icon: <Circle size={12} />,
        navLink: '/admin/contacts/custom-field',
      },
    ],
  },
  {
    id: 'pipeline',
    title: 'Pipeline',
    icon: <Sliders size={20} />,
    navLink: '/admin/pipeline',
  },
  {
    id: 'event',
    title: 'Events',
    icon: <Calendar size={20} />,
    navLink: '/admin/event',
  },
  {
    id: 'campaigns',
    title: 'Marketing',
    icon: <Icon icon='nimbus:marketing' width='12' />,
    children: [
      {
        id: 'forms',
        title: 'Forms',
        icon: <Circle size={12} />,
        navLink: '/admin/marketing/web-forms',
      },
      {
        id: 'mass-sms-tool',
        title: 'Mass SMS Tool',
        icon: <Circle size={12} />,
        children: [
          {
            id: 'sms-templates',
            title: 'SMS Templates',
            icon: <Circle size={12} />,
            navLink: '/admin/templates/mass-sms',
          },
          {
            id: 'mass-sms-blast',
            title: 'Mass SMS Blast',
            icon: <Circle size={12} />,
            navLink: '/admin/mass-sms',
          },
        ],
      },
      {
        id: 'mass-email-tool',
        title: 'Mass Email Tool',
        icon: <Circle size={12} />,
        children: [
          {
            id: 'email-templates',
            title: 'Email Templates',
            icon: <Circle size={12} />,
            navLink: '/admin/templates/mass-emails',
          },
          {
            id: 'mass-email-blast',
            title: 'Mass Email Blast',
            icon: <Circle size={12} />,
            navLink: '/admin/mass-email',
          },
        ],
      },
      {
        id: 'direct-mail',
        title: 'Direct Mail',
        icon: <Circle size={12} />,
        children: [
          {
            id: 'direct-mail-template',
            title: 'Direct Mail Templates',
            icon: <Circle size={12} />,
            navLink: '/admin/templates/direct-mail',
          },
          {
            id: 'create-direct-mail',
            title: 'Create Direct Mail',
            icon: <Circle size={12} />,
            navLink: '/admin/direct-mail',
          },
          {
            id: 'envelope',
            title: 'Envelope',
            icon: <Circle size={12} />,
            navLink: '/admin/envelope',
          },
        ],
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: <PieChart size={20} />,
    navLink: '/admin/reports',
  },
  {
    id: 'billing',
    title: 'Billing',
    icon: <FileText size={20} />,
    children: [
      {
        id: 'quote',
        title: 'Quote',
        icon: <Circle size={12} />,
        navLink: '/admin/quote',
      },
      {
        id: 'invoice',
        title: 'Invoice',
        icon: <Circle size={12} />,
        navLink: '/admin/invoice',
      },
      {
        id: 'products',
        title: 'Products',
        icon: <Circle size={12} />,
        children: [
          {
            id: 'one-time-product',
            title: 'One Time Product',
            icon: <Circle size={12} />,
            navLink: '/admin/product/one-time-product',
          },
          {
            id: 'recurring-product',
            title: 'Reccurring Product',
            icon: <Circle size={12} />,
            navLink: '/admin/product/recurring-product',
          },
          {
            id: 'product-category',
            title: 'Product Category',
            icon: <Circle size={12} />,
            navLink: '/admin/product/product-category',
          },
        ],
      },
      {
        id: 'billing-profiles',
        title: 'Billing Profiles',
        icon: <Circle size={12} />,
        navLink: '/admin/billing-profiles',
      },
      {
        id: 'billing-templates',
        title: 'Templates',
        icon: <Circle size={12} />,
        navLink: '/admin/billing-templates',
      },
    ],
  },
  {
    id: 'task-manager',
    title: 'Task Manager',
    icon: <Icon icon='nimbus:marketing' width='12' />,
    children: [
      {
        id: 'task-manager',
        title: 'Task Manager',
        icon: <Icon icon='pajamas:task-done' width='12' />,
        navLink: '/admin/task-manager',
      },
      {
        id: 'task-timer-report',
        title: 'Task Report',
        icon: <Icon icon='pajamas:task-done' width='12' />,
        navLink: '/admin/task-report',
      },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    icon: (
      <Icon className='cursor-pointer' icon='mdi:account-voice' width='12' />
    ),
    children: [
      {
        id: 'email',
        title: 'Email',
        icon: (
          <Icon
            width='20'
            className='cursor-pointer'
            icon='mdi:email-outline'
          />
        ),
        navLink: '/admin/communication/email/Inbox',
      },
      {
        id: 'communication-settings',
        title: 'Settings',
        icon: <Settings size={12} />,
        navLink: '/admin/communication/settings',
      },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: <ShoppingBag size={20} />,
    children: [
      {
        id: 'product-list',
        title: 'Products',
        icon: <Circle size={12} />,
        navLink: '/admin/product/all',
      },
      {
        id: 'inventory-orders',
        title: 'Orders',
        icon: <Circle size={12} />,
        navLink: '/admin/orders',
      },
      {
        id: 'inventory-setting',
        title: 'Settings',
        icon: <Circle size={12} />,
        navLink: '/admin/inventory-settings',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Settings size={20} />,
    children: [
      {
        id: 'profile',
        title: 'Profile',
        icon: <User size={12} />,
        navLink: '/admin/profile/personal-information',
      },
      {
        id: 'integration',
        title: 'Integration',
        icon: <User size={12} />,
        navLink: '/admin/integration',
      },
      {
        id: 'notification',
        title: 'Notifications',
        icon: <Bell size={12} />,
        navLink: '/admin/notification',
      },
      {
        id: 'featureRequest',
        title: 'Feature Request',
        icon: <Feather size={12} />,
        navLink: '/feature-request',
      },
      {
        id: 'sendRequest',
        title: 'Support Tickets ',
        icon: <ArrowUpRight size={12} />,
        navLink: '/report-problem',
      },
      {
        id: 'faq',
        title: 'FAQ',
        icon: <HelpCircle size={12} />,
        navLink: '/admin/faq',
      },
      {
        id: 'change-log',
        title: 'Change Log',
        icon: <Activity size={12} />,
        navLink: '/admin/change-logs',
      },
      {
        id: 'logout',
        title: 'Log Out',
        icon: <Power size={12} />,
        navLink: '/logout',
      },
    ],
  },
];

export const memberNavItems = [
  {
    id: 'home',
    title: 'Dashboard',
    icon: <Box size={20} />,
    navLink: '/member/home',
  },
  {
    id: 'company',
    title: 'Company',
    icon: <Home size={20} />,
    children: [
      {
        id: 'company-profile',
        title: 'Profile',
        icon: <Circle size={12} />,
        navLink: '/member/company',
      },
      {
        id: 'templates',
        title: 'Checklists',
        icon: <Circle size={12} />,
        navLink: '/member/company/checklists',
      },
      {
        id: 'documents',
        title: 'Files',
        icon: <Circle size={12} />,
        navLink: '/member/company/documents',
      },
    ],
  },
  {
    id: 'contacts',
    title: 'Contacts',
    icon: <Users size={20} />,
    children: [
      {
        id: 'contacts-list',
        title: 'Contacts',
        icon: <Circle size={12} />,
        navLink: '/member/contacts/all',
      },
      {
        id: 'manage-groups',
        title: 'Manage Groups',
        icon: <Circle size={12} />,
        navLink: '/member/groups/manage-groups',
      },
      {
        id: 'categories',
        title: 'Category',
        icon: <Circle size={12} />,
        navLink: '/member/contacts/category',
      },
      {
        id: 'status',
        title: 'Status',
        icon: <Circle size={12} />,
        navLink: '/member/contacts/status',
      },
      {
        id: 'tags',
        title: 'Tags',
        icon: <Circle size={12} />,
        navLink: '/member/contacts/tags',
      },
      {
        id: 'custom-fields',
        title: 'Custom Fields',
        icon: <Circle size={12} />,
        navLink: '/member/contacts/custom-field',
      },
    ],
  },
  {
    id: 'pipeline',
    title: 'Pipeline',
    icon: <Sliders size={20} />,
    navLink: '/member/pipeline',
  },
  {
    id: 'campaigns',
    title: 'Marketing',
    icon: <Icon icon='nimbus:marketing' width='12' />,
    children: [
      {
        id: 'forms',
        title: 'Forms',
        icon: <Circle size={12} />,
        navLink: '/member/marketing/web-forms',
      },
      {
        id: 'mass-sms-tool',
        title: 'Mass SMS Tool',
        icon: <Circle size={12} />,
        children: [
          {
            id: 'sms-templates',
            title: 'SMS Templates',
            icon: <Circle size={12} />,
            navLink: '/member/templates/mass-sms',
          },
          {
            id: 'mass-sms-blast',
            title: 'Mass SMS Blast',
            icon: <Circle size={12} />,
            navLink: '/member/mass-sms',
          },
        ],
      },
      {
        id: 'mass-email-tool',
        title: 'Mass Email Tool',
        icon: <Circle size={12} />,
        children: [
          {
            id: 'email-templates',
            title: 'Email Templates',
            icon: <Circle size={12} />,
            navLink: '/member/templates/mass-emails',
          },
          {
            id: 'mass-email-blast',
            title: 'Mass Email Blast',
            icon: <Circle size={12} />,
            navLink: '/member/mass-email',
          },
        ],
      },
      {
        id: 'direct-mail',
        title: 'Direct Mail',
        icon: <Circle size={12} />,
        children: [
          {
            id: 'direct-mail-template',
            title: 'Direct Mail Templates',
            icon: <Circle size={12} />,
            navLink: '/member/templates/direct-mail',
          },
          {
            id: 'create-direct-mail',
            title: 'Create Direct Mail',
            icon: <Circle size={12} />,
            navLink: '/member/direct-mail',
          },
          {
            id: 'envelope',
            title: 'Envelope',
            icon: <Circle size={12} />,
            navLink: '/member/envelope',
          },
        ],
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: <PieChart size={20} />,
    navLink: '/member/reports',
  },
  {
    id: 'billing',
    title: 'Billing',
    icon: <FileText size={20} />,
    children: [
      {
        id: 'quote',
        title: 'Quote',
        icon: <Circle size={12} />,
        navLink: '/member/quote',
      },
      {
        id: 'invoice',
        title: 'Invoice',
        icon: <Circle size={12} />,
        navLink: '/member/invoice',
      },
      {
        id: 'products',
        title: 'Products',
        icon: <Circle size={12} />,
        children: [
          {
            id: 'one-time-product',
            title: 'One Time Product',
            icon: <Circle size={12} />,
            navLink: '/member/product/one-time-product',
          },
          {
            id: 'recurring-product',
            title: 'Reccurring Product',
            icon: <Circle size={12} />,
            navLink: '/member/product/recurring-product',
          },
          {
            id: 'product-category',
            title: 'Product Category',
            icon: <Circle size={12} />,
            navLink: '/member/product/product-category',
          },
        ],
      },
      {
        id: 'billing-profiles',
        title: 'Billing Profiles',
        icon: <Circle size={12} />,
        navLink: '/member/billing-profiles',
      },
      {
        id: 'billing-templates',
        title: 'Templates',
        icon: <Circle size={12} />,
        navLink: '/member/billing-templates',
      },
    ],
  },
  {
    id: 'task-manager',
    title: 'Task Manager',
    icon: <Icon icon='pajamas:task-done' width='12' />,
    navLink: '/member/task-manager',
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: <ShoppingBag size={20} />,
    children: [
      {
        id: 'product-list',
        title: 'Products',
        icon: <Circle size={12} />,
        navLink: '/member/product/all',
      },
      {
        id: 'inventory-orders',
        title: 'Orders',
        icon: <Circle size={12} />,
        navLink: '/member/orders',
      },
      {
        id: 'inventory-setting',
        title: 'Settings',
        icon: <Circle size={12} />,
        navLink: '/member/inventory-settings',
      },
    ],
  },
  {
    id: 'setting',
    title: 'Settings',
    icon: <Settings size={20} />,
    children: [
      {
        id: 'profile',
        title: 'Profile',
        icon: <User size={12} />,
        navLink: '/member/profile/personal-information',
      },
      {
        id: 'notification',
        title: 'Notifications',
        icon: <Bell size={12} />,
        navLink: '/member/notification',
      },
      {
        id: 'featureRequest',
        title: 'Feature Request',
        icon: <Feather size={12} />,
        navLink: '/feature-request',
      },
      {
        id: 'sendRequest',
        title: 'Support Tickets ',
        icon: <ArrowUpRight size={12} />,
        navLink: '/report-problem',
      },
      {
        id: 'change-log',
        title: 'Change Log',
        icon: <Activity size={12} />,
        navLink: '/member/change-logs',
      },
      {
        id: 'logout',
        title: 'Log Out',
        icon: <Power size={12} />,
        navLink: '/logout',
      },
    ],
  },
];
