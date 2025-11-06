
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Appointment, Professional, Client, Consent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bot, Calendar, Clock, MapPin, User, Stethoscope, Trash2, Pencil, ShieldCheck, FileSignature, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { professionals } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { ClientConsentViewer } from './client-consent-viewer';

type AppointmentDetailsDialogProps = {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveNotes: (appointmentId: string, notes: string) => void;
  onDelete: (appointmentId: string) => void;
  onUpdateProfessional: (appointmentId: string, professional: Professional) => void;
  onUpdateClient: (client: Client) => void;
};

export function AppointmentDetailsDialog({
  appointment,
  isOpen,
  onClose,
  onSaveNotes,
  onDelete,
  onUpdateProfessional,
  onUpdateClient,
}: AppointmentDetailsDialogProps) {
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<string | undefined>(appointment?.professional.id);
  const [isConsentViewerOpen, setIsConsentViewerOpen] = useState(false);
  const { toast } = useToast();

  if (!appointment) return null;

  const hasSignedConsent = !!(appointment.client.consents?.dataProtection && appointment.client.consents?.treatment);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const textarea = form.elements.namedItem('notes') as HTMLTextAreaElement;
    onSaveNotes(appointment.id, textarea.value);
    toast({ title: "Notes desades", description: "Les notes de la cita s'han actualitzat." });
  };
  
  const handleDelete = () => {
    onDelete(appointment.id);
    onClose();
  }

  const handleProfessionalChange = (professionalId: string) => {
    setSelectedProfessional(professionalId);
    const newProfessional = professionals.find(p => p.id === professionalId);
    if (newProfessional) {
      onUpdateProfessional(appointment.id, newProfessional);
      toast({ title: "Professional actualitzat", description: "S'ha assignat un nou professional a la cita." });
    }
    setIsEditingProfessional(false);
  };

  const handleConsentUpdate = (consents: { dataProtection?: Consent, treatment?: Consent }) => {
    const updatedClient = { ...appointment.client, consents };
    onUpdateClient(updatedClient);
    toast({ title: "Consentiment actualitzat", description: "Les signatures del client s'han desat." });
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalls de la Cita</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">{appointment.client.name} {appointment.isFirstTimeAppointment ? '*' : ''}</span>
              {appointment.isFirstTimeAppointment && (
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsConsentViewerOpen(true)}>
                      <FileSignature className="mr-2 h-4 w-4" />
                      Veure Consentiment
                    </Button>
                    {hasSignedConsent && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                 </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Stethoscope className="h-5 w-5 text-muted-foreground" />
              {isEditingProfessional ? (
                <Select onValueChange={handleProfessionalChange} defaultValue={selectedProfessional}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecciona professional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <span>{appointment.professional.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingProfessional(true)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Badge style={{ backgroundColor: appointment.sessionType.color, color: 'hsl(var(--primary-foreground))' }}>
                  {appointment.sessionType.name}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{format(appointment.startTime, "PPPP", { locale: ca })}</span>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>{format(appointment.startTime, 'HH:mm')} ({appointment.sessionType.duration} min)</span>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{appointment.zone} - Camilla {appointment.camilla}</span>
            </div>
            {appointment.machines && appointment.machines.length > 0 && (
              <div className="flex items-center gap-4">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                  <span>{appointment.machines.map(m => m.name).join(', ')}</span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <span>Mútua: {appointment.isMutua ? 'Sí' : 'No'}</span>
            </div>
            
            <form onSubmit={handleSave} className="grid w-full gap-1.5 mt-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                placeholder="Afegeix detalls extra aquí..." 
                id="notes" 
                name="notes"
                defaultValue={appointment.notes} 
              />
              <DialogFooter className="mt-4 pt-4 border-t justify-between">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="mr-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Cita
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>N'estàs segur?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Aquesta acció no es pot desfer. Això eliminarà la cita permanentment.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>Tancar</Button>
                  <Button type="submit">Desar Notes</Button>
                </div>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      {appointment.isFirstTimeAppointment && (
        <ClientConsentViewer
          isOpen={isConsentViewerOpen}
          client={appointment.client}
          onClose={() => setIsConsentViewerOpen(false)}
          onSave={handleConsentUpdate}
        />
      )}
    </>
  );
}
