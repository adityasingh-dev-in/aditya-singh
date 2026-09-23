export interface Project {
  id: string
  title: string
  tagline: string
  problemConstraints: string
  architecturalTradeoffs: string
  outcomeMetrics: string
  tags: string[]
  techStack: string[]
  github?: string
  live?: string
  featured?: boolean
  status: 'active' | 'maintained' | 'archived'
}

export const projects: Project[] = [
  {
    id: 'raft-kv',
    title: 'Raft-KV: Distributed Consensus Key-Value Store',
    tagline: 'Linearizable replicated state machine with automated leader election and log compaction in Go.',
    problemConstraints:
      'Maintain strict linearizability and zero split-brain state across 5 nodes in untrusted networks with up to 2 simultaneous node crashes or network partitions.',
    architecturalTradeoffs:
      'Prioritized CP (consistency over partition tolerance). Implemented randomized election timeouts (150-300ms) over deterministic rounds to eliminate split-vote livelocks; used memory snapshotting to truncate logs without downtime.',
    outcomeMetrics:
      'Zero split-brain occurrences across 10,000 automated partition injection cycles; sub-15ms quorum commit latency under local testing.',
    tags: ['go', 'distributed-systems', 'architecture'],
    techStack: ['Go', 'RPC', 'Raft Protocol', 'Concurrency'],
    github: 'https://github.com/adityasingh/raft-kv',
    featured: true,
    status: 'active',
  },
  {
    id: 'zero-cost-blog',
    title: 'Zero-Cost Statically Generated Blog & In-Browser CMS',
    tagline: 'Production-grade engineering blog with Git as database and direct-to-Cloudinary asset pipeline at ₹0/month.',
    problemConstraints:
      'Zero recurring infrastructure fees, no external database dependencies, sub-30ms INP responsiveness, and client-side draft auto-persistence without cloud sync lag.',
    architecturalTradeoffs:
      'Bypassed SaaS headless CMS (Contentful/Sanity) by leveraging GitHub Git Data API (atomic createTree → createCommit); avoided Vercel 4.5MB serverless body limits by using direct-to-Cloudinary signed uploads.',
    outcomeMetrics:
      '₹0.00/month infrastructure cost; 100/100 Lighthouse performance score; 0 build failures on 15+ SSG pages.',
    tags: ['nextjs', 'typescript', 'architecture'],
    techStack: ['Next.js 15', 'Velite', 'Cloudinary', 'Pagefind', 'Tailwind 4'],
    github: 'https://github.com/adityasingh/aditya-singh',
    live: 'https://aditya.dev',
    featured: true,
    status: 'active',
  },
  {
    id: 'rust-json-parser',
    title: 'Zero-Allocation JSON Parser in Rust',
    tagline: 'High-throughput recursive descent JSON parser optimized for micro-payloads.',
    problemConstraints:
      'Prevent heap memory fragmentation and reduce parsing latency on millions of sub-4KB telemetry events per minute.',
    architecturalTradeoffs:
      'Replaced heap-allocated AST objects with borrowed string slices (`&str`) and arena buffer indexing, avoiding dynamic allocation completely for keys and string values.',
    outcomeMetrics:
      '3.2× throughput improvement over serde_json on small inputs; zero memory leaks during 24h continuous stress testing.',
    tags: ['rust', 'systems', 'performance'],
    techStack: ['Rust', 'Arena Allocator', 'SIMD', 'Criterion.rs'],
    github: 'https://github.com/adityasingh/rust-json',
    featured: true,
    status: 'active',
  },
  {
    id: 'type-safe-router',
    title: 'Compile-Time Type-Safe HTTP Route Compiler',
    tagline: 'TypeScript route parser inferring parameter types from route strings without code generation.',
    problemConstraints:
      'Prevent runtime URL param type bugs in enterprise REST APIs without requiring schema generation or heavy validation libraries.',
    architecturalTradeoffs:
      'Implemented recursive variadic tuple types and template literal pattern matching at the type level, shifting parameter validation cost from runtime to compile time.',
    outcomeMetrics:
      '0% runtime performance overhead; compile-time catch rate for invalid route parameter access.',
    tags: ['typescript', 'architecture'],
    techStack: ['TypeScript', 'Variadic Tuples', 'Compiler API'],
    github: 'https://github.com/adityasingh/typed-router',
    status: 'maintained',
  },
  {
    id: 'react-signals',
    title: 'Fine-Grained Reactivity Engine',
    tagline: 'Minimalist signals reactivity prototype for zero-VDOM DOM mutation.',
    problemConstraints:
      'Achieve sub-millisecond DOM updates without virtual DOM reconciliation overhead in animation-heavy dashboards.',
    architecturalTradeoffs:
      'Dependency tracking graph connecting signals directly to text node updates, bypassing React fiber reconciliation.',
    outcomeMetrics:
      '95% reduction in main thread style recalcs on high-frequency telemetry counters.',
    tags: ['react', 'typescript'],
    techStack: ['JavaScript', 'DOM API', 'Reactivity Graph'],
    github: 'https://github.com/adityasingh/signals',
    status: 'archived',
  },
]
