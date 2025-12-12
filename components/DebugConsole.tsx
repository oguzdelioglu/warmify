import React, { useEffect, useRef } from 'react';
import { LogMessage } from '../types';
import { Play, Crosshair, RefreshCw } from 'lucide-react';

interface DebugConsoleProps {
  logs: LogMessage[];
  onHitTest: () => void;
  onMissTest: () => void;
  onToggleAutoSim: () => void;
  isAutoSim: boolean;
  onForceNextExercise: () => void;
  onForcePrevExercise: () => void;
  onAddXP: () => void;
  currentExerciseIndex: number;
  accumulatedError: number;
  toggleSeatedMode: () => void;
  isSeated: boolean;
  exerciseName: string;
}

const DebugConsole: React.FC<DebugConsoleProps> = ({
  logs, onHitTest, onMissTest, onToggleAutoSim, isAutoSim,
  onForceNextExercise, onForcePrevExercise, onAddXP,
  currentExerciseIndex, accumulatedError, toggleSeatedMode, isSeated, exerciseName
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="absolute top-16 left-4 right-4 z-50 flex flex-col pointer-events-auto">
      {/* LOG CONSOLE */}
      <div className="h-24 bg-black/80 backdrop-blur-md rounded-t-xl border border-emerald-500/30 overflow-hidden flex flex-col font-mono text-[10px]">
        <div className="bg-emerald-900/30 px-2 py-1 text-emerald-400 font-bold flex justify-between border-b border-emerald-500/20">
          <span>LOGS ({logs.length})</span>
          <span className={accumulatedError > 0 ? "text-red-400" : "text-green-500"}>ErrAcc: {accumulatedError}</span>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 scroll-smooth">
          {logs.length === 0 && <span className="text-slate-500 italic">Waiting for events...</span>}
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2">
              <span className="text-slate-500 flex-shrink-0">
                {new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}
              </span>
              <span className={`break-all ${log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                }`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DEBUG CONTROLS */}
      <div className="bg-slate-900/95 border-x border-b border-slate-700 rounded-b-xl p-2 flex flex-col gap-2 shadow-xl backdrop-blur-md">

        {/* Row 1: Exercise Navigation */}
        <div className="flex items-center justify-between gap-2 bg-slate-800/50 p-1.5 rounded">
          <button onClick={onForcePrevExercise} className="text-slate-300 hover:text-white p-1">&lt;</button>
          <div className="text-[10px] font-bold text-cyan-400 text-center flex-1 truncate">
            #{currentExerciseIndex + 1}: {exerciseName}
          </div>
          <button onClick={onForceNextExercise} className="text-slate-300 hover:text-white p-1">&gt;</button>
        </div>

        {/* Row 2: Sim Controls */}
        <div className="flex gap-1.5">
          <button
            onClick={onToggleAutoSim}
            className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-[9px] font-bold transition-all ${isAutoSim ? 'bg-green-500 text-black animate-pulse' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
          >
            <RefreshCw size={8} className={isAutoSim ? 'animate-spin' : ''} />
            {isAutoSim ? 'AUTO' : 'SIM'}
          </button>

          <button onClick={onHitTest} className="flex-1 px-2 py-1 bg-blue-600/80 hover:bg-blue-500 text-blue-100 rounded text-[9px] font-bold border border-blue-500/50">
            HIT
          </button>

          <button onClick={onMissTest} className="flex-1 px-2 py-1 bg-red-600/80 hover:bg-red-500 text-red-100 rounded text-[9px] font-bold border border-red-500/50">
            MISS
          </button>
        </div>

        {/* Row 3: Utility */}
        <div className="flex gap-1.5">
          <button onClick={onAddXP} className="flex-1 py-1 bg-purple-600/50 hover:bg-purple-500 text-purple-100 rounded text-[9px] font-bold border border-purple-500/50">
            +100 XP
          </button>
          <button onClick={toggleSeatedMode} className={`flex-1 py-1 rounded text-[9px] font-bold border ${isSeated ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
            {isSeated ? 'SEATED' : 'STAND'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugConsole;