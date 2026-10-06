import api from '@/api/config';

export type PrintAutomation = 'manual' | 'automatic';
export type PrintFontSize = 'medium' | 'large';
export type PrintTrigger = string;

export interface PrinterConfig {
  summary_enabled: boolean;
  summary_automation: PrintAutomation;
  summary_font_size: PrintFontSize;
  summary_trigger: PrintTrigger;
  complete_enabled: boolean;
  complete_automation: PrintAutomation;
  complete_font_size: PrintFontSize;
  complete_trigger: PrintTrigger;
}

export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  summary_enabled: true,
  summary_automation: 'manual',
  summary_font_size: 'medium',
  summary_trigger: 'received',
  complete_enabled: true,
  complete_automation: 'manual',
  complete_font_size: 'medium',
  complete_trigger: 'received',
};

export async function getPrinterConfig(): Promise<PrinterConfig> {
  const response = await api.get('/shop_printer_configs');
  return response.data.data.attributes;
}

export async function updatePrinterConfig(config: PrinterConfig): Promise<PrinterConfig> {
  const response = await api.put('/shop_printer_configs', { shop_printer_config: config });
  return response.data.data.attributes;
}
