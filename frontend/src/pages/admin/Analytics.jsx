import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  DollarSign, TrendingUp, ShoppingBag, Users,
  CheckCircle, XCircle, BarChart3,
} from 'lucide-react';
import StatCard   from '../../components/admin/StatCard';
import ChartCard  from '../../components/admin/ChartCard';
import {
  fetchAnalyticsOverview, fetchAnalyticsSales,
  fetchAnalyticsOrders, fetchAnalyticsUsers,
} from '../../lib/adminApi';

const PIE_COLORS = ['#6C5CE7', '#22C55E', '#EF4444', '#00CEC9', '#F59E0B'];
const fmt = (n) => n != null ? `Rs ${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [sales,    setSales]    = useState(null);
  const [orders,   setOrders]   = useState(null);
  const [users,    setUsers]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAnalyticsOverview(),
      fetchAnalyticsSales(12),
      fetchAnalyticsOrders(),
      fetchAnalyticsUsers(12),
    ]).then(([ov, sl, or, us]) => {
      setOverview(ov.data.data);
      setSales(sl.data.data);
      setOrders(or.data.data);
      setUsers(us.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const rev      = overview?.revenue  ?? {};
  const ordStats = overview?.orders   ?? {};
  const userStats= overview?.users    ?? {};
  const payStats = overview?.payments ?? {};

  const orderPie = (orders?.breakdown ?? []).map((r) => ({
    name: r.status, value: parseInt(r.count, 10),
  }));

  const paymentPie = [
    { name: 'Verified', value: parseInt(payStats.verified_payments ?? 0, 10) },
    { name: 'Failed',   value: parseInt(payStats.failed_payments   ?? 0, 10) },
    { name: 'Initiated',value: parseInt(payStats.initiated_payments ?? 0, 10) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-xl font-bold">Analytics</h1>
        <p className="text-subtle text-sm mt-0.5">Business metrics overview</p>
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Revenue"   value={fmt(rev.total_revenue)}   icon={DollarSign} color="success" />
        <StatCard title="Monthly Revenue" value={fmt(rev.monthly_revenue)} icon={TrendingUp}  color="primary" />
        <StatCard title="Yearly Revenue"  value={fmt(rev.yearly_revenue)}  icon={BarChart3}   color="accent"  />
      </div>

      {/* Order stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Orders"     value={ordStats.total_orders}     icon={ShoppingBag} color="primary" />
        <StatCard title="Completed Orders" value={ordStats.completed_orders} icon={CheckCircle} color="success" />
        <StatCard title="Failed Payments"  value={payStats.failed_payments}  icon={XCircle}     color="danger"  />
        <StatCard title="Total Users"      value={userStats.total_users}     icon={Users}       color="warning" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Monthly Revenue Trend" subtitle="Last 12 months" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={sales?.monthlySales ?? []} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
                labelStyle={{ color: '#F8FAFC', fontSize: 12 }}
                itemStyle={{ color: '#A29BFE', fontSize: 12 }}
                formatter={(v) => [`Rs ${Number(v).toFixed(2)}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#6C5CE7" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payment Status" subtitle="All time">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={paymentPie} cx="50%" cy="45%" outerRadius={80} innerRadius={45} paddingAngle={3} dataKey="value">
                {paymentPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} itemStyle={{ color: '#CBD5E1', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748B' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="User Registrations" subtitle="Last 12 months" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={users?.monthlyRegistrations ?? []} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} labelStyle={{ color: '#F8FAFC', fontSize: 12 }} itemStyle={{ color: '#00CEC9', fontSize: 12 }} />
              <Bar dataKey="registrations" fill="#00CEC9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Order Status" subtitle="All time breakdown">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={orderPie} cx="50%" cy="45%" outerRadius={80} innerRadius={45} paddingAngle={3} dataKey="value">
                {orderPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} itemStyle={{ color: '#CBD5E1', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748B' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top games */}
      <ChartCard title="Top Selling Games" subtitle="By units sold — all time">
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={(sales?.topGames ?? []).slice(0, 8)} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="title" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} labelStyle={{ color: '#F8FAFC', fontSize: 12 }} itemStyle={{ color: '#A29BFE', fontSize: 12 }} />
            <Bar dataKey="total_sold" fill="#6C5CE7" radius={[4, 4, 0, 0]} name="Units Sold" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
