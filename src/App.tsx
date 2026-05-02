import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Truck,
  Loader2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Garment {
  name: string;
  quantity: number;
  price: number;
}

type OrderStatus = 'RECEIVED' | 'PROCESSING' | 'READY' | 'DELIVERED';

interface Order {
  id: string;
  customerName: string;
  phone: string;
  garments: Garment[];
  totalBill: number;
  status: OrderStatus;
  createdAt: string;
}

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  ordersPerStatus: Record<OrderStatus, number>;
}

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // New Order Form State
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    phone: '',
    garments: [{ name: '', quantity: 1, price: 10 }]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const ordersRes = await fetch(`/api/orders?search=${search}&status=${statusFilter}`);
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      const dashRes = await fetch('/api/dashboard');
      const dashData = await dashRes.json();
      setDashboard(dashData);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        setShowForm(false);
        setNewOrder({ customerName: '', phone: '', garments: [{ name: '', quantity: 1, price: 10 }] });
        fetchData();
      }
    } catch (err) {
      console.error('Create order failed', err);
    }
  };

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Update status failed', err);
    }
  };

  const addGarmentRow = () => {
    setNewOrder({
      ...newOrder,
      garments: [...newOrder.garments, { name: '', quantity: 1, price: 10 }]
    });
  };

  const updateGarment = (index: number, field: keyof Garment, value: any) => {
    const updatedGarments = [...newOrder.garments];
    updatedGarments[index] = { ...updatedGarments[index], [field]: value };
    setNewOrder({ ...newOrder, garments: updatedGarments });
  };

  const removeGarment = (index: number) => {
    if (newOrder.garments.length > 1) {
      setNewOrder({
        ...newOrder,
        garments: newOrder.garments.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SudzLaundry Dashboard</h1>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
          >
            <Plus size={18} />
            <span>New Order</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Orders" value={dashboard?.totalOrders || 0} icon={<Package className="text-blue-500" />} />
          <StatCard title="Revenue" value={`₹${dashboard?.totalRevenue || 0}`} icon={<TrendingUp className="text-emerald-500" />} />
          <StatCard title="Processing" value={dashboard?.ordersPerStatus.PROCESSING || 0} icon={<RefreshCw className="text-amber-500" />} />
          <StatCard title="Ready" value={dashboard?.ordersPerStatus.READY || 0} icon={<CheckCircle2 className="text-indigo-500" />} />
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by customer or phone..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="w-full md:w-48 bg-white border border-neutral-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="RECEIVED">Received</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY">Ready</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-neutral-500 text-sm font-medium uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Bill Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <motion.tr 
                    layout
                    key={order.id} 
                    className="hover:bg-neutral-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-neutral-600 font-medium">{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-neutral-500">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 font-semibold">₹{order.totalBill}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {order.status !== 'DELIVERED' && (
                          <button 
                            onClick={() => updateStatus(order.id, getNextStatus(order.status))}
                            className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md font-medium transition-colors"
                          >
                            Mark {getNextStatus(order.status).toLowerCase()}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* New Order Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-2xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6">Create New Order</h2>
              <form onSubmit={handleCreateOrder} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Customer Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={newOrder.customerName}
                      onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input 
                      required
                      type="tel"
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={newOrder.phone}
                      onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Garments</label>
                    <button 
                      type="button" 
                      onClick={addGarmentRow}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                    >
                      <Plus size={14} /> Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newOrder.garments.map((g, idx) => (
                      <div key={idx} className="flex gap-3 items-end bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Item Name</label>
                          <input 
                            required
                            placeholder="e.g. Silk Shirt"
                            className="w-full px-3 py-1.5 rounded bg-white border border-neutral-200 text-sm outline-none"
                            value={g.name}
                            onChange={(e) => updateGarment(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="w-20">
                          <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Qty</label>
                          <input 
                            required
                            type="number"
                            min="1"
                            className="w-full px-3 py-1.5 rounded bg-white border border-neutral-200 text-sm outline-none"
                            value={g.quantity}
                            onChange={(e) => updateGarment(idx, 'quantity', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Price (₹)</label>
                          <input 
                            required
                            type="number"
                            min="0"
                            className="w-full px-3 py-1.5 rounded bg-white border border-neutral-200 text-sm outline-none"
                            value={g.price}
                            onChange={(e) => updateGarment(idx, 'price', parseInt(e.target.value))}
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeGarment(idx)}
                          className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100">
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 rounded-lg text-neutral-600 font-medium hover:bg-neutral-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Create Order
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-start justify-between">
      <div>
        <div className="text-neutral-500 text-sm font-medium mb-1">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className="bg-neutral-50 p-2 rounded-xl">
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles = {
    RECEIVED: 'bg-neutral-100 text-neutral-600',
    PROCESSING: 'bg-amber-100 text-amber-700',
    READY: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700'
  };

  const icons = {
    RECEIVED: <Clock size={12} />,
    PROCESSING: <RefreshCw size={12} className="animate-spin-slow" />,
    READY: <CheckCircle2 size={12} />,
    DELIVERED: <Truck size={12} />
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit uppercase tracking-wider ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
}

function getNextStatus(current: OrderStatus): OrderStatus {
  switch (current) {
    case 'RECEIVED': return 'PROCESSING';
    case 'PROCESSING': return 'READY';
    case 'READY': return 'DELIVERED';
    default: return 'DELIVERED';
  }
}
