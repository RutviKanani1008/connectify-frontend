import * as yup from 'yup';
import { required } from '../../../../../../configs/validationConstant';

export const personalInfoSchema = yup.object().shape({
  firstName: yup.string().required(required('First Name')),
  lastName: yup.string().required(required('last Name')),
  email: yup.string().email().required(required('Email')),
  phone: yup.string().required(required('Phone Number')).nullable(),
});
