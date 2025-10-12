import type { Appointment } from "@/lib/types";
import { professionals } from "@/lib/data";
import { AppointmentCard } from "@/components/appointment-card";
import { cn } from "@/lib/utils";

type AgendaViewProps = {
  selectedDate: Date;
  appointments: Appointment[];
  onAppointmentSelect: (appointment: Appointment) => void;
};

const START_HOUR = 8;
const END_HOUR = 21;
const TIME_SLOT_MINUTES = 10;
const ROW_HEIGHT_PX = 20; // Increased height for each 10-min slot

export function AgendaView({ appointments, onAppointmentSelect }: AgendaViewProps) {
  const timeSlots = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += TIME_SLOT_MINUTES) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  const getGridPosition = (appointment: Appointment) => {
    const startTime = appointment.startTime;
    const startMinutes = (startTime.getHours() - START_HOUR) * 60 + startTime.getMinutes();
    const startRow = startMinutes / TIME_SLOT_MINUTES + 2; // +1 for header, +1 for 1-based index

    const duration = appointment.sessionType.duration;
    const rowSpan = duration / TIME_SLOT_MINUTES;

    const professionalIndex = professionals.findIndex(p => p.id === appointment.professional.id);
    const startCol = professionalIndex + 2; // +1 for time column, +1 for 1-based index
    
    return {
      gridRow: `${startRow} / span ${rowSpan}`,
      gridColumn: `${startCol}`,
    };
  };

  const isSlotOccupied = (professionalId: string, time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const slotTime = (hour * 60) + minute;

    return appointments.some(app => {
      if (app.professional.id !== professionalId) return false;
      const appStartMinutes = app.startTime.getHours() * 60 + app.startTime.getMinutes();
      const appEndMinutes = appStartMinutes + app.sessionType.duration;
      const slotStartMinutes = slotTime;
      const slotEndMinutes = slotStartMinutes + TIME_SLOT_MINUTES;
      // Check for any overlap
      return Math.max(appStartMinutes, slotStartMinutes) < Math.min(appEndMinutes, slotEndMinutes);
    });
  }

  return (
    <div className="relative h-full">
        <div className="grid h-full" style={{ 
            gridTemplateColumns: `auto repeat(${professionals.length}, 1fr)`,
            gridTemplateRows: `auto repeat(${timeSlots.length}, ${ROW_HEIGHT_PX}px)`
        }}>
            {/* Corner */}
            <div className="sticky top-0 z-10 bg-background border-r border-b p-2"></div>

            {/* Professionals Header */}
            {professionals.map(prof => (
                <div key={prof.id} className="sticky top-0 z-10 bg-background border-b text-center font-semibold p-2 whitespace-nowrap">
                    {prof.name}
                </div>
            ))}

            {/* Time Slots Axis */}
            {timeSlots.map((time, index) => (
                <div key={time} className="text-xs text-muted-foreground text-right pr-2 border-r -mt-px pt-1 flex items-center justify-end" style={{gridRow: index + 2}}>
                    {time.endsWith('00') && <strong>{time}</strong>}
                </div>
            ))}

            {/* Grid lines & Occupied Slots */}
            {professionals.map((prof, pIndex) => 
                timeSlots.map((time, tIndex) => (
                    <div 
                        key={`${pIndex}-${tIndex}`} 
                        className={cn(
                            "border-b",
                            isSlotOccupied(prof.id, time) && "bg-muted/50 cursor-not-allowed"
                        )}
                        style={{ gridColumn: pIndex + 2, gridRow: tIndex + 2}}
                    ></div>
                ))
            )}

            {/* Appointments */}
            {appointments.map(appointment => (
                <div key={appointment.id} style={getGridPosition(appointment)} className="p-1 min-h-0 z-10" onClick={() => onAppointmentSelect(appointment)}>
                    <AppointmentCard appointment={appointment} />
                </div>
            ))}
        </div>
    </div>
  );
}
