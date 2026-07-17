import { lazy, Suspense } from 'react';
import { useConsultation } from '../context/ConsultationContext';

const MedicationReminder = lazy(() => import('../components/health/MedicationReminder'));

export default function RemindersPage() {
  const ctx = useConsultation() as any;

  return (
    <Suspense fallback={null}>
      <MedicationReminder
        userId={ctx.getCurrentUserId()}
        onClose={() => {
          // Navigate back handled by browser back or header nav
          window.history.back();
        }}
      />
    </Suspense>
  );
}
