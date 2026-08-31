import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Building, Phone, MapPin, Clock, Edit2 } from 'lucide-react';

export const FacilityManager = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/facilities')
      .then((res) => setFacilities(res.data || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading facilities...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">District Healthcare Facility Manager</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Institutional overview of PHCs, CHCs, and District Hospitals in Satara district.</p>
      </div>

      <div className="space-y-4 text-xs">
        {facilities.map((fac) => (
          <Card key={fac._id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Badge variant="info">{fac.type}</Badge>
                  <Badge variant="success">Code: {fac.code}</Badge>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-2">{fac.name}</h3>
                <p className="text-slate-500">{fac.address}</p>
                <div className="flex items-center space-x-4 mt-2 text-slate-600 dark:text-slate-400">
                  <span>Phone: {fac.phone}</span>
                  <span>Beds Available: {fac.availableBeds} / {fac.totalBeds}</span>
                  <span>Avg Wait: {fac.averageWaitTimeMinutes} mins</span>
                </div>
              </div>

              <Button size="sm" variant="outline" icon={Edit2}>
                Edit Facility Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
