
'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating an appointment from a natural language text string.
 *
 * - createAppointmentFromText - Analyzes text to extract appointment details.
 * - CreateAppointmentTextInput - The input type for the createAppointmentFrom-text function.
 * - CreateAppointmentTextOutput - The return type for the createAppointmentFromText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { professionals, sessionTypes, machines, clients } from '@/lib/data';

const CreateAppointmentTextInputSchema = z.object({
  query: z.string().describe('The natural language query for creating an appointment.'),
  currentDate: z.string().describe('The current date context (ISO format) to resolve relative times like "tomorrow" or "in the afternoon".'),
});
export type CreateAppointmentTextInput = z.infer<typeof CreateAppointmentTextInputSchema>;

const CreateAppointmentTextOutputSchema = z.object({
  clientName: z.string().optional().describe('The name of the client. It MUST match a name from the existing clients list if a close match is found. If the user says "nou client" or "client nou", extract the new name.'),
  professionalName: z.string().optional().describe('The name of the professional.'),
  sessionTypeName: z.string().optional().describe('The name of the session type.'),
  machineName: z.string().optional().describe('The name of the machine, if mentioned.'),
  time: z.string().optional().describe('The extracted time for the appointment in HH:mm format.'),
  date: z.string().optional().describe('The extracted date for the appointment in YYYY-MM-DD format, if mentioned. Otherwise, it should be null.'),
  isMutua: z.boolean().optional().describe('Whether the appointment is covered by a mutual insurance.'),
  isReady: z.boolean().describe('Whether all required information (client, professional, session, time) has been extracted.'),
  missingInfo: z.string().optional().describe('A question to the user to get the missing information, if any.'),
});
export type CreateAppointmentTextOutput = z.infer<typeof CreateAppointmentTextOutputSchema>;


export async function createAppointmentFromText(input: CreateAppointmentTextInput): Promise<CreateAppointmentTextOutput> {
  return createAppointmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createAppointmentFromTextPrompt',
  input: { schema: CreateAppointmentTextInputSchema },
  output: { schema: CreateAppointmentTextOutputSchema },
  prompt: `You are a highly precise AI assistant for a physiotherapy clinic. Your task is to extract appointment details from a user's voice command with maximum accuracy.

  Today's date is: {{{currentDate}}}. Use this as a reference for terms like "avui" (today), "demà" (tomorrow), "demà passat" (the day after tomorrow), or specific dates like "el dia 15".
  Common time references are: "al matí" (9:00), "al migdia" (12:00), "a la tarda" (16:00), "al vespre" (19:00).

  Here are the available resources. You MUST match the names exactly as they are written:
  - Professionals: ${professionals.map(p => `"${p.name}"`).join(', ')}
  - Session Types: ${sessionTypes.map(s => `"${s.name}"`).join(', ')}
  - Machines: ${machines.map(m => `"${m.name}"`).join(', ')}
  - Existing Clients: ${clients.map(c => `"${c.name}"`).join(', ')}

  Analyze the user's query: "{{{query}}}"

  Your goal is to fill out the following fields:
  - clientName: Identify the client's name from the query. Your primary goal is to match it to a name in the "Existing Clients" list. If a name in the query is a very close match to an existing client (e.g., "Pepe Moreno" for "Pepe Moreno Jimenez"), use the name from the list. ONLY if the user explicitly says "crea un nou client" or "per a un client nou", you should extract the new client name provided. If no existing client matches and the user did not ask to create a new one, this field MUST be null.
  - professionalName: Identify the professional. It must be one from the provided list.
  - sessionTypeName: Identify the session type. It must be one from the provided list.
  - machineName: If a specific machine is mentioned, identify it. It must be one from the list.
  - time: Extract the start time in HH:mm format (e.g., 10:00, 16:30).
  - date: Extract the date if specified (e.g., "demà", "el dia 25"). Return it in YYYY-MM-DD format. If no date is mentioned, this field must be null.
  - isMutua: Determine if the session is for a mutual insurance patient (keywords: "mutua", "mútua").

  - If all required fields (client, professional, session, time) are present, set "isReady" to true.
  - If any of these fields are missing, set "isReady" to false and formulate a clear, concise question in Catalan for the user in the "missingInfo" field to get the missing data. For example, if the client is missing, ask "Per a quin client és la cita?".

  Example 1:
  Query: "Apunta'm a en Xavi Bou Valiente per a una sessió de privat 1h amb la Glòria demà a les 11 del matí"
  Expected Output: { "clientName": "Xavi Bou Valiente", "professionalName": "Glòria", "sessionTypeName": "Privat 1h", "time": "11:00", "date": (tomorrow's date in YYYY-MM-DD), "isReady": true }

  Example 2:
  Query: "Reserva per a Pepe Moreno amb l'Ester a les 5 de la tarda."
  Expected Output: { "clientName": "Pepe Moreno Jimenez", "professionalName": "Ester", "time": "17:00", "isReady": false, "missingInfo": "Quin tipus de sessió?" }
  
  Example 3:
  Query: "Reserva per a un tal Joan amb la Maria a les 10."
  Expected Output: { "clientName": null, "professionalName": "Maria", "time": "10:00", "isReady": false, "missingInfo": "Quin tipus de sessió i per a quin client? No trobo cap 'Joan' a la llista." }

  Example 4:
  Query: "Crea una cita per a un nou client, en Marc Soler, amb la Sílvia per a un privat de 30 a les 9"
  Expected Output: { "clientName": "Marc Soler", "professionalName": "Sílvia", "sessionTypeName": "Privat 30", "time": "09:00", "isReady": true }

  Always respond in JSON format.
  `,
});

const createAppointmentFlow = ai.defineFlow(
  {
    name: 'createAppointmentFlow',
    inputSchema: CreateAppointmentTextInputSchema,
    outputSchema: CreateAppointmentTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
