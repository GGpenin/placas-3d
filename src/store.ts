import { create } from 'zustand';
import { PlateData, PlateConfig, TypographyConfig, ProjectData } from './types';

const defaultPlateData: PlateData = {
  title: '',
  subtitle: '',
  animalName: '',
  ringNumber: '',
  birthDate: '',
  sex: '',
  ctf: '',
  owner: '',
  ownerLabel: 'PROPRIETÁRIO',
  footer: '',
};

const defaultPlateConfig: PlateConfig = {
  width: 120,
  height: 80,
  thickness: 4,
  borderRadius: 5,
  textRelief: 1.5,
  lineThickness: 1,
  color: '#d4af37', // Gold-ish
  boxDepth: 1.5,
  dataTextSize: 6,
  labelTextSize: 2.5,
  layout: 'standard',
  dataTextCase: 'original',
  labelTextCase: 'original',
};

const defaultTypography: TypographyConfig = {
  labelFont: 'helvetiker',
  dataFont: 'helvetiker',
};

interface AppState {
  plateData: PlateData;
  plateConfig: PlateConfig;
  typography: TypographyConfig;
  setPlateData: (data: Partial<PlateData>) => void;
  setPlateConfig: (config: Partial<PlateConfig>) => void;
  setTypography: (typography: Partial<TypographyConfig>) => void;
  reset: () => void;
  loadProject: (json: string) => void;
  getProjectData: () => ProjectData;
}

export const useAppStore = create<AppState>((set, get) => ({
  plateData: defaultPlateData,
  plateConfig: defaultPlateConfig,
  typography: defaultTypography,
  setPlateData: (data) => set((state) => ({ plateData: { ...state.plateData, ...data } })),
  setPlateConfig: (config) => set((state) => ({ plateConfig: { ...state.plateConfig, ...config } })),
  setTypography: (typography) => set((state) => ({ typography: { ...state.typography, ...typography } })),
  reset: () => set({ plateData: defaultPlateData, plateConfig: defaultPlateConfig, typography: defaultTypography }),
  loadProject: (json) => {
    try {
      const data: ProjectData = JSON.parse(json);
      if (data.plateData && data.plateConfig && data.typography) {
        set({ plateData: data.plateData, plateConfig: data.plateConfig, typography: data.typography });
      }
    } catch (e) {
      console.error('Failed to parse project JSON', e);
    }
  },
  getProjectData: () => {
    const { plateData, plateConfig, typography } = get();
    return { plateData, plateConfig, typography };
  }
}));
