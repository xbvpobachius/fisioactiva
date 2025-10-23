
import type { Appointment } from "@/lib/types";
import { Bot, MapPin, ShieldCheck } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type AppointmentCardProps = {
  appointment: Appointment;
};

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { client, sessionType, zone, camilla, machine, startTime, isMutua, isFirstTimeAppointment } = appointment;
  
  const needsConsent = isFirstTimeAppointment && (!client.consents?.dataProtection || !client.consents?.treatment);

  const isMachineOnlySession = sessionType.name === 'Màquina sola';

  return (
    <div 
      className={cn(
        "h-full rounded-lg p-2 text-xs flex flex-col overflow-hidden shadow-sm transition-all hover:shadow-md cursor-pointer text-white",
        needsConsent && "border-2 border-red-500 ring-2 ring-red-500/50"
      )}
      style={{ backgroundColor: sessionType.color }}
    >
      <div className={cn("flex w-full justify-between items-start")}>
        <p className="font-bold flex-1 truncate">{client.name} {isFirstTimeAppointment ? '*' : ''}</p>
        <span className="font-medium">{format(startTime, 'HH:mm')}</span>
      </div>
      
      {isMachineOnlySession && machine ? (
        <div className="mt-auto pt-1 font-bold text-sm truncate flex items-center gap-1.5">
            <Bot className="w-4 h-4" />
            <span className="truncate">{machine.name}</span>
        </div>
      ) : (
        <>
            <p className="truncate">{sessionType.name}</p>
            <div className="mt-auto pt-1 space-y-1">
                {machine && (
                    <div className="flex items-center gap-1 font-semibold">
                      <Bot className="w-3 h-3"/>
                      <span>{machine.name}</span>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3"/>
                    <span>{zone} - C{camilla}</span>
                </div>
                {isMutua && (
                    <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3"/>
                        <span>Mútua</span>
                    </div>
                )}
            </div>
        </>
      )}
    </div>
  );
}
