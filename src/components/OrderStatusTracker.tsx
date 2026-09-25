import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Loader2, 
  KeyRound, 
  Server, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Play, 
  RefreshCw, 
  Terminal, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Order, FulfillmentStatus } from '../types';

interface OrderStatusTrackerProps {
  order: Order;
  onStatusChange?: (orderId: string, newStatus: FulfillmentStatus) => void;
}

interface StepInfo {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
}

const STEPS: StepInfo[] = [
  {
    id: 'payment_verified',
    label: 'Payment Verified',
    desc: 'Escrow lock confirmed via payment rail',
    icon: CheckCircle2,
  },
  {
    id: 'key_generation',
    label: 'Cryptographic Key Signing',
    desc: 'ECDSA license pair generated & account bound',
    icon: KeyRound,
  },
  {
    id: 'cdn_provisioning',
    label: 'Edge CDN Replication',
    desc: 'Encrypted asset mirrored to 42 global edge points',
    icon: Server,
  },
  {
    id: 'delivered',
    label: 'Vault Ready & Delivered',
    desc: 'Available for instantaneous local activation',
    icon: ShieldCheck,
  },
];

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  order,
  onStatusChange,
}) => {
  // Current status, defaulting to order.fulfillmentStatus or 'delivered'
  const [status, setStatus] = useState<FulfillmentStatus>(order.fulfillmentStatus || 'delivered');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(
    status === 'delivered' ? 100 : status === 'processing' ? 50 : 15
  );
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; text: string; type: 'info' | 'success' | 'warning' }>>([]);
  const simulationTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Initialize or sync status from order
  useEffect(() => {
    if (order.fulfillmentStatus && order.fulfillmentStatus !== status && !isSimulating) {
      setStatus(order.fulfillmentStatus);
      setSimulationProgress(
        order.fulfillmentStatus === 'delivered' ? 100 : order.fulfillmentStatus === 'processing' ? 55 : 15
      );
    }
  }, [order.fulfillmentStatus]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      simulationTimerRef.current.forEach(clearTimeout);
    };
  }, []);

  // Update initial logs based on current status
  useEffect(() => {
    const now = new Date(order.date || Date.now());
    const initialLogs: Array<{ id: string; time: string; text: string; type: 'info' | 'success' | 'warning' }> = [];
    
    initialLogs.push({
      id: '1',
      time: new Date(now.getTime() - 20000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: `Gateway payment confirmed via ${order.paymentMethod.toUpperCase()} (Ref: ${order.transactionRef})`,
      type: 'success',
    });

    if (status === 'pending') {
      initialLogs.push({
        id: '2',
        time: new Date(now.getTime() - 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: `Order #${order.id} queued in asynchronous fulfillment batch pool.`,
        type: 'warning',
      });
      initialLogs.push({
        id: '3',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: `Awaiting cryptographic worker assignment...`,
        type: 'info',
      });
    } else if (status === 'processing') {
      initialLogs.push({
        id: '2',
        time: new Date(now.getTime() - 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: `Hardware security module (HSM) generating unique cryptographic key pair for customer.`,
        type: 'info',
      });
      initialLogs.push({
        id: '3',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: `Provisioning signed S3 CDN mirrors with AES-256 asset encryption...`,
        type: 'info',
      });
    } else {
      // Delivered
      initialLogs.push({
        id: '2',
        time: new Date(now.getTime() - 12000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: `Cryptographic keys generated and stored in Vault: ${order.licenses?.length || 1} key(s) issued.`,
        type: 'success',
      });
      initialLogs.push({
        id: '3',
        time: new Date(now.getTime() - 6000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: `CDN distribution signed; anti-tamper SHA-256 package verified.`,
        type: 'success',
      });
      initialLogs.push({
        id: '4',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: `Fulfillment status: DELIVERED to user vault. Immediate download authorized.`,
        type: 'success',
      });
    }

    setLogs(initialLogs);
  }, [status, order.id]);

  const handleManualStateSelect = (newStatus: FulfillmentStatus) => {
    // Stop any ongoing simulation
    simulationTimerRef.current.forEach(clearTimeout);
    simulationTimerRef.current = [];
    setIsSimulating(false);

    setStatus(newStatus);
    setSimulationProgress(newStatus === 'delivered' ? 100 : newStatus === 'processing' ? 55 : 15);
    onStatusChange?.(order.id, newStatus);
  };

  const runLiveSimulation = () => {
    // Clear previous timers
    simulationTimerRef.current.forEach(clearTimeout);
    simulationTimerRef.current = [];

    setIsSimulating(true);
    setStatus('pending');
    setSimulationProgress(15);
    setShowLogs(true);

    const currentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setLogs([
      {
        id: `${Date.now()}-0`,
        time: currentTime(),
        text: `[SIMULATION] Starting live fulfillment simulation for Order #${order.id}`,
        type: 'info',
      },
      {
        id: `${Date.now()}-1`,
        time: currentTime(),
        text: `Payment confirmed. Order status moved to [PENDING]. Queued in high-speed dispatch worker.`,
        type: 'warning',
      },
    ]);

    // Step 2: Processing (at 1.5s)
    const t1 = setTimeout(() => {
      setStatus('processing');
      setSimulationProgress(45);
      setLogs((prev) => [
        ...prev,
        {
          id: `${Date.now()}-2`,
          time: currentTime(),
          text: `Worker node #worker-eu-88 acquired job. Status transitioned to [PROCESSING].`,
          type: 'info',
        },
        {
          id: `${Date.now()}-3`,
          time: currentTime(),
          text: `Executing cryptographic key generation: ECDSA curve P-256 keypair allocated.`,
          type: 'info',
        },
      ]);
    }, 1500);

    // Step 3: Edge CDN syncing (at 3.2s)
    const t2 = setTimeout(() => {
      setSimulationProgress(75);
      setLogs((prev) => [
        ...prev,
        {
          id: `${Date.now()}-4`,
          time: currentTime(),
          text: `Syncing digital asset package to AWS CloudFront & Cloudflare Enterprise edge nodes...`,
          type: 'info',
        },
        {
          id: `${Date.now()}-5`,
          time: currentTime(),
          text: `SHA-256 cryptographic integrity checksum matched: 0x9f4a...valid.`,
          type: 'success',
        },
      ]);
    }, 3200);

    // Step 4: Delivered (at 4.8s)
    const t3 = setTimeout(() => {
      setStatus('delivered');
      setSimulationProgress(100);
      setIsSimulating(false);
      onStatusChange?.(order.id, 'delivered');
      setLogs((prev) => [
        ...prev,
        {
          id: `${Date.now()}-6`,
          time: currentTime(),
          text: `Fulfillment finalized: Order status is [DELIVERED].`,
          type: 'success',
        },
        {
          id: `${Date.now()}-7`,
          time: currentTime(),
          text: `Digital assets and active licenses unlocked in customer vault!`,
          type: 'success',
        },
      ]);
    }, 4800);

    simulationTimerRef.current = [t1, t2, t3];
  };

  // Determine current active step index (0 to 3)
  const activeStepIndex = status === 'pending' ? 0 : status === 'processing' ? 2 : 3;

  return (
    <div className="rounded-2xl bg-zinc-950/90 border border-cyan-500/30 overflow-hidden shadow-xl shadow-cyan-950/20">
      
      {/* Top Banner: Status Indicator & Interactive Simulator Controls */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Status Badge */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            {status === 'pending' && (
              <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4 animate-pulse" />
              </div>
            )}
            {status === 'processing' && (
              <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              </div>
            )}
            {status === 'delivered' && (
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            )}
            {status === 'processing' && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Fulfillment Status:
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold flex items-center gap-1 ${
                status === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : status === 'processing'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
              }`}>
                {status === 'pending' && '● PENDING QUEUE'}
                {status === 'processing' && '● PROCESSING (LIVE)'}
                {status === 'delivered' && '✓ DELIVERED & ACTIVE'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              {status === 'pending' && 'Awaiting automated cryptographic licensing node assignment'}
              {status === 'processing' && 'Synthesizing keys & replicating CDN download payloads (approx ~3s)'}
              {status === 'delivered' && 'Verified · All cryptographic keys & downloads ready in Vault'}
            </p>
          </div>
        </div>

        {/* Simulator Controls */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-white/10">
          <span className="text-[10px] font-mono text-zinc-400 px-2 hidden sm:inline">
            Simulate State:
          </span>

          <button
            type="button"
            onClick={() => handleManualStateSelect('pending')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
              status === 'pending'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Pending
          </button>

          <button
            type="button"
            onClick={() => handleManualStateSelect('processing')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
              status === 'processing'
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Processing
          </button>

          <button
            type="button"
            onClick={() => handleManualStateSelect('delivered')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
              status === 'delivered'
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Delivered
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Live Progress Simulation Button */}
          <button
            type="button"
            disabled={isSimulating}
            onClick={runLiveSimulation}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
            title="Watch real-time pipeline execution from start to finish"
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-2.5 h-2.5 fill-current text-cyan-400" />
                <span>Run Live Sim</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-900 h-1.5 relative overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ease-out ${
            status === 'pending'
              ? 'bg-amber-500 w-[15%]'
              : status === 'processing'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 w-[65%] animate-pulse'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 w-full'
          }`}
          style={{ width: `${simulationProgress}%` }}
        />
      </div>

      {/* 4-Step Pipeline Stepper */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = (status === 'delivered') || 
              (status === 'processing' && idx < 2) || 
              (status === 'pending' && idx === 0);

            const isCurrent = (status === 'pending' && idx === 0) ||
              (status === 'processing' && idx === 2) ||
              (status === 'delivered' && idx === 3);

            return (
              <div 
                key={step.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-zinc-900/80 border-emerald-500/30 text-zinc-200'
                    : isCurrent
                    ? 'bg-cyan-950/40 border-cyan-400/50 text-white shadow-md shadow-cyan-500/5'
                    : 'bg-zinc-900/30 border-white/5 text-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-zinc-800 text-zinc-600'
                  }`}>
                    {isCurrent && status === 'processing' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <span className="text-[10px] font-mono">
                    {isCompleted ? (
                      <span className="text-emerald-400 font-bold">✓ Ready</span>
                    ) : isCurrent ? (
                      <span className="text-cyan-400 font-bold animate-pulse">● Active</span>
                    ) : (
                      <span className="text-zinc-600">Pending</span>
                    )}
                  </span>
                </div>

                <div className="text-xs font-bold leading-tight mb-1 text-white">
                  {step.label}
                </div>
                <div className="text-[10px] text-zinc-400 leading-snug">
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* State Notice / Asset Availability Banner */}
        {status === 'pending' && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Order Queued:</span> Your digital licenses are being generated by our secure hardware server. Activation keys and high-speed download links will automatically unlock as soon as processing completes.
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="mt-3.5 p-3 rounded-xl bg-cyan-950/30 border border-cyan-400/30 flex items-start gap-2.5 text-xs text-cyan-200">
            <Loader2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-spin" />
            <div className="leading-relaxed">
              <span className="font-bold">Live Key Ingestion in Progress:</span> Cryptographic ECDSA signatures are being minted and registered to <span className="font-mono text-white">{order.customerEmail}</span>. S3 Edge CDN mirrors are synchronizing packages worldwide.
            </div>
          </div>
        )}

        {status === 'delivered' && (
          <div className="mt-3.5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="font-bold text-white">Fulfillment Complete:</strong> All cryptographic keys are activated and cloud binaries are ready for zero-latency deployment.
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              100% HEALTHY
            </span>
          </div>
        )}

        {/* Terminal / Live Fulfillment Audit Log Toggle */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="text-[11px] font-mono text-zinc-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fulfillment Audit Trail ({logs.length} events)</span>
            {showLogs ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          <span className="text-[10px] font-mono text-zinc-500">
            Ref: {order.transactionRef.substring(0, 16)}...
          </span>
        </div>

        {/* Collapsible Live Audit Log Window */}
        {showLogs && (
          <div className="mt-2 p-3 bg-black/80 rounded-xl border border-white/10 font-mono text-[11px] space-y-1.5 max-h-40 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                <span className={
                  log.type === 'success'
                    ? 'text-emerald-400'
                    : log.type === 'warning'
                    ? 'text-amber-300'
                    : 'text-zinc-300'
                }>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
