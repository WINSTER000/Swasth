import React, { useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Search, User, FileText, Activity, ShieldAlert, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/patients/search?query=${query}`);
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Patient Directory & Longitudinal Timeline</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Search authorized patient records across rural PHCs, CHCs, and District Hospitals.</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by patient name, email, or phone number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-100"
            />
          </div>
          <Button type="submit" loading={loading} icon={Search}>
            Search
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        {results.map((profile) => (
          <div
            key={profile._id}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center">
                {profile.user?.name?.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{profile.user?.name}</h4>
                <p className="text-slate-500">Gender: {profile.gender} • DOB: {new Date(profile.dateOfBirth).toLocaleDateString()}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">District: {profile.address?.district} • Blood Group: {profile.bloodGroup}</p>
              </div>
            </div>

            <Link to={`/worker/patients/${profile.user?._id || profile.user}`}>
              <Button size="sm" variant="primary" icon={FileText}>
                Open Patient Timeline
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
