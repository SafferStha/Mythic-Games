import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, ArrowRight, CreditCard, Smartphone,
  Gamepad2, CheckCircle2, AlertCircle, Loader2, Lock,
} from 'lucide-react';
import { toast } from 'sonner';

import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { useGameLibrary } from '../contexts/GameLibraryContext.jsx';
import { getStoredUser } from '../utils/auth';
import api from '../lib/axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── eSewa auto-submit form ──────────────────────────────── */
const EsewaForm = ({ formRef, payload, paymentUrl }) => (
  <form ref={formRef} action={paymentUrl} method="POST" className="hidden">
    {payload &&
      Object.entries(payload).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
  </form>
);

/* ── Payment method card ─────────────────────────────────── */
const PaymentMethodCard = ({ id, label, icon: Icon, badge, selected, onSelect }) => (
  <motion.button
    type="button"
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(id)}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
      selected
        ? 'border-primary bg-primary/10 shadow-[0_0_24px_rgba(108,92,231,0.2)]'
        : 'border-white/8 bg-surface hover:border-white/20'
    }`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-primary/20' : 'bg-surface-hover'}`}>
      <Icon size={22} className={selected ? 'text-primary-light' : 'text-muted'} />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${selected ? 'text-foreground' : 'text-muted'}`}>{label}</span>
        {badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-success/15 text-success border border-success/25">
            {badge}
          </span>
        )}
      </div>
    </div>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
      selected ? 'border-primary bg-primary' : 'border-white/20 bg-transparent'
    }`}>
      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  </motion.button>
);

/* ── Order item row ──────────────────────────────────────── */
const OrderItem = ({ item }) => (
  <div className="flex items-center gap-3 py-3 border-b border-white/6 last:border-0">
    <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-hover">
      {item.image ? (
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Gamepad2 size={16} className="text-subtle" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
      <p className="text-xs text-subtle">Digital license</p>
    </div>
    <span className="text-sm font-bold text-primary-light shrink-0">
      ₹{(item.price * (item.quantity || 1)).toLocaleString()}
    </span>
  </div>
);

/* ── Checkout page ───────────────────────────────────────── */
const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems } = useGameLibrary();
  const esewaFormRef = useRef(null);

  const [selectedMethod, setSelectedMethod] = useState('esewa');
  const [loading, setLoading] = useState(false);
  const [esewaPayload, setEsewaPayload] = useState(null);
  const [esewaPaymentUrl, setEsewaPaymentUrl] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const tax = 0;
  const total = subtotal + tax;

  const handleConfirmPayment = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    const user = getStoredUser();
    if (!user) {
      navigate('/login?returnTo=/checkout');
      return;
    }

    setLoading(true);
    try {
      /* Step 1: Create order via checkout endpoint */
      const orderItems = cartItems.map((item) => ({
        game_id:   item.id,
        title:     item.title,
        quantity:  item.quantity || 1,
        unit_price: item.price,
      }));

      const orderRes = await api.post('/checkout', { items: orderItems });
      const order = orderRes.data?.data ?? orderRes.data;
      const orderId = order?.order_id ?? order?.id;

      if (!orderId) throw new Error('Order creation failed — no order ID returned.');

      /* Step 2: Initiate eSewa payment */
      const payRes = await api.post('/payment/esewa/initiate', { order_id: orderId });
      const { esewa_payload, payment_url } = payRes.data?.data ?? payRes.data;

      if (!esewa_payload || !payment_url) throw new Error('Payment initiation failed.');

      /* Step 3: Store payload & auto-submit */
      setEsewaPayload(esewa_payload);
      setEsewaPaymentUrl(payment_url);

      toast.success('Redirecting to eSewa…');

      /* Give React a tick to render the hidden form, then submit */
      setTimeout(() => {
        esewaFormRef.current?.submit();
      }, 150);
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Payment initiation failed.';
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      {/* Hidden eSewa form */}
      <EsewaForm formRef={esewaFormRef} payload={esewaPayload} paymentUrl={esewaPaymentUrl} />

      <main className="flex-1 max-w-350 mx-auto w-full px-4 md:px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-primary-light uppercase tracking-widest font-semibold mb-1">
            <Lock size={13} />
            Secure Checkout
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Complete Your Order</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {['Review', 'Payment', 'Confirm'].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${i === 1 ? 'text-foreground' : i < 1 ? 'text-success' : 'text-subtle'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i < 1
                    ? 'bg-success border-success text-white'
                    : i === 1
                    ? 'bg-primary border-primary text-white'
                    : 'bg-transparent border-white/20 text-subtle'
                }`}>
                  {i < 1 ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{step}</span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-white/10 w-8 sm:w-16" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left: Payment methods ─────────────────────── */}
          <div className="lg:col-span-3">
            <div className="glass rounded-3xl p-6 border border-white/10">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <CreditCard size={18} className="text-primary-light" />
                Payment Method
              </h2>

              <div className="flex flex-col gap-3">
                <PaymentMethodCard
                  id="esewa"
                  label="eSewa"
                  icon={Smartphone}
                  badge="Recommended"
                  selected={selectedMethod === 'esewa'}
                  onSelect={setSelectedMethod}
                />
                <PaymentMethodCard
                  id="khalti"
                  label="Khalti"
                  icon={Smartphone}
                  selected={selectedMethod === 'khalti'}
                  onSelect={() => toast.info('Khalti coming soon!')}
                />
                <PaymentMethodCard
                  id="card"
                  label="Visa / MasterCard"
                  icon={CreditCard}
                  selected={selectedMethod === 'card'}
                  onSelect={() => toast.info('Card payment coming soon!')}
                />
              </div>

              {/* Security note */}
              <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-success/5 border border-success/15">
                <ShieldCheck size={18} className="text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-success mb-0.5">100% Secure Payment</p>
                  <p className="text-xs text-subtle">
                    Your transaction is protected by 256-bit SSL encryption and eSewa's verified payment gateway.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Order summary ──────────────────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 glass rounded-3xl p-6 border border-white/10">
              <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>

              {/* Items */}
              <div className="mb-4 max-h-60 overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="flex items-center gap-2 py-6 justify-center text-subtle text-sm">
                    <AlertCircle size={16} />
                    No items in cart
                  </div>
                ) : (
                  cartItems.map((item) => <OrderItem key={item.key} item={item} />)
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-white/8 pt-4 flex flex-col gap-2.5 mb-5">
                <div className="flex justify-between text-sm text-subtle">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-subtle">
                  <span>Tax</span>
                  <span className="text-success">₹0</span>
                </div>
                <div className="h-px bg-white/8" />
                <div className="flex justify-between font-bold text-foreground">
                  <span>Grand Total</span>
                  <span className="text-xl text-primary-light">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* CTA */}
              <PrimaryButton
                className="w-full"
                size="lg"
                loading={loading}
                onClick={handleConfirmPayment}
                disabled={cartItems.length === 0 || loading}
                rightIcon={!loading && <ArrowRight size={17} />}
              >
                {loading ? 'Processing…' : `Pay ₹${total.toLocaleString()} with eSewa`}
              </PrimaryButton>

              <p className="text-xs text-center text-subtle mt-4">
                By confirming, you agree to our{' '}
                <span className="text-primary-light cursor-pointer hover:underline">Terms of Service</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
