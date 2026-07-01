import Navbar from '../components/Navbar';
import AdminPaymentList from '../components/AdminPaymentList';
import './ManagePayments.css';

const ManagePayments = () => {
  return (
    <div className="manage-payments-page">
      <Navbar />
      <main className="container">
        <AdminPaymentList />
      </main>
    </div>
  );
};

export default ManagePayments;
