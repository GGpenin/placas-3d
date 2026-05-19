import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Save, Upload, RotateCcw, Download } from 'lucide-react';
import { exportSTL } from '../utils/exportSTL';
import { generateLayout } from '../utils/layoutEngine';

export function EditorPanel() {
  const [activeTab, setActiveTab] = useState<'data' | 'config'>('data');
  const { plateData, setPlateData, plateConfig, setPlateConfig, reset, loadProject, getProjectData } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed effective scales
  let minDataScale = 1;
  let minLabelScale = 1;

  try {
    const { texts } = generateLayout(plateConfig, plateData);
    texts.forEach(t => {
      let displayText = t.text || '';
      if (plateConfig.dataTextCase === 'uppercase') displayText = displayText.toUpperCase();
      else if (plateConfig.dataTextCase === 'lowercase') displayText = displayText.toLowerCase();

      let displayLabel = t.label || '';
      if (displayLabel) {
        if (plateConfig.labelTextCase === 'uppercase') displayLabel = displayLabel.toUpperCase();
        else if (plateConfig.labelTextCase === 'lowercase') displayLabel = displayLabel.toLowerCase();
      }

      const dataSize = Math.max(1, plateConfig.dataTextSize || 6);
      const labelSize = Math.max(1, plateConfig.labelTextSize || 2.5);

      const paddingX = 4;
      const paddingY = 4;
      const availableW = Math.max(0.1, t.w - paddingX);
      const availableH = Math.max(0.1, t.h - paddingY);

      const estimatedLabelWidth = displayLabel ? displayLabel.length * labelSize * 0.65 : 0;
      const estimatedDataWidth = displayText ? displayText.length * dataSize * 0.65 : 0;

      let scaleLabel = displayLabel ? Math.min(1, availableW / Math.max(0.1, estimatedLabelWidth)) : 1;
      let scaleData = displayText ? Math.min(1, availableW / Math.max(0.1, estimatedDataWidth)) : 1;

      let physLabelH = displayLabel ? labelSize * scaleLabel : 0;
      let physDataH = displayText ? dataSize * scaleData : 0;

      const gap = displayLabel && displayText ? Math.max(1, t.h * 0.05) : 0;
      const totalPhysH = physLabelH + gap + physDataH;

      if (totalPhysH > availableH) {
        const reduction = availableH / totalPhysH;
        scaleLabel *= reduction;
        scaleData *= reduction;
      }

      if (displayLabel) minLabelScale = Math.min(minLabelScale, scaleLabel);
      if (displayText) minDataScale = Math.min(minDataScale, scaleData);
    });
  } catch (e) {
    console.error(e);
  }

  const handleSaveProject = () => {
    const data = getProjectData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'placa-projeto.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          loadProject(event.target.result);
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold mb-4">Criador de Placas 3D</h1>
        <div className="flex space-x-2">
          <button onClick={handleSaveProject} className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm transition-colors">
            <Save size={16} /> Salvar
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm transition-colors">
            <Upload size={16} /> Carregar
          </button>
          <input type="file" ref={fileInputRef} onChange={handleLoadProject} accept=".json" className="hidden" />
          <button onClick={reset} className="flex items-center justify-center bg-red-900/50 hover:bg-red-800/50 text-red-200 p-2 rounded transition-colors" title="Resetar">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'data' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'}`}
          onClick={() => setActiveTab('data')}
        >
          Dados
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'config' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'}`}
          onClick={() => setActiveTab('config')}
        >
          Configurações
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'data' ? (
          <>
            <InputField label="Título Principal" value={plateData.title} onChange={(v) => setPlateData({ title: v })} />
            <InputField label="Subtítulo (Opcional)" value={plateData.subtitle} onChange={(v) => setPlateData({ subtitle: v })} />
            <InputField label="Nome da Ave" value={plateData.animalName} onChange={(v) => setPlateData({ animalName: v })} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Anilha" value={plateData.ringNumber} onChange={(v) => setPlateData({ ringNumber: v })} />
              <InputField label="Sexo" value={plateData.sex} onChange={(v) => setPlateData({ sex: v })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Data de Nasc." value={plateData.birthDate} onChange={(v) => setPlateData({ birthDate: v })} />
              <InputField label="Registro CTF" value={plateData.ctf} onChange={(v) => setPlateData({ ctf: v })} />
            </div>
            
            <div className="flex gap-2 items-end">
              <div className="space-y-1 w-1/3">
                <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Rótulo</label>
                <select 
                  value={plateData.ownerLabel || 'PROPRIETÁRIO'} 
                  onChange={(e) => setPlateData({ ownerLabel: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="PROPRIETÁRIO">Proprietário</option>
                  <option value="CRIADOR">Criador</option>
                  <option value="PROP.">Prop.</option>
                  <option value="CRIADOR / PROPRIETÁRIO">Criador / Prop.</option>
                </select>
              </div>
              <div className="w-2/3">
                <InputField label="Nome" value={plateData.owner} onChange={(v) => setPlateData({ owner: v })} />
              </div>
            </div>

            <InputField label="Rodapé (Opcional)" value={plateData.footer} onChange={(v) => setPlateData({ footer: v })} />
          </>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Modelo de Layout</label>
              <select
                value={plateConfig.layout}
                onChange={(e) => setPlateConfig({ layout: e.target.value as any })}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="standard">Padrão (Clássico)</option>
                <option value="technical">Ficha Técnica (Colunas)</option>
                <option value="sidebar">Lateral (Título Rotacionado)</option>
                <option value="badge">Crachá (Verticalizado)</option>
                <option value="simple">Simples (Apenas Essencial)</option>
                <option value="split">Dividido (Lado a Lado)</option>
                <option value="minimalist">Minimalista (Sem Linhas)</option>
              </select>
            </div>

            <SliderField label="Largura (mm)" value={plateConfig.width} min={50} max={300} onChange={(v) => setPlateConfig({ width: v })} />
            <SliderField label="Altura (mm)" value={plateConfig.height} min={30} max={200} onChange={(v) => setPlateConfig({ height: v })} />
            <SliderField label="Espessura Base (mm)" value={plateConfig.thickness} min={1} max={10} step={0.5} onChange={(v) => setPlateConfig({ thickness: v })} />
            <SliderField label="Raio da Borda (mm)" value={plateConfig.borderRadius} min={0} max={20} step={1} onChange={(v) => setPlateConfig({ borderRadius: v })} />
            <SliderField label="Profundidade da Caixa (mm)" value={plateConfig.boxDepth} min={0.5} max={5} step={0.1} onChange={(v) => setPlateConfig({ boxDepth: v })} />
            <SliderField label="Altura do Relevo (mm)" value={plateConfig.textRelief} min={0.5} max={5} step={0.1} onChange={(v) => setPlateConfig({ textRelief: v })} />
            <SliderField label={`Tamanho da Fonte (Dados) ${minDataScale < 0.99 ? ` - Ajst: ${(plateConfig.dataTextSize * minDataScale).toFixed(1)}mm` : ''}`} value={plateConfig.dataTextSize} min={4} max={20} step={0.5} onChange={(v) => setPlateConfig({ dataTextSize: v })} />
            <SliderField label={`Tamanho da Fonte (Rótulos) ${minLabelScale < 0.99 ? ` - Ajst: ${(plateConfig.labelTextSize * minLabelScale).toFixed(1)}mm` : ''}`} value={plateConfig.labelTextSize} min={1} max={10} step={0.5} onChange={(v) => setPlateConfig({ labelTextSize: v })} />
            
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Formato do Texto (Dados)</label>
              <select
                value={plateConfig.dataTextCase || 'original'}
                onChange={(e) => setPlateConfig({ dataTextCase: e.target.value as any })}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="original">Original (Como digitado)</option>
                <option value="uppercase">MAIÚSCULA</option>
                <option value="lowercase">minúscula</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Peso da Fonte (Dados)</label>
              <select
                value={plateConfig.dataFontWeight || 'bold'}
                onChange={(e) => setPlateConfig({ dataFontWeight: e.target.value as any })}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="regular">Normal</option>
                <option value="bold">Negrito</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Formato do Texto (Rótulos)</label>
              <select
                value={plateConfig.labelTextCase || 'original'}
                onChange={(e) => setPlateConfig({ labelTextCase: e.target.value as any })}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="original">Original (Como digitado)</option>
                <option value="uppercase">MAIÚSCULA</option>
                <option value="lowercase">minúscula</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Peso da Fonte (Rótulos)</label>
              <select
                value={plateConfig.labelFontWeight || 'regular'}
                onChange={(e) => setPlateConfig({ labelFontWeight: e.target.value as any })}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="regular">Normal</option>
                <option value="bold">Negrito</option>
              </select>
            </div>

            <SliderField label="Espessura das Linhas (mm)" value={plateConfig.lineThickness} min={0.5} max={5} step={0.1} onChange={(v) => setPlateConfig({ lineThickness: v })} />
            
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Cor da Placa</label>
              <div className="flex items-center gap-2">
                <input type="color" value={plateConfig.color} onChange={(e) => setPlateConfig({ color: e.target.value })} className="h-8 w-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                <span className="text-sm font-mono text-gray-300">{plateConfig.color}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center mb-3">Dica: Use o mouse para girar e dar zoom na placa 3D.</p>
        <button onClick={() => exportSTL()} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20">
          <Download size={20} /> Exportar STL
        </button>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
      />
    </div>
  );
}

function SliderField({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (val: number) => void }) {
  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-center">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wider group-hover:text-gray-300 transition-colors">{label}</label>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) onChange(val);
          }}
          className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-right text-white font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all hover:bg-gray-700"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-500 cursor-pointer"
      />
    </div>
  );
}
