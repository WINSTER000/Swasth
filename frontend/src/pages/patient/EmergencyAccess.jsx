import React from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AlertOctagon, Phone, MapPin, Navigation, Hospital, ShieldAlert } from 'lucide-react';

export const EmergencyAccess = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Emergency Header Warning */}
      <div className="bg-rose-600 text-white rounded-2xl p-6 shadow-xl flex items-start space-x-4">
        <AlertOctagon className="w-10 h-10 flex-shrink-0 animate-pulse" />
        <div>
          <h2 className="text-xl font-bold">24x7 Rural Healthcare Emergency Escalation</h2>
          <p className="text-xs text-rose-100 mt-1">
            If you or someone near you is suffering from severe chest pain, extreme dyspnea (difficulty breathing), heavy traumatic bleeding, or sudden unconsciousness, seek immediate emergency care.
          </p>
          <span className="mt-3 inline-block bg-rose-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full border border-rose-400">
            Emergency Services Simulation Guidance
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Emergency Ambulance Contacts">
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">National Ambulance Helpline</p>
                <p className="text-[10px] text-slate-400">108 Emergency Service</p>
              </div>
              <a href="tel:108">
                <Button variant="danger" size="sm" icon={Phone}>Call 108</Button>
              </a>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Satara District Hospital Emergency Ward</p>
                <p className="text-[10px] text-slate-400">+91 2162 234100</p>
              </div>
              <a href="tel:02162234100">
                <Button variant="danger" size="sm" icon={Phone}>Call Ward</Button>
              </a>
            </div>
          </div>
        </Card>

        <Card title="Nearest 24x7 Emergency Facilities">
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="font-bold text-slate-900 dark:text-slate-100">Satara District General Hospital (24x7 ICU)</p>
              <p className="text-[10px] text-slate-400">Sadar Bazar Road, Satara • 2.5 km away</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">ICU Beds Available: 20 • Ambulance Standby</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="font-bold text-slate-900 dark:text-slate-100">Khandala CHC Emergency Trauma Desk</p>
              <p className="text-[10px] text-slate-400">NH-48 Bypass, Khandala • 8.4 km away</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Trauma Beds Available: 4</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
