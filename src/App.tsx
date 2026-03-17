import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, Terminal, Cpu, 
  RotateCcw, Trash2, Box, Settings, Search, Send, MessageSquare,
  CheckCircle2, CircleDashed, Circle, FileCode2, Server, PlayCircle, Loader2, ChevronRight,
  Image as ImageIcon, Video, Play, Pause, AlertTriangle, Info, Globe
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Generate 100s of Mock Projects ---
const generateProjects = () => {
  const statuses = ['ACTIVE', 'STALE', 'PAUSED', 'ARCHIVED'];
  const types = ['node', 'python', 'go', 'rust', 'db'];
  const projects = [];
  
  for (let i = 1; i <= 250; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isActive = status === 'ACTIVE';
    const numServices = Math.floor(Math.random() * 4) + 1;
    const services = Array.from({ length: numServices }).map((_, j) => ({
      id: `s${i}-${j}`,
      name: `Service ${j + 1}`,
      port: 3000 + Math.floor(Math.random() * 6000),
      type: types[Math.floor(Math.random() * types.length)],
      active: isActive ? Math.random() > 0.2 : false
    }));

    projects.push({
      id: `p${i}`,
      name: `PROJECT_${i.toString().padStart(3, '0')}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      status,
      cpu: isActive ? Math.floor(Math.random() * 100) : 0,
      gpu: isActive ? Math.floor(Math.random() * 100) : 0,
      ram: isActive ? Math.floor(Math.random() * 100) : 0,
      services
    });
  }
  
  projects[0] = { 
    id: 'p_demo1', name: 'OUTERSENSE_V2', status: 'ACTIVE', cpu: 42, gpu: 88, ram: 64,
    services: [
      { id: 's_d1', name: 'Vite Frontend', port: 5173, type: 'node', active: true },
      { id: 's_d2', name: 'Python API', port: 8080, type: 'python', active: true },
      { id: 's_d3', name: 'Postgres DB', port: 5432, type: 'db', active: false },
    ]
  };
  projects[1] = { 
    id: 'p_demo2', name: 'WALLSENSE', status: 'STALE', cpu: 0, gpu: 0, ram: 12,
    services: [
      { id: 's_d4', name: 'Next.js App', port: 3000, type: 'node', active: false },
      { id: 's_d5', name: 'Redis Cache', port: 6379, type: 'db', active: false },
    ]
  };

  return projects;
};

const INITIAL_PROJECTS = generateProjects();

type FeedItem = {
  id: string;
  time: string;
  role: 'system' | 'agent' | 'user';
  source: string;
  content: string;
  target?: string;
  project: string;
  uiType?: 'text' | 'command' | 'timeline' | 'code_nav' | 'process' | 'media';
  uiData?: {
    cmd?: string;
    output?: string[];
    status?: 'running' | 'success' | 'error' | 'online' | 'offline';
    steps?: { label: string; status: 'done' | 'active' | 'pending' }[];
    path?: string;
    lines?: number;
    action?: 'reading' | 'editing' | 'creating';
    pid?: number;
    name?: string;
    port?: number;
    // Media specific
    url?: string;
    mediaType?: 'image' | 'video' | 'gif';
    caption?: string;
    explanation?: string;
    analysisPoints?: { time: number; label: string }[];
  };
};

const INITIAL_FEED: FeedItem[] = [
  { 
    id: 'f1', time: '10:42:01', role: 'agent', source: '[AGENT:COPILOT]', content: 'Analyzing workspace structure...', project: 'p_demo1',
    uiType: 'timeline',
    uiData: {
      steps: [
        { label: 'Scan project root', status: 'done' },
        { label: 'Parse tsconfig.json', status: 'done' },
        { label: 'Map dependency graph', status: 'active' },
        { label: 'Identify stale modules', status: 'pending' }
      ]
    }
  },
  { 
    id: 'f2', time: '10:45:22', role: 'system', source: '[SYS:ORCHESTRATOR]', content: 'Executing spawn sequence', project: 'p_demo1',
    uiType: 'process',
    uiData: { name: 'python_api_worker', pid: 18432, port: 8080, status: 'online' }
  },
  { 
    id: 'f2_5', time: '10:50:00', role: 'agent', source: '[AGENT:JARVIS]', content: 'Detected memory leak in Redis Cache. Attempting graceful restart.', project: 'p_demo2',
  },
  { 
    id: 'f3', time: '11:15:00', role: 'agent', source: '[AGENT:CODEX]', content: 'Running database migrations', project: 'p_demo1',
    uiType: 'command',
    uiData: { cmd: 'npx prisma migrate dev --name init', output: ['Environment variables loaded', 'Applying migration 20260316_init', 'Success: Database synchronized'], status: 'success' }
  },
  {
    id: 'f4', time: '11:30:15', role: 'agent', source: '[AGENT:VISION]', content: 'Automated E2E test failed. Visual regression detected in the checkout flow.', project: 'p_demo1',
    uiType: 'media',
    uiData: {
      mediaType: 'video',
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', // Safe placeholder video
      caption: 'E2E_TEST_RECORDING.mp4',
      explanation: 'At 0:02, the primary CTA button shifts out of the viewport due to a negative margin applied in the recent CSS refactor. This prevents user progression. I recommend reverting the margin-top utility class on the .checkout-container.',
      analysisPoints: [{ time: 2, label: 'Layout Shift Detected' }]
    }
  },
  {
    id: 'f5', time: '11:35:00', role: 'agent', source: '[AGENT:UX]', content: 'Generated a proposed fix for the layout shift. See the annotated screenshot below.', project: 'p_demo1',
    uiType: 'media',
    uiData: {
      mediaType: 'image',
      url: 'https://picsum.photos/seed/dashboard/800/450?blur=2',
      caption: 'PROPOSED_LAYOUT_FIX.png',
      explanation: 'The bounding boxes highlight the corrected flex containers. By switching from absolute positioning to a flex-column layout with gap-4, the CTA remains sticky at the bottom of the viewport without overlapping the content.'
    }
  },
  { id: 'f6', time: '12:05:12', role: 'agent', source: '[AGENT:JARVIS]', content: 'I have analyzed the current workspace. CPU load is nominal, but GPU VRAM is nearing capacity on OUTERSENSE_V2. Would you like me to suspend background physics simulations?', project: 'all' },
];

const ORPHAN_PROCESSES = [
  { pid: 9432, name: 'node (zombie)', port: 3000, project: 'p_demo2' },
  { pid: 1120, name: 'python (stale)', port: 8000, project: 'p_demo3' },
];

// --- Media Payload Component ---
const MediaPayload = ({ data }: { data: NonNullable<FeedItem['uiData']> }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current && duration) {
      const newTime = (val / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(val);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-3 bg-[#0a0a0a] border border-[#4a4a4a] rounded-lg overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] w-full max-w-[95%]">
      {/* Header */}
      <div className="bg-[#1a1a1a] px-3 py-2 border-b border-[#4a4a4a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {data.mediaType === 'video' ? <Video className="w-3.5 h-3.5 text-[#3a86ff]" /> : <ImageIcon className="w-3.5 h-3.5 text-[#00d1b2]" />}
          <span className="text-[10px] font-mono text-[#e8e6e1] font-bold tracking-wide">{data.caption}</span>
        </div>
        <span className="text-[9px] font-mono text-[#8a8882] uppercase tracking-widest">{data.mediaType}</span>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {/* Media Player / Viewer */}
        <div className="relative rounded bg-black overflow-hidden border border-white/10 aspect-video flex items-center justify-center group">
          {data.mediaType === 'video' ? (
            <>
              <video 
                ref={videoRef}
                src={data.url} 
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                crossOrigin="anonymous"
              />
              {/* Custom Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                
                {/* Scrubber */}
                <div className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer group/scrubber">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress || 0}
                    onChange={handleScrub}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#3a86ff] rounded-full pointer-events-none"
                    style={{ width: `${progress}%` }}
                  />
                  {/* Analysis Markers */}
                  {data.analysisPoints?.map((point, idx) => {
                    const leftPos = (point.time / duration) * 100;
                    return (
                      <div 
                        key={idx}
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[#e64300] rounded-full shadow-[0_0_4px_#e64300] z-10 pointer-events-none"
                        style={{ left: `${leftPos}%`, transform: 'translate(-50%, -50%)' }}
                      />
                    );
                  })}
                </div>

                {/* Play/Time */}
                <div className="flex items-center justify-between">
                  <button onClick={togglePlay} className="text-white hover:text-[#3a86ff] transition-colors">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <span className="text-[10px] font-mono text-white/80">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="relative w-full h-full">
              <img src={data.url} alt={data.caption} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {/* Simulated Image Analysis Overlay */}
              <div className="absolute inset-0 border-2 border-[#00d1b2]/30 m-4 rounded pointer-events-none flex items-start justify-end p-2">
                <div className="bg-[#00d1b2] text-black text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shadow-sm">
                  FLEX_CONTAINER_FIX
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interpretability Explanation */}
        <div className="bg-[#1a1a1a] p-3 rounded border border-[#4a4a4a]/50 border-l-2 border-l-[#e64300] flex gap-3 items-start">
          <Info className="w-4 h-4 text-[#e64300] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold font-mono text-[#e8e6e1] uppercase tracking-wider">Agent Analysis</span>
            <span className="text-xs font-mono text-[#a3a19a] leading-relaxed">
              {data.explanation}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState(INITIAL_PROJECTS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [orphans, setOrphans] = useState(ORPHAN_PROCESSES);
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED);
  const [chatInput, setChatInput] = useState('');
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  
  const feedEndRef = useRef<HTMLDivElement>(null);

  const activeProject = projects.find(p => p.id === activeProjectId)!;

  const filteredProjects = useMemo(() => {
    return projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [projects, searchQuery]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed]);

  // Audio context for the mechanical click/chime
  const playClick = (freq = 800, type: OscillatorType = 'sine') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq / 2, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const addFeedItem = (
    role: 'system' | 'agent' | 'user', 
    source: string, 
    content: string, 
    target?: string,
    uiType?: FeedItem['uiType'],
    uiData?: FeedItem['uiData'],
    projectId: string = 'all'
  ) => {
    setFeed(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      role,
      source,
      content,
      target,
      project: projectId,
      uiType,
      uiData
    }]);
  };

  const handleRestore = () => {
    playClick(1200, 'square');
    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
      addFeedItem('system', '[SYS:CONTROL]', 'Restored session environment', activeProject.name, undefined, undefined, activeProject.id);
    }, 1500);
  };

  const handlePurge = () => {
    playClick(400, 'sawtooth');
    setOrphans([]);
    addFeedItem('system', '[SYS:CONTROL]', 'Purged orphaned processes', 'GLOBAL', undefined, undefined, 'all');
  };

  const toggleService = (serviceId: string) => {
    playClick(600, 'triangle');
    setProjects(prev => prev.map(p => {
      if (p.id !== activeProjectId) return p;
      return {
        ...p,
        services: p.services.map(s => s.id === serviceId ? { ...s, active: !s.active } : s)
      };
    }));
    
    const service = activeProject.services.find(s => s.id === serviceId);
    if (service) {
      addFeedItem('system', '[SYS:CONTROL]', `${service.active ? 'Stopped' : 'Started'} service`, service.name, undefined, undefined, activeProject.id);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    playClick(900, 'square');
    const userMsg = chatInput.trim();
    addFeedItem('user', '[USER:CMD]', userMsg, undefined, undefined, undefined, 'all');
    setChatInput('');

    // Simulate Agent Response Sequence (Async across projects)
    setTimeout(() => {
      playClick(1000, 'sine');
      addFeedItem('agent', '[AGENT:JARVIS]', `Acknowledged. Executing request globally: "${userMsg}"`, undefined, 'timeline', {
        steps: [
          { label: 'Analyze request intent', status: 'done' },
          { label: 'Compile execution graph', status: 'active' },
          { label: 'Provision resources', status: 'pending' }
        ]
      }, 'all');
      
      setTimeout(() => {
        playClick(1050, 'sine');
        setFeed(prev => {
          const newFeed = [...prev];
          const lastItem = newFeed[newFeed.length - 1];
          if (lastItem && lastItem.uiType === 'timeline' && lastItem.uiData?.steps) {
            lastItem.uiData.steps[1].status = 'done';
            lastItem.uiData.steps[2].status = 'active';
          }
          return newFeed;
        });

        setTimeout(() => {
          playClick(1100, 'sine');
          // Assign the resulting task to the active project to show async interleaving
          addFeedItem('system', '[SYS:ORCHESTRATOR]', 'Running background task', undefined, 'command', {
            cmd: 'npm run build:physics',
            output: ['> physics-engine@1.0.0 build', '> tsc --project tsconfig.physics.json', 'Done in 1.2s'],
            status: 'success'
          }, activeProjectId); 
        }, 1500);
      }, 1500);
    }, 600);
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-[1600px] hw-body rounded-[2.5rem] p-6 md:p-10 flex flex-col gap-8 h-[90vh]">
        
        {/* Global Header */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.8)] border border-[#4a4a4a]">
              <Activity className="w-6 h-6 text-[#00d1b2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tighter text-[#1a1a1a] leading-none mb-1">GRAPH_OS</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#8a8882] uppercase">Developer Control Plane</span>
            </div>
          </div>
          
          {/* Global LCD */}
          <div className="lcd-screen rounded-xl px-6 py-3 flex items-center gap-6 md:gap-8 border-2 border-[#8a8882]/20 w-full md:w-auto overflow-x-auto">
             <div className="flex flex-col min-w-fit">
               <span className="text-[9px] font-bold tracking-widest text-[#1a2421]/60 uppercase mb-0.5">Sys Uptime</span>
               <span className="lcd-text text-sm font-bold">{time}</span>
             </div>
             <div className="w-px h-8 bg-[#1a2421]/20 shrink-0" />
             <div className="flex flex-col min-w-fit">
               <span className="text-[9px] font-bold tracking-widest text-[#1a2421]/60 uppercase mb-0.5">Active Agents</span>
               <span className="lcd-text text-sm font-bold">JARVIS, COPILOT</span>
             </div>
             <div className="w-px h-8 bg-[#1a2421]/20 shrink-0" />
             <div className="flex flex-col min-w-fit">
               <span className="text-[9px] font-bold tracking-widest text-[#1a2421]/60 uppercase mb-0.5">Sys Mem</span>
               <span className="lcd-text text-sm font-bold">32GB / 64GB</span>
             </div>
          </div>
        </div>

        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1 min-h-0">
          
          {/* Col 1: Context (Projects) */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
            <div className="flex items-center justify-between border-b-2 border-[#d1cfc8] pb-2 shrink-0">
              <h3 className="text-[10px] font-bold tracking-widest text-[#8a8882] uppercase">Context Selection ({filteredProjects.length})</h3>
              <Box className="w-4 h-4 text-[#8a8882]" />
            </div>

            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a2421]/50" />
              <input 
                type="text"
                placeholder="FILTER PROJECTS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hw-input w-full h-10 pl-10 pr-4 rounded-lg text-xs uppercase tracking-wider"
              />
            </div>
            
            <div className="flex flex-col gap-3 overflow-y-auto hw-scrollbar pr-2 flex-1">
              {filteredProjects.map(p => (
                <button 
                  key={p.id}
                  onClick={() => {
                    playClick(1000, 'triangle');
                    setActiveProjectId(p.id);
                  }}
                  className={cn(
                    "text-left p-4 rounded-xl border-2 transition-all relative overflow-hidden group shrink-0",
                    activeProjectId === p.id 
                      ? "border-[#e64300] bg-[#e64300]/5 shadow-sm" 
                      : "border-[#d1cfc8] hover:border-[#a3a19a] bg-[#e8e6e1]"
                  )}
                >
                  {activeProjectId === p.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#e64300]" />
                  )}
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn("font-bold text-sm tracking-tight truncate pr-2", activeProjectId === p.id ? "text-[#1a1a1a]" : "text-[#4a4a4a] group-hover:text-[#1a1a1a]")}>
                      {p.name}
                    </span>
                    <div className={cn("w-2 h-2 rounded-full shrink-0", 
                      p.status === 'ACTIVE' ? "bg-[#00d1b2] shadow-[0_0_8px_#00d1b2]" : 
                      p.status === 'STALE' ? "bg-[#e74c3c]" :
                      "bg-[#a3a19a]"
                    )} />
                  </div>
                  <div className="text-[10px] font-mono text-[#8a8882]">{p.status}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Col 2: Orchestration */}
          <div className="lg:col-span-4 flex flex-col gap-6 bg-[#d1cfc8]/30 p-6 rounded-2xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] border border-[#d1cfc8] h-full min-h-0">
            <div className="flex items-center justify-between border-b-2 border-[#d1cfc8] pb-2 shrink-0">
              <h3 className="text-[10px] font-bold tracking-widest text-[#8a8882] uppercase">Orchestration</h3>
              <Settings className="w-4 h-4 text-[#8a8882]" />
            </div>

            <div className="grid grid-cols-3 gap-4 shrink-0">
               <div className="bg-[#e8e6e1] p-3 rounded-xl shadow-sm border border-white/50 flex flex-col items-center gap-2">
                 <span className="text-[9px] font-bold tracking-widest text-[#8a8882] uppercase">CPU Load</span>
                 <span className="font-mono text-xl font-bold text-[#1a1a1a]">{activeProject.cpu}%</span>
               </div>
               <div className="bg-[#e8e6e1] p-3 rounded-xl shadow-sm border border-white/50 flex flex-col items-center gap-2">
                 <span className="text-[9px] font-bold tracking-widest text-[#8a8882] uppercase">GPU VRAM</span>
                 <span className="font-mono text-xl font-bold text-[#1a1a1a]">{activeProject.gpu}%</span>
               </div>
               <div className="bg-[#e8e6e1] p-3 rounded-xl shadow-sm border border-white/50 flex flex-col items-center gap-2">
                 <span className="text-[9px] font-bold tracking-widest text-[#8a8882] uppercase">Sys RAM</span>
                 <span className="font-mono text-xl font-bold text-[#1a1a1a]">{activeProject.ram}%</span>
               </div>
            </div>

            <div className="flex flex-col gap-3 mt-2 flex-1 min-h-0">
              <span className="text-[10px] font-bold tracking-widest text-[#8a8882] uppercase shrink-0">Active Services</span>
              <div className="overflow-y-auto hw-scrollbar pr-2 flex flex-col gap-3 h-full">
                {activeProject.services.map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-[#e8e6e1] p-4 rounded-xl shadow-sm border border-white/50 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", s.active ? "bg-[#00d1b2] shadow-[0_0_8px_#00d1b2]" : "bg-[#a3a19a] shadow-inner")} />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#1a1a1a] tracking-tight">{s.name}</span>
                        <span className="font-mono text-[10px] text-[#8a8882]">PORT:{s.port}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleService(s.id)}
                      className={cn("hw-toggle w-12 h-6 rounded-full p-1", s.active && "active")}
                    >
                      <div className={cn("hw-toggle-knob w-4 h-4 rounded-full", s.active ? "translate-x-6" : "translate-x-0")} />
                    </button>
                  </div>
                ))}
                {activeProject.services.length === 0 && (
                  <div className="flex items-center justify-center h-full text-[#8a8882] text-sm font-mono">
                    NO SERVICES BOUND
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-4 shrink-0">
              <button 
                onClick={handleRestore} 
                disabled={isRestoring}
                className="hw-btn hw-btn-secondary flex-1 h-12 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <RotateCcw className={cn("w-4 h-4", isRestoring && "animate-spin")} />
                <span className="text-[10px] font-bold tracking-widest uppercase">{isRestoring ? 'Restoring...' : 'Restore Env'}</span>
              </button>
              <button 
                onClick={handlePurge} 
                disabled={orphans.length === 0}
                className="hw-btn hw-btn-primary flex-1 h-12 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Purge Orphans</span>
              </button>
            </div>
          </div>

          {/* Col 3: Global Agent Command Link */}
          <div className="lg:col-span-5 flex flex-col gap-4 h-full min-h-0">
            <div className="flex items-center justify-between border-b-2 border-[#d1cfc8] pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[10px] font-bold tracking-widest text-[#8a8882] uppercase">Workspace Agent (Global)</h3>
                <Globe className="w-3 h-3 text-[#00d1b2]" />
              </div>
              <MessageSquare className="w-4 h-4 text-[#8a8882]" />
            </div>

            <div className="flex-1 bg-[#1a1a1a] rounded-2xl p-5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] border-4 border-[#d1cfc8] overflow-hidden flex flex-col relative min-h-0">
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20 z-10" />
              
              <div className="flex-1 overflow-y-auto hw-scrollbar-dark pr-2 flex flex-col gap-4 relative z-20 mb-4">
                {/* Global Feed - No longer filtered by active project */}
                {feed.map((item) => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "flex flex-col gap-1 pb-3 shrink-0 border-b border-white/5 last:border-0",
                      item.role === 'user' ? "items-end text-right" : "items-start text-left"
                    )}
                  >
                    <div className={cn("flex items-center gap-2", item.role === 'user' && "flex-row-reverse")}>
                      <span className="font-mono text-[10px] text-[#8a8882]">{item.time}</span>
                      <span className={cn(
                        "font-mono text-[10px] font-bold", 
                        item.role === 'agent' ? "text-[#00d1b2]" : 
                        item.role === 'user' ? "text-[#3a86ff]" : 
                        "text-[#e64300]"
                      )}>
                        {item.source}
                      </span>
                      {/* Project Badge for Global Context */}
                      {item.project !== 'all' && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-[#a3a19a] border border-white/10">
                          {projects.find(p => p.id === item.project)?.name || item.project}
                        </span>
                      )}
                    </div>
                    
                    <div className={cn(
                      "font-mono text-xs leading-relaxed mt-1 max-w-[90%]",
                      item.role === 'user' ? "text-[#e8e6e1] bg-[#3a86ff]/20 px-3 py-2 rounded-lg border border-[#3a86ff]/30" : 
                      item.role === 'agent' ? "text-[#00d1b2] bg-[#00d1b2]/10 px-3 py-2 rounded-lg border border-[#00d1b2]/20" :
                      "text-[#a3a19a]"
                    )}>
                      {item.content}
                    </div>

                    {/* Rich UI Payloads */}
                    {item.uiType === 'media' && item.uiData && (
                      <MediaPayload data={item.uiData} />
                    )}

                    {item.uiType === 'timeline' && item.uiData?.steps && (
                      <div className="mt-3 bg-[#0a0a0a] border border-[#00d1b2]/30 rounded-lg p-3 flex flex-col gap-2.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] w-full max-w-[95%]">
                        {item.uiData.steps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            {step.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00d1b2]" /> :
                             step.status === 'active' ? <Loader2 className="w-3.5 h-3.5 text-[#e64300] animate-spin" /> :
                             <CircleDashed className="w-3.5 h-3.5 text-[#4a4a4a]" />}
                            <span className={cn("text-[10px] font-mono tracking-wide", 
                              step.status === 'done' ? "text-[#8a8882]" :
                              step.status === 'active' ? "text-[#e8e6e1] font-bold" :
                              "text-[#4a4a4a]"
                            )}>{step.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.uiType === 'code_nav' && item.uiData && (
                      <div className="mt-3 bg-[#0a0a0a] border border-[#00d1b2]/30 rounded-lg p-3 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] w-full max-w-[95%]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#00d1b2]/10 flex items-center justify-center border border-[#00d1b2]/20">
                            <FileCode2 className="w-4 h-4 text-[#00d1b2]" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-mono text-[#e8e6e1] tracking-tight">{item.uiData.path}</span>
                            <span className="text-[9px] font-mono text-[#8a8882]">{item.uiData.lines} lines</span>
                          </div>
                        </div>
                        <div className="px-2 py-1 rounded bg-[#00d1b2]/10 border border-[#00d1b2]/20 text-[9px] font-bold text-[#00d1b2] uppercase tracking-wider">
                          {item.uiData.action}
                        </div>
                      </div>
                    )}

                    {item.uiType === 'command' && item.uiData && (
                      <div className="mt-3 bg-[#0a0a0a] border border-[#4a4a4a] rounded-lg overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] w-full max-w-[95%]">
                        <div className="bg-[#1a1a1a] px-3 py-2 border-b border-[#4a4a4a] flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-[#e64300]" />
                          <span className="text-[10px] font-mono text-[#e8e6e1] font-bold tracking-wide">{item.uiData.cmd}</span>
                        </div>
                        <div className="p-3 flex flex-col gap-1.5 text-left">
                          {item.uiData.output?.map((line, idx) => (
                            <span key={idx} className="text-[10px] font-mono text-[#8a8882]">{line}</span>
                          ))}
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                            {item.uiData.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00d1b2]" /> :
                             item.uiData.status === 'running' ? <Loader2 className="w-3.5 h-3.5 text-[#e64300] animate-spin" /> :
                             <Circle className="w-3.5 h-3.5 text-[#e74c3c]" />}
                            <span className={cn("text-[9px] font-mono font-bold uppercase tracking-widest",
                              item.uiData.status === 'success' ? "text-[#00d1b2]" :
                              item.uiData.status === 'running' ? "text-[#e64300]" :
                              "text-[#e74c3c]"
                            )}>
                              Process {item.uiData.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.uiType === 'process' && item.uiData && (
                      <div className="mt-3 bg-[#0a0a0a] border border-[#4a4a4a] rounded-lg p-3 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] w-full max-w-[95%]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#e64300]/10 flex items-center justify-center border border-[#e64300]/20">
                            <Server className="w-4 h-4 text-[#e64300]" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-mono text-[#e8e6e1] tracking-tight">{item.uiData.name}</span>
                            <span className="text-[9px] font-mono text-[#8a8882]">PID: {item.uiData.pid}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-mono text-[#00d1b2] font-bold">PORT:{item.uiData.port}</span>
                          <span className="text-[9px] font-mono text-[#8a8882] uppercase">{item.uiData.status}</span>
                        </div>
                      </div>
                    )}

                    {item.target && !item.uiType && (
                      <span className="font-mono text-[10px] text-[#8a8882] mt-0.5">↳ {item.target}</span>
                    )}
                  </div>
                ))}
                <div ref={feedEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="relative z-20 shrink-0 mt-auto">
                <div className="relative flex items-center">
                  <Terminal className="absolute left-3 w-4 h-4 text-[#00d1b2]/70" />
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="COMMAND WORKSPACE AGENT..."
                    className="w-full bg-[#0a0a0a] border border-[#4a4a4a] focus:border-[#00d1b2] text-[#e8e6e1] font-mono text-xs rounded-xl py-3 pl-10 pr-12 outline-none transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-[#4a4a4a]"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="absolute right-2 p-1.5 text-[#00d1b2] hover:bg-[#00d1b2]/20 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
