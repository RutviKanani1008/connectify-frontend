import React from 'react';
import {
  Mail,
  Home,
  Circle,
  Box,
  Users,
  Sliders,
  Tool,
  PieChart,
  Settings,
  User,
  Feather,
  ArrowUpRight,
  Activity,
  Calendar,
  Bell,
} from 'react-feather';
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
    id: 'dashboard',
    title: 'Dashboard',
    icon: <Box size={20} />,
    navLink: '/home',
  },
  {
    id: 'companies',
    title: 'Companies',
    icon: <Home size={20} />,
    children: [
      {
        id: 'list-of-companies',
        title: 'Companies',
        icon: <Circle size={12} />,
        navLink: '/company/all',
      },
      {
        id: 'add-company',
        title: 'Add Company',
        icon: <Circle size={12} />,
        navLink: '/company/add',
      },
      {
        id: 'forms',
        title: 'Forms',
        icon: <Circle size={12} />,
        navLink: '/marketing/web-forms',
      },
      {
        id: 'templates',
        title: 'Templates',
        icon: <Circle size={12} />,
        navLink: '/company/templates',
      },
      {
        id: 'documents',
        title: 'Documents',
        icon: <Circle size={12} />,
        navLink: '/company/documents',
      },
    ],
  },
  {
    id: 'company-members',
    title: 'Company Members',
    icon: <Users size={20} />,
    children: [
      {
        id: 'company-member',
        title: 'Company Members',
        icon: <Circle size={12} />,
        navLink: '/company-member',
      },
      {
        id: 'add-company-member',
        title: 'Add Company Members',
        icon: <Circle size={12} />,
        navLink: '/member/add',
      },
      {
        id: 'member-categories',
        title: 'Member Categories',
        icon: <Circle size={12} />,
        navLink: '/member-categories',
      },
      {
        id: 'member-tags',
        title: 'Member Tags',
        icon: <Circle size={12} />,
        navLink: '/member/tags',
      },
      {
        id: 'memberPipeline',
        title: 'Company Pipeline',
        icon: <Circle size={20} />,
        navLink: '/member/pipeline',
      },
    ],
  },
  {
    id: 'contacts',
    title: 'Contacts',
    icon: <Users size={20} />,
    children: [
      {
        id: 'all-contacts',
        title: 'Contacts',
        icon: <Circle size={12} />,
        navLink: '/contacts/all',
      },
      {
        id: 'add-contacts',
        title: 'Add Contact',
        icon: <Circle size={12} />,
        navLink: '/contacts/add',
      },
      {
        id: 'contact-tags',
        title: 'Contact Tags',
        icon: <Circle size={12} />,
        navLink: '/contacts/tags',
      },
      {
        id: 'contactPipeline',
        title: 'Contact Pipeline',
        icon: <Circle size={20} />,
        navLink: '/pipeline',
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: <PieChart size={20} />,
    children: [
      {
        id: 'all-reports',
        title: 'Reports',
        icon: <Circle size={12} />,
        navLink: '/reports',
      },
    ],
  },
  {
    id: 'setting',
    title: 'Setting',
    icon: <Settings size={20} />,
    children: [
      {
        id: 'updateProfile',
        title: 'Profile',
        icon: <User size={12} />,
        navLink: '/setting/update-profile',
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
        title: 'Report Problem',
        icon: <ArrowUpRight size={12} />,
        navLink: '/report-problem',
      },
      {
        id: 'change-log',
        title: 'Change Log',
        icon: <Activity size={12} />,
        navLink: '/change-logs',
      },
    ],
  },
];

export const companyNavItems = [
  {
    id: 'home',
    title: 'Home',
    icon: <Home size={20} />,
    navLink: '/admin/home',
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
        navLink: '/admin/company',
      },
      {
        id: 'forms',
        title: 'Forms',
        icon: <Circle size={12} />,
        navLink: '/admin/marketing/web-forms',
      },
      {
        id: 'templates',
        title: 'Templates',
        icon: <Circle size={12} />,
        navLink: '/admin/company/templates',
      },
      {
        id: 'documents',
        title: 'Documents',
        icon: <Circle size={12} />,
        navLink: '/admin/company/documents',
      },
    ],
  },
  {
    id: 'event',
    title: 'Events',
    icon: <Calendar size={20} />,
    navLink: '/admin/event',
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
        id: 'add-contact',
        title: 'Add New Contact',
        icon: <Circle size={12} />,
        navLink: '/admin/contact/add',
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
    title: 'Pipelines',
    icon: <Sliders size={20} />,
    navLink: '/admin/pipeline',
  },
  {
    id: 'campaigns',
    title: 'Campaigns',
    icon: <Tool size={20} />,
    children: [
      {
        id: 'mass-sms-tool',
        title: 'Mass SMS Tool',
        icon: <Circle size={12} />,
        navLink: '/admin/mass-sms',
      },
      {
        id: 'mass-email-tool',
        title: 'Mass Email Tool',
        icon: <Circle size={12} />,
        navLink: '/admin/mass-email',
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: <PieChart size={20} />,
    navLink: '/admin/reports',
    children: [
      {
        id: 'reports',
        title: 'Reports',
        icon: <Circle size={12} />,
        navLink: '/admin/reports',
      },
    ],
  },
  {
    id: 'setting',
    title: 'Setting',
    icon: <Settings size={20} />,
    children: [
      {
        id: 'updateProfile',
        title: 'Profile',
        icon: <User size={12} />,
        navLink: '/admin/update-profile',
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
        navLink: '/admin/feature-request',
      },
      {
        id: 'sendRequest',
        title: 'Report Problem',
        icon: <ArrowUpRight size={12} />,
        navLink: '/report-problem',
      },
      {
        id: 'change-log',
        title: 'Change Log',
        icon: <Activity size={12} />,
        navLink: '/admin/change-logs',
      },
    ],
  },
];

export const memberNavItems = [
  {
    id: 'home',
    title: 'Home',
    icon: <Home size={20} />,
    navLink: '/member/home',
  },
  {
    id: 'company',
    title: 'Company',
    icon: <Home size={20} />,
    children: [
      {
        id: 'company-member',
        title: 'Company Members',
        icon: <Circle size={12} />,
        navLink: '/member/company-member',
      },
      {
        id: 'documents',
        title: 'Documents',
        icon: <Circle size={12} />,
        navLink: '/member/company/documents',
      },
    ],
  },
  {
    id: 'setting',
    title: 'Setting',
    icon: <Settings size={20} />,
    children: [
      {
        id: 'updateProfile',
        title: 'Profile',
        icon: <User size={12} />,
        navLink: '/member/update-profile',
      },
      {
        id: 'notification',
        title: 'Notifications',
        icon: <Bell size={12} />,
        navLink: '/member/notification',
      },
      {
        id: 'change-log',
        title: 'Change Log',
        icon: <Activity size={12} />,
        navLink: '/member/change-logs',
      },
    ],
  },
];
