import React from 'react';
import { EditorPanel } from './components/EditorPanel';
import { PlatePreview } from './components/PlatePreview';

class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white p-4">
          <div className="bg-red-900/50 p-6 rounded-lg border border-red-500 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4 text-red-200">Erro Crítico na Aplicação</h2>
            <pre className="bg-black/50 p-4 rounded overflow-auto text-sm text-red-100 whitespace-pre-wrap">
              {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-medium transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
        <div className="flex-1 relative">
          <PlatePreview />
        </div>
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col z-10 shadow-2xl">
          <EditorPanel />
        </div>
      </div>
    </GlobalErrorBoundary>
  );
}
