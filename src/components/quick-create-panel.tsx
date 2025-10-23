
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { professionals, sessionTypes, machines } from "@/lib/data";
import type { Appointment, SessionType, Client, Consent } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { addMinutes } from "date-fns";
import { Separator } from "./ui/separator";
import { addClient, deleteClient as deleteClientService, updateClient } from "@/services/clientService.supabase";


const formSchema = z.object({
  client: z.string().min(1, "El client és obligatori."),
  sessionType: z.string().min(1, "El tipus de sessió és obligatori."),
  professional: z.string().min(1, "El professional és obligatori."),
  zone: z.enum(["Dins", "Fora"]),
  camilla: z.string().min(1, "La camilla és obligatòria.").max(1, "Ha de ser un sol dígit."),
  machine: z.string().optional(),
  time: z.string().min(1, "L'hora és obligatori."),
  isMutua: z.boolean().default(false),
});

const newClientSchema = z.object({
  name: z.string().min(3, "El nom ha de tenir almenys 3 caràcters."),
  isFirstTime: z.boolean().default(false),
});

type QuickCreatePanelProps = {
  selectedDate: Date;
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'startTime'> & { startTime: Date }) => Promise<void>;
  existingAppointments: Appointment[];
  clients: Client[];
  onClientsChange: React.Dispatch<React.SetStateAction<Client[]>>;
};

const START_HOUR = 8;
const END_HOUR = 21;
const TIME_SLOT_MINUTES = 30;
const TOTAL_CAMILLAS = 4;

