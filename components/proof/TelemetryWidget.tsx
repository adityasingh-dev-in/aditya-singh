'use client'

import React from 'react'
import { Zap, Gauge, Server, DollarSign, GitCommit } from 'lucide-react'

export function TelemetryWidget() {
  const metrics = [
    {
      icon: Gauge,
      label: 'INP Latency',
      val: '24ms',
      detail: 'Compositor-only transforms',
      status: 'optimal',
    },
    {
      icon: DollarSign,
      label: 'Monthly Cloud Spend',
      val: '₹0.00',
      detail: 'Next.js + R2 + GitHub',
      status: 'zero',
    },
    {
      icon: Zap,
      label: 'Lighthouse Score',
      val: '100 / 100',
      detail: 'Pure SSG static output',
      status: 'optimal',
    },
    {
      icon: GitCommit,
      label: 'Git Data API',
      val: 'Atomic',
      detail: 'Blob → Tree → Commit',
      status: 'active',
    },
  ]

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Server size={13} className="text-cyan-400" />
            <span className="text-xs font-mono font-medium tracking-wide uppercase text-zinc-400">
              System Telemetry
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            HEALTHY
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          {metrics.map((m) => {
            const Icon = m.icon
            return (
              <div
                key={m.label}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider">{m.label}</span>
                  <Icon size={12} className="text-zinc-500" />
                </div>
                <div className="font-mono font-bold text-sm text-zinc-100">{m.val}</div>
                <div className="text-[10px] text-zinc-400 truncate mt-0.5">{m.detail}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>Stack: Next.js 15 · Velite · Tailwind 4</span>
        <span className="text-purple-400">Edge verified</span>
      </div>
    </div>
  )
}

export default TelemetryWidget
