// ** Package Imports **
import * as yup from 'yup';

// ** Helper *
import { required } from '../../../../configs/validationConstant';

export const addCompanyScheme = yup.object().shape({
  firstName: yup.string().required(required('FirstName')),
  email: yup.string().email().nullable(),
  website: yup
    .string()
    .nullable()
    .test('website', 'Please enter valid website', function (value) {
      if (value) {
        const schema = yup
          .string()
          .matches(
            /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm,
            'Please enter valid website'
          );
        return schema.isValidSync(value);
      }
      return true;
    }),
});

export const companyScheme = yup.object().shape({
  firstName: yup.string().required(required('FirstName')),
  email: yup.string().email().nullable(),
  website: yup
    .string()
    .nullable()
    .matches(
      /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm,
      'Please enter valid website'
    ),
});
