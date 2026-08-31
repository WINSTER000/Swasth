import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Package,
  Edit2,
  Save,
  Building2,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const MedicineInventory = () => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [newStock, setNewStock] = useState(0);
  const [newThreshold, setNewThreshold] = useState(50);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // 1. Fetch available facilities
  useEffect(() => {
    axios
      .get('/api/facilities')
      .then((res) => {
        const facs = res.data || [];
        setFacilities(facs);
        const savedFac = localStorage.getItem('admin_selected_facility');
        if (savedFac && facs.some((f) => f._id === savedFac)) {
          setSelectedFacilityId(savedFac);
        } else if (facs.length > 0) {
          setSelectedFacilityId(facs[0]._id);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // 2. Fetch inventory for selected facility
  useEffect(() => {
    if (!selectedFacilityId) return;
    localStorage.setItem('admin_selected_facility', selectedFacilityId);
    fetchInventory(selectedFacilityId);
  }, [selectedFacilityId]);

  const fetchInventory = async (facId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/medicines/facility/${facId}`);
      setInventory(res.data || []);
    } catch (e) {
      console.error('Error loading inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, medName) => {
    setSaving(true);
    try {
      await axios.patch(`/api/medicines/inventory/${id}`, {
        stockQuantity: parseInt(newStock, 10),
        lowStockThreshold: parseInt(newThreshold, 10),
      });
      setToast(`Stock updated successfully for ${medName}!`);
      setTimeout(() => setToast(''), 3500);
      setEditItem(null);
      fetchInventory(selectedFacilityId);
    } catch (e) {
      alert('Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  const totalMedicines = inventory.length;
  const lowStockCount = inventory.filter(
    (i) => i.availabilityStatus === 'LIMITED' || i.stockQuantity <= i.lowStockThreshold
  ).length;
  const outOfStockCount = inventory.filter(
    (i) => i.availabilityStatus === 'OUT_OF_STOCK' || i.stockQuantity === 0
  ).length;
  const availableCount = inventory.filter(
    (i) => i.availabilityStatus === 'AVAILABLE' && i.stockQuantity > i.lowStockThreshold
  ).length;

  const filteredInventory = inventory.filter((item) => {
    const name = item.medicine?.name?.toLowerCase() || '';
    const generic = item.medicine?.genericName?.toLowerCase() || '';
    const cat = item.medicine?.category?.toLowerCase() || '';
    const q = searchTerm.toLowerCase();
    return name.includes(q) || generic.includes(q) || cat.includes(q);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header with Facility Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Facility Medicine Inventory Manager
            </h2>
            <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800 flex items-center">
              <Package className="w-3 h-3 mr-1" /> Real-time Pharmacy
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage essential medication stock levels, reserve thresholds, and dispense availability.
          </p>
        </div>

        {/* Facility Dropdown */}
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-xs">
          <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            {facilities.map((fac) => (
              <option key={fac._id} value={fac._id} className="dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                {fac.name} ({fac.type || 'Facility'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="p-4 bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast('')} className="text-white hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Medicines"
          value={`${totalMedicines} Formulations`}
          change="Facility formulary"
          icon={Package}
          color="brand"
        />
        <StatCard
          title="In Stock"
          value={`${availableCount} Available`}
          change="Adequate inventory"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Low Stock"
          value={`${lowStockCount} Items`}
          change="Below safety threshold"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Out of Stock"
          value={`${outOfStockCount} Items`}
          change="Critical shortage"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by medicine name, generic name, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium dark:text-slate-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Inventory List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium">Loading facility medicine inventory...</div>
      ) : filteredInventory.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="font-bold text-slate-700 dark:text-slate-300">No medicines found matching search</p>
        </Card>
      ) : (
        <div className="space-y-3 text-xs">
          {filteredInventory.map((item) => {
            const isEditing = editItem === item._id;
            const isLow = item.availabilityStatus === 'LIMITED' || item.stockQuantity <= item.lowStockThreshold;
            const isOut = item.availabilityStatus === 'OUT_OF_STOCK' || item.stockQuantity === 0;

            return (
              <Card key={item._id} className="transition-all hover:border-slate-300 dark:hover:border-slate-600">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {item.medicine?.name || 'Essential Medicine'}
                      </span>
                      <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
                        {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'AVAILABLE'}
                      </Badge>
                      {item.medicine?.dosageForm && (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold">
                          {item.medicine.dosageForm}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Generic: <strong>{item.medicine?.genericName || 'Standard Formulation'}</strong> • Category: {item.medicine?.category || 'General'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Current Units: <strong className="text-slate-800 dark:text-slate-200">{item.stockQuantity}</strong> • Minimum Threshold: {item.lowStockThreshold} units
                    </p>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Stock Quantity</label>
                        <input
                          type="number"
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          className="w-24 p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Min Threshold</label>
                        <input
                          type="number"
                          value={newThreshold}
                          onChange={(e) => setNewThreshold(e.target.value)}
                          className="w-20 p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold dark:text-slate-100"
                        />
                      </div>
                      <div className="flex items-center space-x-1 pt-4">
                        <Button
                          size="sm"
                          variant="success"
                          icon={Save}
                          loading={saving}
                          onClick={() => handleUpdate(item._id, item.medicine?.name)}
                          className="rounded-xl font-bold text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditItem(null)}
                          className="rounded-xl text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Edit2}
                      onClick={() => {
                        setEditItem(item._id);
                        setNewStock(item.stockQuantity);
                        setNewThreshold(item.lowStockThreshold);
                      }}
                      className="rounded-xl font-bold text-xs"
                    >
                      Update Stock
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

