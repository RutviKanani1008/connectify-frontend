export const EVENT_LABELS = [
  { value: 'Color1', label: 'Color1', color: 'primary' },
  { value: 'Color2', label: 'Color2', color: 'danger' },
  { value: 'Color3', label: 'Color3', color: 'warning' },
  { value: 'Color4', label: 'Color4', color: 'success' },
  { value: 'Color5', label: 'Color5', color: 'info' },
];

export const CALENDAR_COLOR = {
  Color1: 'primary',
  Color2: 'danger',
  Color3: 'warning',
  Color4: 'success',
  Color5: 'info',
};

export const EVENT_SCHEDULER_TYPE = [
  { value: 'never', label: 'Never' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const EVENT_END_TYPE = [
  { value: 'until', label: 'Until' },
  { value: 'count', label: 'Count' },
];

// =============== Billing ================
export const BILLING_RECURRING_SCHEDULE = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const BILLING_END_TYPE = [
  { value: 'until', label: 'Until' },
  { value: 'never', label: 'Never' },
];

export const RSVP_OPTION = [
  {
    label: 'Yes',
    value: 'yes',
  },
  { label: 'No', value: 'no' },
  { label: 'May be', value: 'May be' },
];

export const FORM_SCHEDULE_TIMER = [
  { value: 0, label: 'Instantly' },
  { value: 10, label: 'In 10 minutes' },
  { value: 30, label: 'In 30 minutes' },
  { value: 60, label: 'In 60 minutes' },
];

export const GENDER = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

export const PRODUCT_CATEGORY = [
  { label: 'category1', value: 'category1' },
  { label: 'category2', value: 'category2' },
  { label: 'category3', value: 'category3' },
  { label: 'category4', value: 'category4' },
];

export const PRODUCT_TYPE = [
  { label: 'OneTime', value: 'one-time' },
  { label: 'Recurring', value: 'recurring' },
];

export const PAYMENT_OPTION = [
  { label: 'Online', value: 'Online' },
  { label: 'Offline', value: 'Offline' },
];

export const PAYMENT_MODE = [
  { label: 'Manual Pay', value: 'Manual' },
  { label: 'Automatic Pay', value: 'Automatic' },
];

export const PAYMENT_TYPE = [
  { label: 'Full payment', value: 'fullPayment' },
  { label: 'Installment', value: 'installment' },
];

export const INSTALLMENT_CHARGES_TYPE = [
  { label: 'In Percentage', value: 'percentage' },
  { label: 'In Doller', value: 'doller' },
];

export const SEND_INVOICE_AFTER = [
  { label: '1 Day', value: 1 },
  { label: '2 Days', value: 2 },
  { label: '3 Days', value: 3 },
  { label: '4 Days', value: 4 },
  { label: '5 Days', value: 5 },
];

export const PRODUCT_CHARGES_TYPE = [
  { label: 'Percentage', value: 'percentage' },
  { label: 'Fix', value: 'fixed' },
];

export const TASK_SCHEDULER_TYPE = [
  { value: 'never', label: 'One Time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const paymentStatus = {
  draft: 'Draft',
  pending: 'Pending',
  paid: 'Paid',
  partiallyPaid: 'Partially Paid',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export const supportTicketStatus = [
  { label: 'In Queue', value: 'Pending', color: '#8c8c8c' },
  { label: 'In Progress', value: 'InProgress', color: '#ffa500' },
  { label: 'Done', value: 'Done', color: '#7d9943' },
];

export const featureRequestStatus = [
  { label: 'In Queue', value: 'Pending', color: '#8c8c8c' },
  { label: 'In Progress', value: 'InProgress', color: '#ffa500' },
  { label: 'Done', value: 'Done', color: '#7d9943' },
];

export const NotificationType = {
  NEW_TASK: 'new-task',
  NEW_UPDATE: 'new-update',
};

export const GROUP_DROPDOWN_TYPE = {
  group: 'group',
  status: 'status',
  category: 'category',
  tags: 'tags',
  pipeline: 'pipeline',
  pipelineStage: 'pipelineStage',
};

export const SNOZETASK_OPTIONS = [
  { value: 'day', label: '1 Day' },
  { value: 'week', label: '1 Week' },
  { value: 'month', label: '1 Month' },
];

export const AVAILABLE_FILE_FORMAT =
  '.pdf, .xlsx, .csv, .jpg, .jpeg, .png, .mp3, .heic, .docx, .doc, .ppt, .pptx, .svg';

export const AVAILABLE_FILE_UPLOAD_SIZE = 25;

export const AVAILABLE_FONT_STYLE = [
  {
    label: 'Arial',
    value: 'arial',
  },
  {
    label: 'Roboto',
    value: 'roboto',
  },
  {
    label: 'Allan',
    value: 'allan',
  },
  {
    label: 'Anonymous Pro',
    value: 'anonymous pro',
  },
  {
    label: 'Allerta',
    value: 'allerta',
  },
  {
    label: 'Agdasima',
    value: 'agdasima',
  },
  {
    label: 'Montserrat',
    value: 'montserrat',
  },
  {
    label: 'Oswald',
    value: 'oswald',
  },
  {
    label: 'Belanosima',
    value: 'belanosima',
  },
  {
    label: 'Playfair Display',
    value: 'playfairdisplay',
  },
  {
    label: 'Dancing Script',
    value: 'dancingscript',
  },
  {
    label: 'Teko',
    value: 'teko',
  },
  {
    label: 'Caveat',
    value: 'caveat',
  },
  {
    label: 'Gotham',
    value: "'Gotham', sans-serif",
  },
];
