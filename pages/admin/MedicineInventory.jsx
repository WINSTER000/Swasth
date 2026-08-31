import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Package, Edit2, Save } from 'lucide-react';

export const MedicineInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [newStock, setNewStock] = useState(0);

  const facilityId = '66d1f0000000000000000001'; // Shirwal PHC

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`/api/medicines/facility/${facilityId}`);
      setInventory(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.patch(`/api/medicines/inventory/${id}`, {
        stockQuantity: parseInt(newStock, 10),
      });
      alert('Stock updated successfully!');
      setEditItem(null);
      fetchInventory();
    } catch (e) {
      alert('Failed to update stock');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading inventory...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Facility Medicine Inventory Manager</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Hospital Admin stock management and low stock threshold alerts.</p>
      </div>

      <div className="space-y-3 text-xs">
        {inventory.map((item) => (
          <Card key={item._id}>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.medicine?.name}</span>
                <p className="text-slate-500">{item.medicine?.category} • Threshold: {item.lowStockThreshold}</p>
                <div className="mt-1">
                  <Badge variant={item.availabilityStatus === 'AVAILABLE' ? 'success' : item.availabilityStatus === 'LIMITED' ? 'warning' : 'danger'}>
                    {item.availabilityStatus} (Stock: {item.stockQuantity})
                  </Badge>
                </div>
              </div>

              {editItem === item._id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-20 p-2 bg-slate-50 dark:bg-slate-900 border rounded"
                  />
                  <Button size="sm" variant="success" icon={Save} onClick={() => handleUpdate(item._id)}>
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit2}
                  onClick={() => {
                    setEditItem(item._id);
                    setNewStock(item.stockQuantity);
                  }}
                >
                  Update Stock
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
