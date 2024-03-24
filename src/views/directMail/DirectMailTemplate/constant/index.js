export const DIRECT_MAIL_DYNAMIC_VARS = [
  { label: 'First Name', value: 'firstName' },
  { label: 'Last Name', value: 'lastName' },
  { label: 'Company Name', value: 'company_name' },
  { label: 'Company Type', value: 'companyType' },
  { label: 'Website', value: 'website' },
  { label: 'Email', value: 'email' },
  { label: 'Phone Number', value: 'phone' },
  { label: 'Address Line 1', value: 'address1' },
  { label: 'Address Line 2', value: 'address2' },
  { label: 'City', value: 'city' },
  { label: 'State', value: 'state' },
  { label: 'Zip Code', value: 'country' },
];

export const TEMPLATE_TYPE_OPTION = [
  {
    label: 'Letter',
    value: 'letter',
  },
  {
    label: 'Postcard',
    value: 'postcard',
  },
];

export const POST_CARD_SIZE_OPTION = [
  {
    label: '4x6',
    value: '4.25x6.25',
  },
  {
    label: '6x9',
    value: '6.25x9.25',
  },
  {
    label: '6x11',
    value: '6.25x11.25',
  },
];

export const POST_CARD_WIDTH_HEIGH = {
  '4.25x6.25': {
    height: 1275,
    width: 1875,
  },
  '6.25x9.25': {
    height: 1875,
    width: 2775,
  },
  '6.25x11.25': {
    height: 1875,
    width: 3375,
  },
};
