import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Calendar, Clock, Hospital, User, FileText, CheckCircle2 } from 'lucide-react';

export const AppointmentBooking = () => {
  const [searchParams] = useSearchParams();
  const initialFacilityId = searchParams.get('facilityId') || '';

  const [facilities, setFacilities] = useState([]);
  const [facilityId, setFacilityId] = useState(initialFacilityId);
  const [department, setDepartment] = useState('General Medicine');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  const [appointmentType, setAppointmentType] = useState('IN_PERSON');
  const [loading, setLoading] = useState(false);
  const [successAppt, setSuccessAppt] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const res = await axios.get('/api/facilities');
        let facs = res.data || [];

        // If an initial facility ID was passed but is missing in the list, fetch it directly
        if (initialFacilityId && !facs.find((f) => f._id === initialFacilityId || f.code === initialFacilityId)) {
          try {
            const singleRes = await axios.get(`/api/facilities/${initialFacilityId}`);
            if (singleRes.data?.facility) {
              facs = [singleRes.data.facility, ...facs];
            }
          } catch (e) {
            console.warn('Could not fetch single facility for booking:', e.message);
          }
        }

        setFacilities(facs);
        if (initialFacilityId) {
          const match = facs.find((f) => f._id === initialFacilityId || f.code === initialFacilityId);
          setFacilityId(match ? match._id : initialFacilityId);
        } else if (facs.length > 0) {
          setFacilityId(facs[0]._id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadFacilities();
  }, [initialFacilityId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/appointments', {
        facilityId,
        department,
        date,
        time,
        reason,
        appointmentType,
      });
      setSuccessAppt(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (successAppt) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <Card className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Appointment Confirmed!</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your token number has been generated.</p>

          <div className="my-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between font-bold text-base text-brand-600 dark:text-brand-400">
              <span>Token Number</span>
              <span>#{successAppt.tokenNumber}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Date & Time</span>
              <span>{new Date(successAppt.date).toLocaleDateString()} at {successAppt.time}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Department</span>
              <span>{successAppt.department}</span>
            </div>
          </div>

          <div className="flex justify-center space-x-3">
            <Button variant="primary" onClick={() => navigate('/patient/appointments')}>
              View My Appointments
            </Button>
            <Button variant="outline" onClick={() => navigate('/patient/queue')}>
              Track Live Queue Tracker
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Schedule Appointment</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Book an OPD consultation token at any Rural PHC, CHC, or District Hospital.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Healthcare Facility</label>
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-100"
            >
              {facilities.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.type}) — {f.district}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-100"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Maternal & Child Health">Maternal & Child Health</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Cardiology">Cardiology</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Consultation Mode</label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-100"
              >
                <option value="IN_PERSON">In-Person Facility Visit</option>
                <option value="TELECONSULT">WebRTC Teleconsultation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Time Slot</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-100"
              >
                <option value="09:00 AM">09:00 AM Slot</option>
                <option value="10:00 AM">10:00 AM Slot</option>
                <option value="11:30 AM">11:30 AM Slot</option>
                <option value="02:00 PM">02:00 PM Slot</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Visit / Symptoms</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe main health concerns or symptoms..."
              required
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-100"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full py-3 mt-4 text-sm font-bold">
            Confirm & Generate Token
          </Button>
        </form>
      </Card>
    </div>
  );
};
