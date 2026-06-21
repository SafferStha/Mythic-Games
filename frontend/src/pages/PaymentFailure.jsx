import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RotateCcw, ArrowLeft, HelpCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import api from '../lib/axios';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const data = searchParams.get('data');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (!data) return;

    api
      .get(`/payment/esewa/failure?data=${encodeURIComponent(data)}`)
      .then((res) => {
        const id = res.data?.data?.orderId ?? res.data?.orderId;
        if (id) setOrderId(id);
        toast.error('Payment was not completed.');
      })
      .catch(() => {
        toast.error('Payment failed.');
      });
  }, [data]);

  const reasons = [
    'You cancelled the payment',
    'Insufficient balance in your eSewa account',
    'Bank declined the transaction',
    'Network timeout during payment',
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-lg"
        >
          <div className="glass rounded-3xl p-10 border border-danger/20 text-center">

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
              className="w-24 h-24 rounded-full bg-danger/10 border-2 border-danger/25 flex items-center justify-center mx-auto mb-6"
            >
              <XCircle size={44} className="text-danger" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h1 className="text-3xl font-extrabold text-foreground mb-2">Payment Failed</h1>
              <p className="text-muted mb-8">
                Your payment was not completed. No charges were made to your account.
              </p>

              {/* Possible reasons */}
              <div className="bg-surface rounded-2xl p-5 mb-8 text-left border border-white/6">
                <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <HelpCircle size={12} />
                  Possible reasons
                </p>
                <ul className="flex flex-col gap-2">
                  {reasons.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/cart" className="flex-1">
                  <SecondaryButton className="w-full" leftIcon={<ArrowLeft size={15} />}>
                    Back to Cart
                  </SecondaryButton>
                </Link>
                <Link
                  to={orderId ? `/checkout?retry=${orderId}` : '/checkout'}
                  className="flex-1"
                >
                  <PrimaryButton className="w-full" leftIcon={<RotateCcw size={15} />}>
                    Retry Payment
                  </PrimaryButton>
                </Link>
              </div>

              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 mt-5 text-sm text-subtle hover:text-foreground transition-colors"
              >
                <ShoppingBag size={13} />
                View all orders
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentFailure;
