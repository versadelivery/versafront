/**
 * Utilitários para manipulação de horários no frontend
 */

/**
 * Normaliza um horário para o formato HH:MM sem considerações de timezone
 * @param timeInput - Input de horário (string ou Date)
 * @returns String no formato HH:MM
 */
export function normalizeTimeForAPI(timeInput: string | Date): string {
  if (!timeInput) return '';
  
  if (typeof timeInput === 'string') {
    // Se já está no formato HH:MM, retorna como está
    if (/^\d{1,2}:\d{2}$/.test(timeInput)) {
      const [hour, minute] = timeInput.split(':').map(num => parseInt(num, 10));
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    // Tenta fazer parse da string
    const date = new Date(timeInput);
    if (isNaN(date.getTime())) {
      console.error('Formato de horário inválido:', timeInput);
      return '00:00';
    }
    
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  if (timeInput instanceof Date) {
    return `${timeInput.getHours().toString().padStart(2, '0')}:${timeInput.getMinutes().toString().padStart(2, '0')}`;
  }
  
  return '00:00';
}

/**
 * Converte um horário HH:MM para um objeto Date mantendo apenas hora e minuto
 * @param timeString - String no formato HH:MM
 * @returns Date object com data base e hora especificada
 */
export function timeStringToDate(timeString: string): Date {
  if (!timeString || !timeString.match(/^\d{1,2}:\d{2}$/)) {
    return new Date(2000, 0, 1, 0, 0); // 1º de janeiro de 2000, 00:00
  }
  
  const [hour, minute] = timeString.split(':').map(num => parseInt(num, 10));
  return new Date(2000, 0, 1, hour, minute); // 1º de janeiro de 2000
}

/**
 * Prepara dados de schedule para envio à API, normalizando todos os campos de horário
 * @param scheduleData - Dados do schedule
 * @returns Dados com horários normalizados
 */
export function prepareScheduleForAPI(scheduleData: Record<string, any>): Record<string, any> {
  const timeFields = [
    'sunday_open', 'sunday_close',
    'monday_open', 'monday_close',
    'tuesday_open', 'tuesday_close',
    'wednesday_open', 'wednesday_close',
    'thursday_open', 'thursday_close',
    'friday_open', 'friday_close',
    'saturday_open', 'saturday_close'
  ];
  
  const processed = { ...scheduleData };
  
  timeFields.forEach(field => {
    if (processed[field]) {
      processed[field] = normalizeTimeForAPI(processed[field]);
    }
  });
  
  return processed;
}
