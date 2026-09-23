'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Play, RotateCcw, ShieldCheck, Activity, Terminal } from 'lucide-react'

interface LogEntry {
  term: number
  index: number
  cmd: string
  committed: boolean
}

type NodeRole = 'Leader' | 'Candidate' | 'Follower'

interface RaftNode {
  id: number
  role: NodeRole
  term: number
  votedFor: number | null
  alive: boolean
}

export function RaftSimulator() {
  const [term, setTerm] = useState(1)
  const [nodes, setNodes] = useState<RaftNode[]>([
    { id: 1, role: 'Leader', term: 1, votedFor: 1, alive: true },
    { id: 2, role: 'Follower', term: 1, votedFor: 1, alive: true },
    { id: 3, role: 'Follower', term: 1, votedFor: 1, alive: true },
  ])
  const [logs, setLogs] = useState<LogEntry[]>([
    { term: 1, index: 1, cmd: 'INIT_STATE', committed: true },
  ])
  const [heartbeatActive, setHeartbeatActive] = useState(true)
  const [lastAction, setLastAction] = useState('Cluster healthy. Leader: Node 1 (Term 1)')
  const nextValRef = useRef(1)

  // Periodic heartbeat pulse simulation
  useEffect(() => {
    if (!heartbeatActive) return
    const interval = setInterval(() => {
      // micro heartbeat tick
    }, 1200)
    return () => clearInterval(interval)
  }, [heartbeatActive])

  const appendEntry = () => {
    const leader = nodes.find((n) => n.role === 'Leader' && n.alive)
    if (!leader) {
      setLastAction('Append rejected: No elected leader available')
      return
    }

    const nextIndex = logs.length + 1
    const newCmd = `SET key_${nextValRef.current}=${nextValRef.current * 10}`
    nextValRef.current += 1

    const newEntry: LogEntry = {
      term,
      index: nextIndex,
      cmd: newCmd,
      committed: true,
    }

    setLogs((prev) => [...prev.slice(-4), newEntry])
    setLastAction(`Replicated ${newCmd} across majority quorum (2/3 nodes committed)`)
  }

  const triggerElection = () => {
    const newTerm = term + 1
    setTerm(newTerm)

    // Elect next node in ring
    const currentLeaderIdx = nodes.findIndex((n) => n.role === 'Leader')
    const nextLeaderIdx = (currentLeaderIdx + 1) % nodes.length

    setNodes((prev) =>
      prev.map((n, idx) => ({
        ...n,
        term: newTerm,
        role: idx === nextLeaderIdx ? 'Leader' : 'Follower',
        votedFor: prev[nextLeaderIdx].id,
      })),
    )

    setLastAction(
      `Heartbeat timeout! Node ${nodes[nextLeaderIdx].id} won election with 2 votes for Term ${newTerm}`,
    )
  }

  const resetCluster = () => {
    setTerm(1)
    setNodes([
      { id: 1, role: 'Leader', term: 1, votedFor: 1, alive: true },
      { id: 2, role: 'Follower', term: 1, votedFor: 1, alive: true },
      { id: 3, role: 'Follower', term: 1, votedFor: 1, alive: true },
    ])
    setLogs([{ term: 1, index: 1, cmd: 'INIT_STATE', committed: true }])
    nextValRef.current = 1
    setLastAction('Cluster reset to initial term state.')
  }

  return (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-medium tracking-wide uppercase text-zinc-400">
              Raft Replicated State Machine
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/10">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Term {term}</span>
            <span className="text-zinc-600">|</span>
            <span>Quorum: 2/3</span>
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-3">
          {nodes.map((node) => {
            const isLeader = node.role === 'Leader'
            return (
              <div
                key={node.id}
                className={`p-3 rounded-xl border transition-all ${
                  isLeader
                    ? 'border-purple-500/40 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.12)]'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-zinc-200">
                    Node {node.id}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium uppercase tracking-wider ${
                      isLeader
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {node.role}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                  <span>Log Idx: {logs.length}</span>
                  <Activity
                    size={11}
                    className={isLeader ? 'text-purple-400 animate-pulse' : 'text-zinc-600'}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Replicated Log Tape */}
        <div className="rounded-lg bg-black/40 border border-white/10 p-2.5 mb-3 font-mono text-[11px]">
          <div className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Replicated Log Stream</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Committed
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {logs.map((entry) => (
              <div
                key={entry.index}
                className="px-2 py-1 rounded bg-zinc-900 border border-white/10 whitespace-nowrap text-zinc-300"
              >
                <span className="text-zinc-400">[{entry.index}]</span> {entry.cmd}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Terminal Telemetry / Actions */}
      <div>
        <div className="text-[11px] font-mono text-zinc-400 bg-zinc-950/60 rounded border border-white/10 px-2.5 py-1.5 flex items-center gap-2 mb-3 truncate">
          <Terminal size={12} className="text-cyan-400 flex-shrink-0" />
          <span className="truncate">{lastAction}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={appendEntry}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono text-white bg-purple-600/80 hover:bg-purple-600 transition-colors border border-purple-500/40"
          >
            <Play size={12} /> Append Entry
          </button>
          <button
            onClick={triggerElection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] transition-colors border border-white/10"
          >
            Trigger Election
          </button>
          <button
            onClick={resetCluster}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors border border-white/10"
            title="Reset simulation"
            aria-label="Reset simulation"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default RaftSimulator
