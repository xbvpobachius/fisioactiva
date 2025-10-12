
'use server';

/**
 * @fileOverview This file defines a Genkit flow for intelligent resource allocation.
 *
 * - analyzeResourceAllocation - Analyzes resource availability and determines if a booking can proceed.
 * - ResourceAllocationInput - The input type for the analyzeResourceAllocation function.
 * - ResourceAllocationOutput - The return type for the analyzeResourceAllocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExistingAppointmentSchema = z.object({
    professional: z.string(),
    machine: z.string().optional(),
    startTime: z.string().describe('The start time of the existing appointment (ISO format).'),
    durationMinutes: z.number(),
    zone: z.string(),
    camilla: z.number(),
});

const ResourceAllocationInputSchema = z.object({
  sessionType: z.string().describe('The type of session to book (e.g., Privat 1h, Semi-privat).'),
  professional: z.string().describe('The name of the professional assigned to the session.'),
  zone: z.string().describe('The zone where the session will take place (e.g., Dins, Fora).'),
  camilla: z.number().describe('The camilla number for the session.'),
  machine: z.string().optional().describe('The machine required for the session (e.g., Magneto, Indiba).'),
  dateTime: z.string().describe('The date and time of the requested session (ISO format).'),
  durationMinutes: z.number().describe('The duration of the session in minutes.'),
  numberOfPatients: z.number().optional().describe('The number of patients for the session, if applicable.'),
  existingAppointments: z.array(ExistingAppointmentSchema).describe('A list of all existing appointments for the selected day.'),
});
export type ResourceAllocationInput = z.infer<typeof ResourceAllocationInputSchema>;

const ResourceAllocationOutputSchema = z.object({
  canProceed: z.boolean().describe('Whether the booking can proceed based on resource availability.'),
  reason: z.string().optional().describe('The reason why the booking cannot proceed, if applicable.'),
});
export type ResourceAllocationOutput = z.infer<typeof ResourceAllocationOutputSchema>;

export async function analyzeResourceAllocation(input: ResourceAllocationInput): Promise<ResourceAllocationOutput> {
  return intelligentResourceAllocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentResourceAllocationPrompt',
  input: {schema: ResourceAllocationInputSchema},
  output: {schema: ResourceAllocationOutputSchema},
  prompt: `Ets un assistent d'IA que analitza la disponibilitat de recursos (personal, equipament i sales) per determinar si es pot procedir amb una reserva.

  Considera les següents restriccions:
  - Cada professional només pot atendre una sessió a la vegada.
  - Cada màquina només es pot utilitzar en una sessió a la vegada.
  - Cada camilla en una zona específica només pot ser utilitzada per una sessió a la vegada.
  - El nombre màxim de pacients per a "Exercicis" és 4 i per a "Grup manteniment" és 8.

  Aquí tens la llista de cites existents per al dia:
  {{#each existingAppointments}}
  - Professional: {{this.professional}}, Màquina: {{this.machine}}, Inici: {{this.startTime}}, Durada: {{this.durationMinutes}} minuts, Zona: {{this.zone}}, Camilla: {{this.camilla}}
  {{/each}}

  Donada la següent sol·licitud de reserva:
  Tipus de Sessió: {{{sessionType}}}
  Professional: {{{professional}}}
  Zona: {{{zone}}}
  Camilla: {{{camilla}}}
  Màquina: {{{machine}}}
  Data i Hora: {{{dateTime}}}
  Durada (minuts): {{{durationMinutes}}}
  
  La teva tasca és comprovar si hi ha solapaments de temps. Un solapament es produeix si l'interval de temps de la sessió sol·licitada [dateTime, dateTime + durationMinutes] s'intersecta amb l'interval de temps de qualsevol cita existent [startTime, startTime + durationMinutes].
  
  1. Comprova si el professional sol·licitat '{{{professional}}}' ja està ocupat durant la franja horària sol·licitada.
  2. Comprova si la camilla sol·licitada '{{{camilla}}}' a la zona '{{{zone}}}' ja està ocupada durant la franja horària sol·licitada.
  3. Si es sol·licita una màquina '{{{machine}}}', comprova si aquesta màquina específica ja està ocupada durant la franja horària sol·licitada.
  
  Determina si es pot procedir amb la reserva. Si no és possible, explica el conflicte específic (p. ex., "El professional ja està ocupat a aquesta hora.", "La camilla ja està en ús en aquest horari." o "La màquina ja està en ús en aquest horari.").
  Sempre has de respondre en format JSON.
  `,
});

const intelligentResourceAllocationFlow = ai.defineFlow(
  {
    name: 'intelligentResourceAllocationFlow',
    inputSchema: ResourceAllocationInputSchema,
    outputSchema: ResourceAllocationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
