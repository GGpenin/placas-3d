export interface PlateData {
  animalName: string;
  ringNumber: string;
  birthDate: string;
  sex: string;
  ctf: string;
  owner: string;
  ownerLabel?: string;
  title: string;
  subtitle: string;
  footer: string;
}

export type LayoutType = 'standard' | 'technical' | 'sidebar' | 'badge' | 'simple' | 'split' | 'minimalist';

export interface PlateConfig {
  width: number;
  height: number;
  thickness: number;
  borderRadius: number;
  textRelief: number;
  lineThickness: number;
  color: string;
  boxDepth: number;
  dataTextSize: number;
  labelTextSize: number;
  layout: LayoutType;
  dataTextCase?: 'uppercase' | 'lowercase' | 'original';
  labelTextCase?: 'uppercase' | 'lowercase' | 'original';
  labelFontWeight?: 'regular' | 'bold';
  dataFontWeight?: 'regular' | 'bold';
}

export interface TypographyConfig {
  labelFont: string;
  dataFont: string;
}

export interface ProjectData {
  plateData: PlateData;
  plateConfig: PlateConfig;
  typography: TypographyConfig;
}
