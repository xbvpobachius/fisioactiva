
import type { Professional, Client, SessionType, Machine, Appointment } from './types';

export const professionals: Professional[] = [
  { id: '1', name: 'Glòria', color: '#ef4444' }, // rojo
  { id: '2', name: 'Ester', color: '#3b82f6' }, // azul
  { id: '3', name: 'Sílvia', color: '#f97316' }, // naranja
  { id: '4', name: 'Iván', color: '#6b7280' }, // gris
  { id: '5', name: 'Maria', color: '#93C572' }, // verde pistacho
];

export const clients: Client[] = [
  { id: 'c1', name: 'Pepe Moreno Jimenez', isFirstTime: false },
  { id: 'c2', name: 'Zacarias Limosna Bujarra', isFirstTime: false },
  { id: 'c3', name: 'Xavi Bou Valiente', isFirstTime: true },
  { id: 'c4', name: 'Wilson Serpia Quim', isFirstTime: false },
];

export const sessionTypes: SessionType[] = [
  { id: 's1', name: 'Privat 1h', duration: 60, color: 'hsl(var(--session-privat-1h))', requiresMachine: false },
  { id: 's2', name: 'Privat 30', duration: 30, color: 'hsl(var(--session-privat-30))', requiresMachine: false },
  { id: 's3', name: 'Semi-privat', duration: 60, color: 'hsl(var(--session-maquina))', requiresMachine: true },
  { id: 's4', name: 'Exercicis', duration: 30, color: 'hsl(var(--session-exercicis))', requiresMachine: false },
  { id: 's5', name: 'Grup manteniment', duration: 50, color: 'hsl(var(--session-grup-manteniment))', requiresMachine: false },
  { id: 's6', name: 'Domicilis', duration: 90, color: 'hsl(var(--session-domicilis))', requiresMachine: false },
  { id: 's7', name: 'Màquina sola', duration: 30, color: 'hsl(var(--session-maquina))', requiresMachine: true },
];

export const machines: Machine[] = [
  { id: 'm1', name: 'Magneto' },
  { id: 'm2', name: 'Indiba' },
  { id: 'm3', name: 'TENS' },
  { id: 'm4', name: 'Làser' },
  { id: 'm5', name: 'Ultrasons' },
];

const today = new Date();
const getTodayAt = (hours: number, minutes: number = 0) => {
    const date = new Date(today);
    date.setHours(hours, minutes, 0, 0);
    return date;
}

export const initialAppointments: Appointment[] = [
    {
        id: 'a1',
        client: clients[0],
        sessionType: sessionTypes[0],
        professional: professionals[0],
        startTime: getTodayAt(9, 0),
        zone: 'Dins',
        camilla: 1,
        isFirstTimeAppointment: false,
    },
    {
        id: 'a2',
        client: clients[1],
        sessionType: sessionTypes[2],
        professional: professionals[1],
        startTime: getTodayAt(10, 30),
        zone: 'Dins',
        camilla: 2,
        machines: [machines[1]],
        isFirstTimeAppointment: false,
    },
    {
        id: 'a3',
        client: clients[2],
        sessionType: sessionTypes[3],
        professional: professionals[2],
        startTime: getTodayAt(11, 0),
        zone: 'Fora',
        camilla: 3,
        isFirstTimeAppointment: true,
    },
     {
        id: 'a4',
        client: clients[0],
        sessionType: sessionTypes[1],
        professional: professionals[0],
        startTime: getTodayAt(12, 0),
        zone: 'Dins',
        camilla: 1,
        isFirstTimeAppointment: false,
    },
];
