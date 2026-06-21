import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Download, ShoppingBag, FileText, Receipt,
  Gamepad2, RefreshCw, ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Feedback';
import api from '../lib/axios';

const downloadBlob = (data, filename) => {
  const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const data = searchParams.get('data');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    if (!data) {
      setError('Invalid payment callback. No data received.');
      setLoading(false);
      return;
    }

    api
      .get(`/payment/esewa/success?data=${encodeURIComponent(data)}`)
      .then((res) => {
        setResult(res.data?.data ?? res.data);
        toast.success('Payment confirmed! 🎮');
      })
      .catch((err) => {
        const msg = err?.response?.data?.message ?? 'Payment verification failed.';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [data]);

  const handleDownload = async (type) => {
    const id = type === 'invoice' ? result?.order?.id : result?.payment?.id;
    if (!id) return;

    setDownloading(type);
    try {
      const endpoint = type === 'invoice'
        ? `/invoice/${id}/download`
        : `/receipt/${id}/download`;
      const res = await api.get(endpoint, { responseType: 'blob' });
      downloadBlob(res.data, `${type}-${id}.pdf`);
      toast.success(`${type === 'invoice' ? 'Invoice' : 'Receipt'} downloaded`);
    } catch {
      toast.error(`Could not download ${type}.`);
    } finally {
      setDownloading('');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <PageLoader text="Verifying your payment…" />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-lg"
        >
          {error ? (
            /* ── Error state ── */
            <div className="glass rounded-3xl p-10 border border-danger/20 text-center">
              <div className="w-20 h-20 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-6">
                <RefreshCw size={32} className="text-danger" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground mb-3">Verification Failed</h1>
              <p className="text-muted mb-8">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/orders" className="flex-1">
                  <SecondaryButton className="w-full">View Orders</SecondaryButton>
                </Link>
                <Link to="/checkout" className="flex-1">
                  <PrimaryButton className="w-full">Retry Payment</PrimaryButton>
                </Link>
              </div>
            </div>
          ) : (
            /* ── Success state ── */
            <div className="glass rounded-3xl p-10 border border-success/20 text-center">
              {/* Animated check */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 size={44} className="text-success" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-3xl font-extrabold text-foreground mb-2">Payment Confirmed!</h1>
                <p className="text-muted mb-2">Your purchase was successful.</p>

                {result?.order && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success/8 border border-success/15 text-success text-sm font-semibold mb-8">
                    <Gamepad2 size={15} />
                    Order #{result.order.order_number ?? result.order.id}
                  </div>
                )}

                {/* Order summary */}
                {result?.order && (
                  <div className="bg-surface rounded-2xl p-5 mb-6 text-left border border-white/6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-subtle">Total Paid</span>
                      <span className="text-xl font-extrabold text-primary-light">
                        ₹{Number(result.order.grand_total ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-subtle">Payment Method</span>
                      <span className="text-sm font-semibold text-foreground">eSewa</span>
                    </div>
                  </div>
                )}

                {/* Download buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <SecondaryButton
                    className="flex-1"
                    leftIcon={downloading === 'invoice' ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
                    onClick={() => handleDownload('invoice')}
                    disabled={!!downloading}
                  >
                    Download Invoice
                  </SecondaryButton>
                  <SecondaryButton
                    className="flex-1"
                    leftIcon={downloading === 'receipt' ? <RefreshCw size={14} className="animate-spin" /> : <Receipt size={14} />}
                    onClick={() => handleDownload('receipt')}
                    disabled={!!downloading}
                  >
                    Download Receipt
                  </SecondaryButton>
                </div>

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/orders" className="flex-1">
                    <SecondaryButton className="w-full" leftIcon={<ShoppingBag size={15} />}>
                      My Orders
                    </SecondaryButton>
                  </Link>
                  <Link to="/discover" className="flex-1">
                    <PrimaryButton className="w-full" rightIcon={<ArrowRight size={15} />}>
                      Continue Shopping
                    </PrimaryButton>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
