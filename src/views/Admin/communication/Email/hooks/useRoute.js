import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';

const useGetMailRoute = ({ contactId }) => {
  const { basicRoute: baseRoute } = useGetBasicRoute();

  const getEmailModuleRoute = (route) => {
    if (contactId) {
      return `${baseRoute}/contact/${contactId}/email/${route}`;
    }
    return `${baseRoute}/communication/email/${route}`;
  };

  return { getEmailModuleRoute };
};

export default useGetMailRoute;
