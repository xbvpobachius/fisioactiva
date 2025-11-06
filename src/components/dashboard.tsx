
"use client";

import { useState, useMemo, useEffect } from "react";
import type { Appointment, Client, Professional } from "@/lib/types";
import { AppHeader } from "@/components/header";
import { AgendaView } from "@/components/agenda-view";
import { MachineView } from "@/components/machine-view";
import { QuickCreatePanel } from "@/components/quick-create-panel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { AppointmentDetailsDialog } from "@/components/appointment-details-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAppointments, addAppointment, updateAppointment, deleteAppointment as deleteAppointmentService } from "@/services/appointmentService.supabase";
import { getClients, updateClient } from "@/services/clientService.supabase";
import { useToast } from "@/hooks/use-toast";
import { AiAssistantPanel } from "./ai-assistant-panel";
import { AgendaLegend } from "./agenda-legend";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filters, setFilters] = useState<{ professional: string; sessionType: string }>({ professional: 'all', sessionType: 'all' });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      const [initialAppointments, initialClients] = await Promise.all([
        getAppointments(),
        getClients(),
      ]);
      setAppointments(initialAppointments);
      setClients(initialClients);
      setIsLoading(false);
    }
    loadInitialData();
  }, []);

  const dayAppointments = useMemo(() => {
    return appointments.filter(a => 
      a.startTime.getDate() === selectedDate.getDate() &&
      a.startTime.getMonth() === selectedDate.getMonth() &&
      a.startTime.getFullYear() === selectedDate.getFullYear()
    );
  }, [appointments, selectedDate]);
  
  const handleAddAppointment = async (newAppointmentData: Omit<Appointment, 'id' | 'startTime'> & { startTime: Date }) => {
    const createdAppointment = await addAppointment(newAppointmentData);
    if (createdAppointment) {
      setAppointments(prev => [...prev, createdAppointment]);
      
      // If it was the client's first time, we need to update their status
      if (newAppointmentData.isFirstTimeAppointment) {
        const updatedClient = { ...newAppointmentData.client, isFirstTime: false };
        const success = await updateClient(updatedClient.id, { isFirstTime: false });
        if (success) {
          // Refresh clients list to reflect the change
          const updatedClients = await getClients();
          setClients(updatedClients);
        }
      }
    }
    setIsSheetOpen(false);
  };
  
  const saveAppointmentNotes = async (appointmentId: string, notes: string) => {
    const success = await updateAppointment(appointmentId, { notes });
    if (success) {
      setAppointments(prev => prev.map(app => 
        app.id === appointmentId ? { ...app, notes } : app
      ));
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(prev => prev ? { ...prev, notes } : null);
      }
    }
  };
  
  const updateAppointmentProfessional = async (appointmentId: string, professional: Professional) => {
    const success = await updateAppointment(appointmentId, { professionalId: professional.id });
    if (success) {
      const allAppointments = await getAppointments();
      setAppointments(allAppointments);

       if (selectedAppointment && selectedAppointment.id === appointmentId) {
          const updatedAppointment = allAppointments.find(a => a.id === appointmentId);
          setSelectedAppointment(updatedAppointment || null);
      }
    }
  };

  const updateClientDetails = async (updatedClient: Client) => {
    const success = await updateClient(updatedClient.id, updatedClient);
    if (success) {
      const allClients = await getClients();
      setClients(allClients);
      
      const allAppointments = await getAppointments();
      setAppointments(allAppointments);

       if (selectedAppointment && selectedAppointment.client.id === updatedClient.id) {
          const updatedAppointment = allAppointments.find(a => a.id === selectedAppointment.id);
          setSelectedAppointment(updatedAppointment || null);
      }
    }
  };


  const deleteAppointment = async (appointmentId: string) => {
    const success = await deleteAppointmentService(appointmentId);
    if (success) {
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
      setSelectedAppointment(null);
    }
  };

  const filteredAppointments = useMemo(() => {
    return dayAppointments.filter(a => {
      const professionalMatch = filters.professional === 'all' || a.professional.id === filters.professional;
      const sessionTypeMatch = filters.sessionType === 'all' || a.sessionType.id === filters.sessionType;
      return professionalMatch && sessionTypeMatch;
    });
  }, [dayAppointments, filters]);

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <AppHeader 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate} 
        filters={filters}
        onFiltersChange={setFilters}
        onAssistantClick={() => setIsAssistantOpen(true)}
      />
      <main className="flex flex-1 overflow-hidden p-4 lg:p-6 gap-6">
        {isLoading ? (
           <div className="flex-1 flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : (
          <Tabs defaultValue="agenda" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mb-4 self-start">
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="machines">Horari de Màquines</TabsTrigger>
            </TabsList>
            <TabsContent value="agenda" className="flex-1 overflow-auto">
              <AgendaView 
                selectedDate={selectedDate} 
                appointments={filteredAppointments}
                onAppointmentSelect={setSelectedAppointment}
              />
            </TabsContent>
            <TabsContent value="machines" className="flex-1 overflow-auto">
              <MachineView
                appointments={filteredAppointments.filter(a => a.machines && a.machines.length > 0)}
                onAppointmentSelect={setSelectedAppointment}
              />
            </TabsContent>
          </Tabs>
        )}

        <aside className="w-full max-w-sm hidden lg:block flex-shrink-0">
          <QuickCreatePanel 
            selectedDate={selectedDate} 
            onAddAppointment={handleAddAppointment}
            existingAppointments={dayAppointments}
            clients={clients}
            onClientsChange={setClients}
          />
        </aside>
      </main>
      
      <AgendaLegend />

      <div className="lg:hidden fixed bottom-24 right-6 z-20">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
              <PlusCircle className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm p-0">
             <QuickCreatePanel 
                selectedDate={selectedDate} 
                onAddAppointment={handleAddAppointment}
                existingAppointments={dayAppointments}
                clients={clients}
                onClientsChange={setClients}
             />
          </SheetContent>
        </Sheet>
      </div>
       <AppointmentDetailsDialog
        isOpen={!!selectedAppointment}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onSaveNotes={saveAppointmentNotes}
        onDelete={deleteAppointment}
        onUpdateProfessional={updateAppointmentProfessional}
        onUpdateClient={updateClientDetails}
      />
      <AiAssistantPanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        selectedDate={selectedDate}
        onAddAppointment={handleAddAppointment}
        clients={clients}
        onClientsChange={setClients}
      />
    </div>
  );
}
