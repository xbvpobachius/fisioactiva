export type Professional = {
  id: string;
  name: string;
};

export type SessionType = {
  id: string;
  name: string;
  duration: number; // in minutes
  color: string;
  requiresMachine: boolean;
};

export type Machine = {
  id: string;
  name: string;
};

export type Consent = {
  signature: string; // Data URL of the signature image
  consentDate: string; // ISO string date
};

export type Client = {
  id: string;
  name: string;
  isFirstTime?: boolean;
  consents?: {
    dataProtection?: Consent;
    treatment?: Consent;
  };
};

export type Appointment = {
  id: string;
  client: Client;
  sessionType: SessionType;
  professional: Professional;
  startTime: Date;
  zone: 'Dins' | 'Fora';
  camilla: number;
  machine?: Machine;
  notes?: string;
  isMutua?: boolean;
  isFirstTimeAppointment?: boolean; // Add this field
};
