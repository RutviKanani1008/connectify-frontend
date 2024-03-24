export const MAIL_LABELS = {
  Inbox: 'Inbox',
  Sent: 'Sent',
  Draft: 'Draft',
  Starred: 'Starred',
  Archive: 'Archive',
  Trash: 'Trash',
  Spam: 'Spam',
};

export const KNOWN_HOSTS = {
  GMAIL: 'gmail',
  OUTLOOK: 'outlook',
  YAHOO: 'yahoo',
  AOL: 'aol',
};

export const EMAIL_VIEW_TYPE = {
  STANDARD: 'STANDARD',
  SIDE_BY_SIDE: 'SIDE_BY_SIDE',
};

export const KNOWN_HOSTS_INFO = [
  {
    host: KNOWN_HOSTS.GMAIL,
    serverDomain: 'gmail.com',
    config: {
      smtp: { host: 'smtp.gmail.com', port: 587 },
      imap: { host: 'imap.gmail.com', port: 993 },
    },
  },
  {
    host: KNOWN_HOSTS.OUTLOOK,
    serverDomain: 'outlook.com',
    config: {
      smtp: { host: 'smtp.outlook.com', port: 587 },
      imap: { host: 'imap.outlook.com', port: 993 },
    },
  },
  {
    host: KNOWN_HOSTS.YAHOO,
    serverDomain: 'yahoo.com',
    config: {
      smtp: { host: 'smtp.mail.yahoo.com', port: 465 },
      imap: { host: 'imap.mail.yahoo.com', port: 993 },
    },
  },
  {
    host: KNOWN_HOSTS.AOL,
    serverDomain: 'aol.com',
    config: {
      smtp: { host: 'smtp.aol.com', port: 465 },
      imap: { host: 'imap.aol.com', port: 993 },
    },
  },
];

export const EXCLUDE_FROM_MOVABLE_FOLDER_LIST = [
  'INBOX',
  '[Gmail]/All Mail',
  '[Gmail]/Drafts',
  '[Gmail]/Sent Mail',
  '[Gmail]/Starred',
  'Inbox',
  'Sent',
  'Drafts',
];

export const MAIL_REPLY_OPTIONS = [
  {
    value: 'reply',
    label: 'Reply',
  },
  // {
  //   value: 'reply-all',
  //   label: 'Reply to all',
  // },
  {
    value: 'forward',
    label: 'Forward',
  },
];
