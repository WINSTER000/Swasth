import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { WebRTCCallModal } from '../../components/teleconsult/WebRTCCallModal';
import { Calendar, Clock, Video, Hospital, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teleconsultAppt, setTeleconsultAppt] = useState(null);

  useEffect(() => {
    fetchAppts();
  }, []);

  const fetchAppts = async () => {
    try {
      const res = await axios.get('/api/patients/me/appointments');
      setAppointments(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppt = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await axios.delete(`/api/appointments/${id}`);
      fetchAppts();
    } catch (e) {
      alert('Failed to cancel appointment');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading appointments...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">My Appointments</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">View appointment history, queue tokens, and launches for teleconsultations.</p>
        </div>
        <Link to="/patient/appointments/book">
          <Button variant="primary" icon={Calendar}>Book New Appointment</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-xs text-slate-500">No appointments found.</p>
          </Card>
        ) : (
          appointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <Badge variant="info">Token #{appt.tokenNumber}</Badge>
                  <Badge
                    variant={
                      appt.status === 'CONFIRMED'
                        ? 'success'
                        : appt.status === 'IN_QUEUE'
                        ? 'warning'
                        : appt.status === 'COMPLETED'
                        ? 'neutral'
                        : 'danger'
                    }
                  >
                    {appt.status}
                  </Badge>
                  <Badge variant="neutral">{appt.appointmentType}</Badge>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-2">{appt.facility?.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(appt.date).toLocaleDateString()} at {appt.time} • Department: {appt.department}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">Reason: {appt.reason}</p>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {appt.appointmentType === 'TELECONSULT' && appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={Video}
                    onClick={() => setTeleconsultAppt(appt)}
                  >
                    Join Teleconsult Video
                  </Button>
                )}

                {appt.status === 'CONFIRMED' && (
                  <Button variant="danger" size="sm" onClick={() => cancelAppt(appt._id)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <WebRTCCallModal
        isOpen={!!teleconsultAppt}
        onClose={() => setTeleconsultAppt(null)}
        roomId={teleconsultAppt?._id}
        participantName={teleconsultAppt?.healthWorker?.name || 'Medical Officer'}
      />
    </div>
  );
};
