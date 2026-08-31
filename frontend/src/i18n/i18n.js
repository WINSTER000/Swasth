import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Locale imports - EN
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enPatient from './locales/en/patient.json';
import enWorker from './locales/en/healthWorker.json';
import enAdmin from './locales/en/admin.json';
import enAppt from './locales/en/appointments.json';
import enQueue from './locales/en/queue.json';
import enRecords from './locales/en/records.json';
import enReferrals from './locales/en/referrals.json';
import enMedicines from './locales/en/medicines.json';
import enDiagnostics from './locales/en/diagnostics.json';
import enFollowups from './locales/en/followups.json';
import enRisk from './locales/en/risk.json';
import enAI from './locales/en/ai.json';
import enNotif from './locales/en/notifications.json';

// Locale imports - HI
import hiCommon from './locales/hi/common.json';
import hiAuth from './locales/hi/auth.json';
import hiPatient from './locales/hi/patient.json';
import hiWorker from './locales/hi/healthWorker.json';
import hiAdmin from './locales/hi/admin.json';
import hiAppt from './locales/hi/appointments.json';
import hiQueue from './locales/hi/queue.json';
import hiRecords from './locales/hi/records.json';
import hiReferrals from './locales/hi/referrals.json';
import hiMedicines from './locales/hi/medicines.json';
import hiDiagnostics from './locales/hi/diagnostics.json';
import hiFollowups from './locales/hi/followups.json';
import hiRisk from './locales/hi/risk.json';
import hiAI from './locales/hi/ai.json';
import hiNotif from './locales/hi/notifications.json';

// Locale imports - MR
import mrCommon from './locales/mr/common.json';
import mrAuth from './locales/mr/auth.json';
import mrPatient from './locales/mr/patient.json';
import mrWorker from './locales/mr/healthWorker.json';
import mrAdmin from './locales/mr/admin.json';
import mrAppt from './locales/mr/appointments.json';
import mrQueue from './locales/mr/queue.json';
import mrRecords from './locales/mr/records.json';
import mrReferrals from './locales/mr/referrals.json';
import mrMedicines from './locales/mr/medicines.json';
import mrDiagnostics from './locales/mr/diagnostics.json';
import mrFollowups from './locales/mr/followups.json';
import mrRisk from './locales/mr/risk.json';
import mrAI from './locales/mr/ai.json';
import mrNotif from './locales/mr/notifications.json';

const resources = {
  en: {
    common: enCommon, auth: enAuth, patient: enPatient, healthWorker: enWorker, admin: enAdmin,
    appointments: enAppt, queue: enQueue, records: enRecords, referrals: enReferrals,
    medicines: enMedicines, diagnostics: enDiagnostics, followups: enFollowups, risk: enRisk,
    ai: enAI, notifications: enNotif
  },
  hi: {
    common: hiCommon, auth: hiAuth, patient: hiPatient, healthWorker: hiWorker, admin: hiAdmin,
    appointments: hiAppt, queue: hiQueue, records: hiRecords, referrals: hiReferrals,
    medicines: hiMedicines, diagnostics: hiDiagnostics, followups: hiFollowups, risk: hiRisk,
    ai: hiAI, notifications: hiNotif
  },
  mr: {
    common: mrCommon, auth: mrAuth, patient: mrPatient, healthWorker: mrWorker, admin: mrAdmin,
    appointments: mrAppt, queue: mrQueue, records: mrRecords, referrals: mrReferrals,
    medicines: mrMedicines, diagnostics: mrDiagnostics, followups: mrFollowups, risk: mrRisk,
    ai: mrAI, notifications: mrNotif
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'mr'],
    ns: ['common', 'auth', 'patient', 'healthWorker', 'admin', 'appointments', 'queue', 'records', 'referrals', 'medicines', 'diagnostics', 'followups', 'risk', 'ai', 'notifications'],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