export function QuickCreatePanel({ selectedDate, onAddAppointment, existingAppointments, clients, onClientsChange }: QuickCreatePanelProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: "",
      sessionType: "",
      professional: "",
      zone: "Dins",
      camilla: "1",
      machine: "",
      time: "",
      isMutua: false,
    },
  });

  const newClientForm = useForm<z.infer<typeof newClientSchema>>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      name: "",
      isFirstTime: true,
    },
  });

  const watchedProfessional = form.watch("professional");
  const watchedSessionType = form.watch("sessionType");
  const watchedTime = form.watch("time");
  const watchedZone = form.watch("zone");

  // Filtrar clientes por búsqueda
  const filteredClients = useMemo(() => {
    if (!clientSearchQuery.trim()) {
      return clients;
    }
    return clients.filter(client =>
      client.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
    );
  }, [clients, clientSearchQuery]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += TIME_SLOT_MINUTES) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  }, []);
  
  const availableTimeSlots = useMemo(() => {
    if (!watchedProfessional || !watchedSessionType) {
      return timeSlots.map(time => ({ time, available: false }));
    }

    const professionalAppointments = existingAppointments.filter(
      app => app.professional.id === watchedProfessional
    );

    const sessionDuration = sessionTypes.find(s => s.id === watchedSessionType)?.duration || 0;

    return timeSlots.map(time => {
      const [hour, minute] = time.split(':').map(Number);
      const slotStartTime = new Date(selectedDate);
      slotStartTime.setHours(hour, minute, 0, 0);
      const slotEndTime = addMinutes(slotStartTime, sessionDuration);

      const isOccupied = professionalAppointments.some(app => {
        const appStartTime = app.startTime;
        const appEndTime = addMinutes(appStartTime, app.sessionType.duration);
        return slotStartTime < appEndTime && slotEndTime > appStartTime;
      });

      return { time, available: !isOccupied };
    });

  }, [watchedProfessional, watchedSessionType, existingAppointments, selectedDate, timeSlots]);

  const availableCamillas = useMemo(() => {
    const allCamillas = Array.from({ length: TOTAL_CAMILLAS }, (_, i) => i + 1);

    if (!watchedTime || !watchedZone || !watchedSessionType) {
      return allCamillas.map(camilla => ({ camilla: String(camilla), available: false }));
    }

    const sessionDuration = sessionTypes.find(s => s.id === watchedSessionType)?.duration || 0;
    const [hour, minute] = watchedTime.split(':').map(Number);
    const slotStartTime = new Date(selectedDate);
    slotStartTime.setHours(hour, minute, 0, 0);
    const slotEndTime = addMinutes(slotStartTime, sessionDuration);

    const conflictingAppointments = existingAppointments.filter(app => {
      const appStartTime = app.startTime;
      const appEndTime = addMinutes(appStartTime, app.sessionType.duration);
      return app.zone === watchedZone && slotStartTime < appEndTime && slotEndTime > appStartTime;
    });

    const occupiedCamillas = new Set(conflictingAppointments.map(app => app.camilla));

    return allCamillas.map(camilla => ({
      camilla: String(camilla),
      available: !occupiedCamillas.has(camilla),
    }));

  }, [watchedTime, watchedZone, watchedSessionType, existingAppointments, selectedDate]);

  async function handleAddNewClient(values: z.infer<typeof newClientSchema>) {
    setIsAddingClient(true);
    try {
      const newClientData: Omit<Client, 'id'> = { ...values, consents: {} };
      const newClient = await addClient(newClientData);
      if (newClient) {
        onClientsChange(prev => [...prev, newClient]);
        setClientSearchQuery(""); // Limpiar la búsqueda
        newClientForm.reset();
        setIsClientDialogOpen(false);
        // Seleccionar el cliente después de cerrar el diálogo
        setTimeout(() => {
          form.setValue("client", newClient.id);
        }, 100);
        toast({ title: "Client afegit", description: `S'ha afegit ${newClient.name} a la llista.` });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No s'ha pogut afegir el client." });
    } finally {
      setIsAddingClient(false);
    }
  }
  
  async function handleDeleteClient(clientId: string) {
    const clientHasAppointment = existingAppointments.some(app => app.client.id === clientId);
    if(clientHasAppointment) {
      toast({ variant: "destructive", title: "Error", description: "No es pot eliminar un client amb cites programades." });
      return;
    }
    
    const success = await deleteClientService(clientId);
    if (success) {
      onClientsChange(prev => prev.filter(c => c.id !== clientId));
      if (form.getValues("client") === clientId) {
        form.setValue("client", "");
      }
      toast({ title: "Client eliminat", description: "El client ha estat eliminat de la llista." });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    const clientDetails = clients.find(c => c.id === values.client);
    
    if (!clientDetails) {
        toast({ variant: "destructive", title: "Error", description: "Client no trobat." });
        setIsSubmitting(false);
        return;
    }

    try {
      const sessionTypeDetails = sessionTypes.find(s => s.id === values.sessionType);
      const professionalDetails = professionals.find(p => p.id === values.professional);
      const machineDetails = machines.find(m => m.id === values.machine);

      if (!sessionTypeDetails || !professionalDetails) {
          toast({ variant: "destructive", title: "Error", description: "Dades del formulari invàlides." });
          return;
      }
      
      const [hours, minutes] = values.time.split(':').map(Number);
      const appointmentTime = new Date(selectedDate);
      appointmentTime.setHours(hours, minutes, 0, 0);

      // Utilitzar isFirstTime del client per determinar si cal crear notificació
      const isFirstAppointmentForThisClient = clientDetails.isFirstTime === true;

      console.log('🔍 [DEBUG] Client selected:', clientDetails.name);
      console.log('🔍 [DEBUG] Client isFirstTime:', clientDetails.isFirstTime);
      console.log('🔍 [DEBUG] Will create notification:', isFirstAppointmentForThisClient);

      const newAppointmentData = {
          client: clientDetails,
          sessionType: sessionTypeDetails,
          professional: professionalDetails,
          startTime: appointmentTime,
          zone: values.zone as 'Dins' | 'Fora',
          camilla: parseInt(values.camilla, 10),
          machine: machineDetails,
          notes: '',
          isMutua: values.isMutua,
          isFirstTimeAppointment: isFirstAppointmentForThisClient,
      };
      
      await onAddAppointment(newAppointmentData);
      
      // After successfully creating the first appointment, update the client
      if (isFirstAppointmentForThisClient) {
        const updatedClient = { ...clientDetails, isFirstTime: false };
        const success = await updateClient(clientDetails.id, { isFirstTime: false });
        if (success) {
          onClientsChange(prevClients => 
            prevClients.map(c => c.id === updatedClient.id ? updatedClient : c)
          );
        }
      }
      
      toast({ title: "Èxit", description: "Cita creada correctament." });
      form.reset({
        ...form.getValues(),
        client: '',
        time: '',
        sessionType: '',
        machine: '',
        isMutua: false,
      });
      setSelectedSessionType(null);

    } catch (error) {
        console.error("Error en crear la cita:", error);
        toast({ variant: "destructive", title: "Error", description: "No s'ha pogut desar la cita. Intenta-ho de nou." });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleSessionTypeChange = (sessionId: string) => {
    form.setValue('sessionType', sessionId);
    setSelectedSessionType(sessionTypes.find(s => s.id === sessionId) || null);
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Crear Cita</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder={!clients.length ? "Carregant clients..." : "Selecciona un client"} />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="px-2 py-2 sticky top-0 bg-background z-10">
                                <Input
                                  placeholder="Buscar client..."
                                  value={clientSearchQuery}
                                  onChange={(e) => setClientSearchQuery(e.target.value)}
                                  className="h-8"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              {filteredClients.length > 0 ? (
                                filteredClients.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.isFirstTime ? '*' : ''}</SelectItem>)
                              ) : (
                                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                  No s'han trobat clients
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="icon" className="flex-shrink-0">
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Gestionar Clients</DialogTitle>
                            </DialogHeader>
                            <Separator />
                            <h3 className="text-lg font-medium">Afegir Nou Client</h3>
                            <Form {...newClientForm}>
                              <form onSubmit={newClientForm.handleSubmit(handleAddNewClient)} className="space-y-4">
                                <FormField
                                  control={newClientForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nom complet</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Ex: Maria Garcia Puig" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={newClientForm.control}
                                  name="isFirstTime"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                      <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>Primera visita (requereix signatura)</FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                                <DialogFooter>
                                  <Button type="submit" disabled={isAddingClient}>
                                    {isAddingClient && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Afegir Client
                                  </Button>
                                </DialogFooter>
                              </form>
                            </Form>
                            <Separator />
                            <h3 className="text-lg font-medium">Clients Existents</h3>
                            <ScrollArea className="h-[200px] mt-4">
                              <div className="space-y-2">
                                {clients.map(client => (
                                  <div key={client.id} className="flex items-center justify-between p-2 border rounded-md">
                                    <span>{client.name} {client.isFirstTime ? '*' : ''}</span>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>N'estàs segur?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Aquesta acció no es pot desfer. S'eliminarà el client permanentment.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteClient(client.id)} className="bg-destructive hover:bg-destructive/90">
                                            Eliminar
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                            <DialogFooter className="mt-4">
                              <DialogClose asChild><Button type="button" variant="outline">Tancar</Button></DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sessionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipus de Sessió</FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => { field.onChange(value); handleSessionTypeChange(value); }} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="Selecciona un tipus de sessió" /></SelectTrigger>
                          <SelectContent>{sessionTypes.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="Selecciona un professional" /></SelectTrigger>
                          <SelectContent>{professionals.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchedProfessional || !watchedSessionType}>
                          <SelectTrigger>
                            <SelectValue placeholder={!watchedProfessional || !watchedSessionType ? "Selecciona professional i sessió" : "Selecciona una hora"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTimeSlots.map(({time, available}) => (
                              <SelectItem key={time} value={time} disabled={!available}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="zone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zona</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecciona zona" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Dins">Dins</SelectItem>
                              <SelectItem value="Fora">Fora</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="camilla"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Camilla</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchedTime || !watchedZone || !watchedSessionType}>
                            <SelectTrigger>
                              <SelectValue placeholder={!watchedTime ? "Selecciona hora i zona" : "Selecciona camilla"} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCamillas.map(({camilla, available}) => (
                                <SelectItem key={camilla} value={camilla} disabled={!available}>
                                  {camilla}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {selectedSessionType?.requiresMachine && (
                  <FormField
                    control={form.control}
                    name="machine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Màquina</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecciona una màquina" /></SelectTrigger>
                            <SelectContent>{machines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="isMutua"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          És de mútua?
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Desar i Reservar
                </Button>
              </form>
            </Form>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
