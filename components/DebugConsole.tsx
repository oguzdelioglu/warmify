import React, { useEffect, useRef } from 'react';
import { LogMessage } from '../types';
import { Play, Crosshair, RefreshCw } from 'lucide-react';

interface DebugConsoleProps {
  logs: LogMessage[];
  onHitTest: () => void;
  onMissTest: () => void;
  onToggleAutoSim: () => void;
  isAutoSim: boolean;
}

const DebugConsole: React.FC<DebugConsoleProps> = ({ logs, onHitTest, onMissTest, onToggleAutoSim, isAutoSim }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="absolute top-16 left-4 right-4 z-50 flex flex-col pointer-events-auto">
      {/* LOG CONSOLE */}
      <div className="h-32 bg-black/80 backdrop-blur-md rounded-t-xl border border-emerald-500/30 overflow-hidden flex flex-col font-mono text-[10px]">
        <div className="bg-emerald-900/30 px-2 py-1 text-emerald-400 font-bold flex justify-between border-b border-emerald-500/20">
          <span>SYSTEM LOGS</span>
          <span>{logs.length} events</span>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 scroll-smooth">
          {logs.length === 0 && <span className="text-slate-500 italic">Waiting for events...</span>}
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2">
              <span className="text-slate-500 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}
              </span>
              <span className={`break-all ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
              }`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SIMULATION CONTROLS (Attached Bottom) */}
      <div className="bg-slate-900/90 border-x border-b border-slate-700 rounded-b-xl p-2 flex items-center justify-between gap-2 shadow-xl backdrop-blur-md">
         <div className="text-[9px] font-bold text-slate-400 uppercase">Input Sim:</div>
         
         <div className="flex gap-2 flex-1">
             <button 
                onClick={onToggleAutoSim}
                className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-[10px] font-bold transition-all ${isAutoSim ? 'bg-green-500 text-black animate-pulse' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
             >
                 <RefreshCw size={10} className={isAutoSim ? 'animate-spin' : ''} />
                 {isAutoSim ? 'AUTO-PLAY' : 'AUTO-SIM'}
             </button>

             <button onClick={onHitTest} className="px-3 py-1 bg-blue-600/80 hover:bg-blue-500 text-blue-100 rounded text-[10px] font-bold border border-blue-500/50">
                HIT
             </button>
             
             <button onClick={onMissTest} className="px-3 py-1 bg-red-600/80 hover:bg-red-500 text-red-100 rounded text-[10px] font-bold border border-red-500/50">
                MISS
             </button>
         </div>
      </div>
    </div>
  );
};

export default DebugConsole;