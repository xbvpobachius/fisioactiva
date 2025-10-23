/**
 * Servicio para enviar notificaciones de fichas pendientes
 * a la aplicación de gestión de fichas (fisiodbfiches)
 */

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
  const FICHES_API_URL = process.env.NEXT_PUBLIC_FICHES_APP_URL;

  // Log de debug
  console.log('🔔 [NOTIFICATION] Starting notification process...');
  console.log('🔔 [NOTIFICATION] FICHES_API_URL:', FICHES_API_URL);
  console.log('🔔 [NOTIFICATION] Notification data:', notification);

  // Si no hay URL configurada, no enviar notificación
  if (!FICHES_API_URL) {
    console.error('❌ [NOTIFICATION] NEXT_PUBLIC_FICHES_APP_URL not configured!');
    console.error('❌ [NOTIFICATION] Please add NEXT_PUBLIC_FICHES_APP_URL to Railway environment variables');
    return false;
  }

  try {
    const url = `${FICHES_API_URL}/api/pending-records`;
    console.log('🔔 [NOTIFICATION] Sending POST to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    console.log('🔔 [NOTIFICATION] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [NOTIFICATION] Error response:', errorText);
      console.error('❌ [NOTIFICATION] Response status:', response.status);
      return false;
    }

    const result = await response.json();
    console.log('✅ [NOTIFICATION] Notification sent successfully!');
    console.log('✅ [NOTIFICATION] Result:', result);
    return true;
  } catch (error) {
    console.error('❌ [NOTIFICATION] Error calling fiches app API:', error);
    if (error instanceof Error) {
      console.error('❌ [NOTIFICATION] Error message:', error.message);
      console.error('❌ [NOTIFICATION] Error stack:', error.stack);
    }
    return false;
  }
}

