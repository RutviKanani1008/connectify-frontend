// ==================== Packages =======================
import { useEffect, useState } from 'react';
// ====================================================
import UILoader from '@components/ui-loader';
import ItemTable from '../../../../@core/components/data-table';
import { useCustomersColumn } from './hooks/customersColumn';
import { useGetCustomers } from './hooks/customerApis';
import AddPaymentMethodModal from './components/AddPaymentMethodModal';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ExportData from '../../../../components/ExportData';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const BillingProfiles = () => {
  // ========================== states ================================
  const [customers, setCustomers] = useState([]);
  const [isOpen, setIsOpen] = useState({
    toggle: false,
    id: '',
    billingCustomerId: '',
  });

  // ========================== Custom Hooks ==========================
  const { getCustomers, isLoading } = useGetCustomers();
  const { customersColumns } = useCustomersColumn({ setIsOpen });

  useEffect(() => {
    getRecords(false);
  }, []);

  const getRecords = async () => {
    const { data, error } = await getCustomers();

    if (!error) setCustomers(data);
  };

  return (
    <>
      <UILoader blocking={isLoading}>
        <ItemTable
          ExportData={
            <ExportData
              model='contact'
              query={{ enableBilling: true, fileName: 'billing-profile' }}
            />
          }
          columns={customersColumns()}
          hideButton={true}
          data={customers}
          title='Billing Profiles'
          addItemLink={false}
          itemsPerPage={10}
        />
      </UILoader>
      {isOpen.toggle && (
        <Elements stripe={stripePromise}>
          <AddPaymentMethodModal setIsOpen={setIsOpen} isOpen={isOpen} />
        </Elements>
      )}
    </>
  );
};

export default BillingProfiles;
