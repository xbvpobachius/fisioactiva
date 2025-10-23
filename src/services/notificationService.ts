/**
 * Servicio para enviar notificaciones de fichas pendientes
 * a la aplicación de gestión de fichas (fisiodbfiches)
 */

const FICHES_API_URL = process.env.NEXT_PUBLIC_FICHES_APP_URL || '';

export interface PendingRecordNotification {
  clientName: string;
  appointmentId: string;
  appointmentDate: string; // ISO 8601 format
}

/**
 * Envía una notificación a la app de fichas cuando se crea una cita
 */
export async function notifyPendingRecord(
  notification: PendingRecordNotification
): Promise<boolean> {
  // Si no hay URL configurada, no enviar notificación
  if (!FICHES_API_URL) {
    console.warn('FICHES_APP_URL not configured. Skipping notification.');
    return false;
  }

  try {
    const response = await fetch(`${FICHES_API_URL}/api/pending-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error sending notification to fiches app:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Notification sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error calling fiches app API:', error);
    return false;
  }
}

