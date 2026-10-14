'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Terminal as TerminalIcon, ArrowLeft, RotateCw, Maximize2, 
  Minimize2, Trash2, Power, Shield, Wifi, Copy, CheckCircle,
  Activity, Server, Monitor
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TerminalLine {
  type: 'output' | 'input' | 'system' | 'error' | 'success';
  text: string;
}

export default function VPSConsolePage() {
  const params = useParams();
  const router = useRouter();
  const vpsId = (params?.id as string) || 'vps-1';

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [latency, setLatency] = useState(24);
  const [copied, setCopied] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', text: 'Connecting to NotixCloud KVM VNC WebSocket gateway...' },
    { type: 'system', text: 'Authentication successful. Handshake verified via TLS 1.3.' },
    { type: 'system', text: `Attached to serial console for instance [${vpsId} - web-prod-01]` },
    { type: 'output', text: '------------------------------------------------------------' },
    { type: 'output', text: 'Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-94-generic x86_64)' },
    { type: 'output', text: ' ' },
    { type: 'output', text: ' * Documentation:  https://help.ubuntu.com' },
    { type: 'output', text: ' * Management:     https://landscape.canonical.com' },
    { type: 'output', text: ' * Support:        https://ubuntu.com/advantage' },
    { type: 'output', text: ' ' },
    { type: 'output', text: ' System information as of Sun Oct 11 18:05:00 UTC 2026:' },
    { type: 'output', text: '  System load:   0.45               Processes:             112' },
    { type: 'output', text: '  Usage of /:    38.2% of 40.00GB   Users logged in:       1' },
    { type: 'output', text: '  Memory usage:  62% (2.48GB/4GB)   IPv4 address for eth0: 192.0.2.1' },
    { type: 'output', text: '  Swap usage:    0%                 IPv6 address:          2001:db8::1' },
    { type: 'output', text: ' ' },
    { type: 'success', text: ' * Enterprise DDoS mitigation: ACTIVE (Filter node US-E1)' },
    { type: 'success', text: ' * Automated daily backups: ENABLED (Next run 02:00 UTC)' },
    { type: 'output', text: '------------------------------------------------------------' },
    { type: 'output', text: 'Last login: Sun Oct 11 17:42:10 2026 from 103.21.244.2' },
  ]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    // Keep focus on terminal input
    inputRef.current?.focus();
    
    // Slight latency fluctuation simulation
    const interval = setInterval(() => {
      setLatency(Math.floor(20 + Math.random() * 8));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) {
      setLines(prev => [...prev, { type: 'input', text: 'root@web-prod-01:~# ' }]);
      return;
    }

    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setInputVal('');

    const newLines: TerminalLine[] = [
      { type: 'input', text: `root@web-prod-01:~# ${cmd}` }
    ];

    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd === 'clear') {
      setLines([]);
      return;
    } else if (lowerCmd === 'help') {
      newLines.push(
        { type: 'output', text: 'Available commands:' },
        { type: 'output', text: '  help           - Show this help message' },
        { type: 'output', text: '  uptime         - Show system uptime and load' },
        { type: 'output', text: '  free -m        - Display memory usage in megabytes' },
        { type: 'output', text: '  df -h          - Display disk space usage' },
        { type: 'output', text: '  uname -a       - Display operating system and kernel info' },
        { type: 'output', text: '  docker ps      - List running containers' },
        { type: 'output', text: '  ip a           - Show network interfaces and IP addresses' },
        { type: 'output', text: '  systemctl status - Show core service statuses' },
        { type: 'output', text: '  reboot         - Reboot server instance' },
        { type: 'output', text: '  clear          - Clear terminal output' }
      );
    } else if (lowerCmd === 'uptime') {
      newLines.push({
        type: 'output',
        text: ' 18:08:12 up 14 days,  6:22,  1 user,  load average: 0.42, 0.48, 0.45'
      });
    } else if (lowerCmd === 'free' || lowerCmd === 'free -m' || lowerCmd === 'free -h') {
      newLines.push(
        { type: 'output', text: '               total        used        free      shared  buff/cache   available' },
        { type: 'output', text: 'Mem:            4096        2480         820         128         796        1488' },
        { type: 'output', text: 'Swap:           2048           0        2048' }
      );
    } else if (lowerCmd.startsWith('df')) {
      newLines.push(
        { type: 'output', text: 'Filesystem      Size  Used Avail Use% Mounted on' },
        { type: 'output', text: '/dev/vda1        40G   16G   23G  41% /' },
        { type: 'output', text: 'udev            2.0G     0  2.0G   0% /dev' },
        { type: 'output', text: 'tmpfs           410M  1.4M  408M   1% /run' },
        { type: 'output', text: 'overlay          40G   16G   23G  41% /var/lib/docker/overlay2' }
      );
    } else if (lowerCmd === 'uname -a') {
      newLines.push({
        type: 'output',
        text: 'Linux web-prod-01 5.15.0-94-generic #104-Ubuntu SMP Wed Jan 10 13:42:30 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux'
      });
    } else if (lowerCmd.startsWith('docker ps')) {
      newLines.push(
        { type: 'output', text: 'CONTAINER ID   IMAGE          COMMAND                  CREATED        STATUS        PORTS                    NAMES' },
        { type: 'output', text: '8f72a1b9c02d   nginx:alpine   "/docker-entrypoint.…"   3 days ago     Up 3 days     0.0.0.0:80->80/tcp       web-proxy' },
        { type: 'output', text: '4a19b8e23f11   node:20-slim   "docker-entrypoint.s…"   3 days ago     Up 3 days     0.0.0.0:3000->3000/tcp   app-backend' },
        { type: 'output', text: '99c104e712a0   postgres:16    "docker-entrypoint.s…"   14 days ago    Up 14 days    127.0.0.1:5432->5432/tcp database' }
      );
    } else if (lowerCmd.startsWith('ip a') || lowerCmd === 'ifconfig') {
      newLines.push(
        { type: 'output', text: '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000' },
        { type: 'output', text: '    inet 127.0.0.1/8 scope host lo' },
        { type: 'output', text: '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000' },
        { type: 'output', text: '    inet 192.0.2.1/24 brd 192.0.2.255 scope global eth0' },
        { type: 'output', text: '    inet6 2001:db8::1/64 scope global dynamic' }
      );
    } else if (lowerCmd === 'reboot') {
      newLines.push(
        { type: 'system', text: 'Broadcast message from root@web-prod-01 (pts/0):' },
        { type: 'system', text: 'The system is going down for reboot NOW!' },
        { type: 'system', text: 'Connection closed by remote host.' }
      );
      setIsConnected(false);
      setTimeout(() => {
        setIsConnected(true);
        setLines(current => [
          ...current,
          { type: 'system', text: 'Reconnecting to KVM console...' },
          { type: 'success', text: 'System reboot complete. Kernel booted in 4.12s.' },
          { type: 'output', text: 'Ubuntu 22.04.3 LTS web-prod-01 tty1' },
          { type: 'output', text: ' ' }
        ]);
      }, 3500);
    } else {
      newLines.push({
        type: 'output',
        text: `bash: ${cmd}: command executed (PID: ${Math.floor(1000 + Math.random() * 9000)})`
      });
    }

    setLines(prev => [...prev, ...newLines]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < history.length) {
          setHistoryIndex(nextIndex);
          setInputVal(history[nextIndex]);
        } else {
          setHistoryIndex(-1);
          setInputVal('');
        }
      }
    }
  };

  const copyIp = () => {
    navigator.clipboard.writeText('192.0.2.1');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      'flex flex-col gap-4',
      isFullscreen && 'fixed inset-0 z-50 bg-black p-4'
    )}>
      {/* Console Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white">
            <Link href={`/dashboard/vps/${vpsId}`}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Instance Details
            </Link>
          </Button>

          <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center">
              <Server className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">web-prod-01</span>
                <span className="text-xs text-white/40 font-mono">({vpsId})</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>192.0.2.1</span>
                <button onClick={copyIp} className="hover:text-white transition-colors" title="Copy IP">
                  {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side connection badges and actions */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08]">
            <span className="relative flex h-2 w-2">
              <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', isConnected ? 'bg-emerald-400' : 'bg-rose-500')} />
              <span className={cn('relative inline-flex rounded-full h-2 w-2', isConnected ? 'bg-emerald-500' : 'bg-rose-500')} />
            </span>
            <span className="text-xs font-semibold text-white/70">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span className="text-xs text-white/30 font-mono">({latency}ms)</span>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLines([])}
            className="border-white/10 text-white/60 hover:text-white"
            title="Clear Terminal Output"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setIsConnected(false);
              setTimeout(() => {
                setIsConnected(true);
                setLines(prev => [...prev, { type: 'success', text: 'Reconnected to serial console socket.' }]);
              }, 1200);
            }}
            className="border-white/10 text-white/60 hover:text-white"
            title="Reconnect Console"
          >
            <RotateCw className="w-4 h-4" />
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="border-white/10 text-white/60 hover:text-white"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Terminal Main Window */}
      <div 
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'w-full bg-[#0a0a0c] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs sm:text-sm cursor-text',
          isFullscreen ? 'flex-1' : 'h-[640px]'
        )}
      >
        {/* Terminal Title Bar */}
        <div className="bg-[#121216] px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-white/40 text-xs ml-2 font-mono">root@web-prod-01: ~ (KVM Serial VNC)</span>
          </div>
          <div className="text-[11px] text-white/30 font-sans">
            Type <span className="text-red-400 font-mono font-bold">help</span> for commands
          </div>
        </div>

        {/* Scrollable output area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-1.5 leading-relaxed selection:bg-red-600/40">
          {lines.map((line, idx) => (
            <div 
              key={idx} 
              className={cn(
                'break-words whitespace-pre-wrap',
                line.type === 'system' && 'text-yellow-400/80 italic',
                line.type === 'error' && 'text-rose-400 font-bold',
                line.type === 'success' && 'text-emerald-400',
                line.type === 'input' && 'text-cyan-400 font-bold',
                line.type === 'output' && 'text-white/80'
              )}
            >
              {line.text}
            </div>
          ))}

          {/* Prompt line */}
          {isConnected && (
            <form onSubmit={handleCommand} className="flex items-center gap-2 pt-1">
              <span className="text-red-500 font-bold flex-shrink-0 select-none">root@web-prod-01:~#</span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-white font-mono p-0 focus:ring-0 focus:outline-none"
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </form>
          )}

          <div ref={terminalEndRef} />
        </div>

        {/* Bottom Quick Command Bar */}
        <div className="bg-[#121216] px-4 py-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-white/40 select-none overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-white/30 text-[11px]">Quick Commands:</span>
            {[
              { label: 'Uptime', cmd: 'uptime' },
              { label: 'Memory', cmd: 'free -m' },
              { label: 'Disk', cmd: 'df -h' },
              { label: 'Docker', cmd: 'docker ps' },
              { label: 'IP Info', cmd: 'ip a' },
              { label: 'Clear', cmd: 'clear' },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setInputVal(item.cmd);
                  inputRef.current?.focus();
                }}
                className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/10 text-white/60 hover:text-white transition-colors text-[11px]"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-white/30 hidden sm:block">
            UTF-8 | 80x24 | xterm-256color
          </div>
        </div>
      </div>
    </div>
  );
}
