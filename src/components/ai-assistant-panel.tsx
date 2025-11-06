
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff, AlertTriangle, Wand2, CheckCircle, CalendarDays } from 'lucide-react';
import { createAppointmentFromText, CreateAppointmentTextOutput } from '@/ai/flows/create-appointment-from-text';
import type { Appointment, Client } from '@/lib/types';
import { professionals, sessionTypes, machines } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { addClient } from '@/services/clientService.supabase';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';

type AiAssistantPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'startTime'> & { startTime: Date }) => Promise<void>;
  clients: Client[];
  onClientsChange: (clients: Client[]) => void;
};

const SILENCE_TIMEOUT_MS = 3000; // 3 seconds of silence

export function AiAssistantPanel({ isOpen, onClose, selectedDate, onAddAppointment, clients, onClientsChange }: AiAssistantPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<CreateAppointmentTextOutput | null>(null);
  const [error, setError] = useState('');

  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const { toast } = useToast();

  const processTranscript = useCallback(async (text: string) => {
      if (!text || isLoading) return;
      setIsLoading(true);
      setError('');
      try {
        const response = await createAppointmentFromText({
            query: text,
            currentDate: selectedDate.toISOString(),
        });
        setAiResponse(response);
      } catch (e) {
        console.error("Error calling AI flow", e);
        setError("No s'ha pogut processar la sol·licitud. Intenta-ho de nou.");
        setAiResponse(null);
      } finally {
        setIsLoading(false);
      }
  }, [selectedDate, isLoading]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);
  
  const handleSilence = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("El reconeixement de veu no és compatible amb aquest navegador.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'ca-ES';
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        finalTranscriptRef.current = finalTranscript;
        setTranscript(finalTranscript + interimTranscript);
        
        silenceTimeoutRef.current = setTimeout(handleSilence, SILENCE_TIMEOUT_MS);
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setError("Hi ha hagut un error amb el reconeixement de veu.");
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        setIsRecording(false);
        if(finalTranscriptRef.current.trim()) {
            processTranscript(finalTranscriptRef.current);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent onend from firing on component unmount
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [handleSilence, processTranscript]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setTranscript('');
      finalTranscriptRef.current = '';
      setAiResponse(null);
      setError('');
      setIsRecording(true);
      if (recognitionRef.current) {
          recognitionRef.current.start();
      }
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(handleSilence, SILENCE_TIMEOUT_MS);
    }
  };
  
  const handleCreateAppointment = async () => {
    if (!aiResponse || !aiResponse.isReady) {
        toast({ variant: "destructive", title: "Error de validació", description: "Falten dades per crear la cita."});
        return;
    }

    setIsLoading(true);

    const professional = professionals.find(p => p.name === aiResponse.professionalName);
    const sessionType = sessionTypes.find(s => s.name === aiResponse.sessionTypeName);
    
    let client = clients.find(c => c.name.toLowerCase() === aiResponse.clientName?.toLowerCase());
    let isNewClient = false;
    
    const isExplicitNewClient = finalTranscriptRef.current.toLowerCase().includes("nou client") || finalTranscriptRef.current.toLowerCase().includes("client nou");

    if (!client && isExplicitNewClient && aiResponse.clientName) {
      try {
        const newClient = await addClient({ name: aiResponse.clientName, isFirstTime: true });
        if (newClient) {
          client = newClient;
          isNewClient = true;
          onClientsChange([...clients, newClient]);
        }
      } catch (e) {
        toast({ variant: "destructive", title: "Error en crear el client", description: "No s'ha pogut crear el nou client." });
        setIsLoading(false);
        return;
      }
    }
    
    if (!professional || !sessionType || !client || !aiResponse.time) {
        toast({ variant: "destructive", title: "Error de validació", description: "Falten dades essencials: professional, tipus de sessió, client o hora."});
        setIsLoading(false);
        return;
    }
    
    const machine = aiResponse.machineName ? machines.find(m => m.name === aiResponse.machineName) : undefined;
    
    const [hours, minutes] = aiResponse.time.split(':').map(Number);
    
    // Use the date from AI if available, otherwise use the selected date from the calendar
    const baseDate = aiResponse.date ? new Date(aiResponse.date) : selectedDate;
    // We need to adjust for timezone offset when parsing from a string like 'YYYY-MM-DD'
    const timezoneOffset = baseDate.getTimezoneOffset() * 60000;
    const adjustedBaseDate = new Date(baseDate.getTime() + timezoneOffset);

    const appointmentTime = new Date(adjustedBaseDate.getFullYear(), adjustedBaseDate.getMonth(), adjustedBaseDate.getDate(), hours, minutes);
    
    const isFirstAppointmentForThisClient = isNewClient || !!client.isFirstTime;

    const newAppointmentData = {
        client: client,
        sessionType: sessionType,
        professional: professional,
        startTime: appointmentTime,
        zone: 'Dins' as 'Dins' | 'Fora',
        camilla: 1, 
        machines: machine ? [machine] : undefined,
        notes: `Creat per IA: "${finalTranscriptRef.current}"`,
        isMutua: aiResponse.isMutua,
        isFirstTimeAppointment: isFirstAppointmentForThisClient,
    };
    
    await onAddAppointment(newAppointmentData);
    setIsLoading(false);
    toast({ title: "Cita Creada!", description: "La cita s'ha afegit a l'agenda."});
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) stopRecording(); onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'><Wand2 className='w-5 h-5 text-primary' /> Assistent de Cites per Veu</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className='text-center'>
                <Button 
                    size="icon" 
                    className={`rounded-full w-20 h-20 shadow-lg transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                    onClick={toggleRecording}
                    disabled={!!error && !error.includes("compatible")}
                >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                    {isRecording ? 'Enregistrant... Clica o fes una pausa per aturar.' : 'Clica per començar a gravar'}
                </p>
            </div>
          
            {transcript && (
                <div className='p-3 bg-muted/50 rounded-md text-center italic'>
                    "{transcript}"
                </div>
            )}
          
            {isLoading && !aiResponse && <div className='flex justify-center items-center gap-2'><Loader2 className="h-5 w-5 animate-spin" /> Processant...</div>}

            {error && <div className='p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2'><AlertTriangle className='w-4 h-4' /> {error}</div>}

            {aiResponse && (
                <div className='space-y-3 p-4 border rounded-lg'>
                    <h4 className='font-semibold text-center'>Dades de la Cita Proposada</h4>
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                        <p><strong>Client:</strong></p><p>{aiResponse.clientName || '...'}</p>
                        <p><strong>Professional:</strong></p><p>{aiResponse.professionalName || '...'}</p>
                        <p><strong>Sessió:</strong></p><p>{aiResponse.sessionTypeName || '...'}</p>
                        {aiResponse.date && (
                            <>
                                <p className='flex items-center gap-1'><CalendarDays className='w-4 h-4' /> <strong>Data:</strong></p>
                                <p>{format(new Date(new Date(aiResponse.date).getTime() + new Date().getTimezoneOffset() * 60000), "PPP", { locale: ca })}</p>
                            </>
                        )}
                        <p><strong>Hora:</strong></p><p>{aiResponse.time || '...'}</p>
                        {aiResponse.machineName && <><p><strong>Màquina:</strong></p><p>{aiResponse.machineName}</p></>}
                         <p><strong>Mútua:</strong></p><p>{aiResponse.isMutua ? <CheckCircle className='w-4 h-4 text-green-600' /> : 'No'}</p>
                    </div>
                    {!aiResponse.isReady && aiResponse.missingInfo && (
                        <div className='p-3 bg-amber-100 text-amber-800 text-sm rounded-md text-center'>
                            <strong>Informació pendent:</strong> {aiResponse.missingInfo}
                        </div>
                    )}
                    {aiResponse.isReady && (
                        <div className='p-2 bg-green-100 text-green-800 text-sm rounded-md text-center'>
                           Tot a punt per crear la cita!
                        </div>
                    )}
                </div>
            )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel·lar</Button>
          <Button type="button" onClick={handleCreateAppointment} disabled={!aiResponse?.isReady || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Crear Cita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    