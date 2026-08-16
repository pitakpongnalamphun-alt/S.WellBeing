"use client";

import { AppointmentBooking } from "@/components/AppointmentBooking";

export default function AppointmentsPage() {
  return (
    <div className="flex flex-1 flex-col py-2 ipad:mx-auto ipad:w-full ipad:max-w-xl">
      <AppointmentBooking />
    </div>
  );
}
