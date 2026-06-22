import { useEffect, useState } from 'react';
import {
  DollarSign, ShoppingBag, Users, Gamepad2,
  TrendingUp, AlertTriangle, CheckCircle, XCircle,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import StatCard  from '../../components/admin/StatCard';
import ChartCard from '../../components/admin/ChartCard';
import { fetchDashboard, fetchAnalyticsSales, fetchAnalyticsOrders } from '../../lib/adminApi';

const PIE_COLORS = ['#6C5CE7', '#22C55E', '#EF4444', '#00CEC9', '#F59E0B'];

const fmt = (n) => {
  if (n == null) return '—';
  const num = Number(n);
  if (num >= 1_000_000) return `Rs ${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `Rs ${(num / 1_000).toFixed(1)}K`;
  return `Rs ${num.toFixed(2)}`;
};

export default function Dashboard() {
  const [overview,  setOverview]  = useState(null);
  const [sales,     setSales]     = useState(null);
  const [orderPie,  setOrderPie]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchAnalyticsSales(12), fetchAnalyticsOrders()])
      .then(([dash, sl, ord]) => {
        setOverview(dash.data.data);
        setSales(sl.data.data);
        setOrderPie(
          (ord.data.data.breakdown ?? []).map((r) => ({
            name:  r.status,
            value: parseInt(r.count, 10),
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const rev    = overview?.revenue ?? {};
  const orders = overview?.orders  ?? {};
  const users  = overview?.users   ?? {};
  const games  = overview?.games   ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-xl font-bold">Dashboard</h1>
        <p className="text-subtle text-sm mt-0.5">Mythic Games — business overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue"    value={fmt(rev.total_revenue)}   icon={DollarSign}  color="success" />
        <StatCard title="Monthly Revenue"  value={fmt(rev.monthly_revenue)} icon={TrendingUp}  color="primary" />
        <StatCard title="Total Orders"     value={orders.total_orders}      icon={ShoppingBag} color="accent"  />
        <StatCard title="Total Users"      value={users.total_users}        icon={Users}       color="warning" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Active Games"     value={games.active_games}       icon={Gamepad2}    color="primary" />
        <StatCard title="Low Stock"        value={games.low_stock}          icon={AlertTriangle} color="warning" />
        <StatCard title="Completed Orders" value={orders.completed_orders}  icon={CheckCircle} color="success" />
        <StatCard title="Failed Payments"  value={overview?.payments?.failed_payments} icon={XCircle} color="danger" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Monthly Revenue" subtitle="Last 12 months" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
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

        <ChartCard title="Order Status" subtitle="All time breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={orderPie} cx="50%" cy="45%" outerRadius={75} innerRadius={42} paddingAngle={3} dataKey="value">
                {orderPie.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
                itemStyle={{ color: '#CBD5E1', fontSize: 12 }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748B' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top games */}
      <ChartCard title="Top Selling Games" subtitle="By units sold">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={(sales?.topGames ?? []).slice(0, 8)} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="title" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
              labelStyle={{ color: '#F8FAFC', fontSize: 12 }}
              itemStyle={{ color: '#00CEC9', fontSize: 12 }}
            />
            <Bar dataKey="total_sold" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
