import React from "react";
import { ArrowRight, Database, ShieldCheck, GitPullRequest, Cpu, Lock, FileCode2, Layers } from "lucide-react";

const ArchitectureSchematic = () => (
  <div
    className="w-full rounded-[4px] border border-[#2B2E36] bg-[#141518] overflow-hidden"
    role="img"
    aria-label="FirstIssue.dev serverless system architecture connecting React client, Supabase Edge Functions, PostgreSQL with Row Level Security, and GitHub APIs"
  >
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#22242A] px-5 py-3 bg-[#17181B]">
      <span className="font-mono text-xs uppercase tracking-wider text-[#A8ADB6]">
        System Topology · Zero-Trust Serverless Flow
      </span>
      <span className="font-mono text-xs text-[#DAFA9C] font-semibold">
        TLS + JWT + RLS
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#22242A]">
      <div className="p-5 flex flex-col justify-between gap-3 bg-[#141518]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#DAFA9C] shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold text-[#F4F4F0]">Browser Client</p>
        </div>
        <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
          React 19 SPA with TanStack Query caching, HTML-to-PNG card capture, and jsPDF resume export.
        </p>
        <div className="font-mono text-xs text-[#8C929C] pt-2 border-t border-[#22242A]">
          No GitHub secret exposure
        </div>
      </div>

      <div className="p-5 flex flex-col justify-between gap-3 bg-[#17181B]">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#DAFA9C] shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold text-[#F4F4F0]">Supabase Edge Proxy</p>
        </div>
        <ul className="space-y-1.5 font-mono text-xs text-[#D4D7DC]">
          <li>smart-match / contribution-kit</li>
          <li>kb-query (FirstMate RAG)</li>
          <li>github-sync &amp; attestation-sign</li>
        </ul>
        <div className="font-mono text-xs text-[#DAFA9C] pt-2 border-t border-[#22242A]">
          Deno isolates · Rate limited
        </div>
      </div>

      <div className="p-5 flex flex-col justify-between gap-3 bg-[#141518]">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#34D399] shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold text-[#F4F4F0]">Data &amp; Upstream APIs</p>
        </div>
        <ul className="space-y-1.5 font-mono text-xs text-[#D4D7DC]">
          <li>Supabase PostgreSQL (RLS)</li>
          <li>GitHub GraphQL / REST v4</li>
          <li>Dodo Payments Webhooks</li>
        </ul>
        <div className="font-mono text-xs text-[#34D399] pt-2 border-t border-[#22242A]">
          Verified PR SHA-256 hashes
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#22242A] border-t border-[#22242A] bg-[#0B0C0E] font-mono text-xs">
      <div className="flex items-center justify-between px-5 py-3 text-[#A8ADB6] gap-2">
        <span>1. OAuth PKCE Session</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#DAFA9C] shrink-0" aria-hidden="true" />
        <span className="text-[#F4F4F0]">Edge Token Vault</span>
      </div>
      <div className="flex items-center justify-between px-5 py-3 text-[#A8ADB6] gap-2">
        <span>2. Merged PR Verification</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#34D399] shrink-0" aria-hidden="true" />
        <span className="text-[#F4F4F0]">MetalCard Attestation</span>
      </div>
    </div>
  </div>
);

const ReverseEngineeringSchematic = () => (
  <div
    className="w-full rounded-[4px] border border-[#2B2E36] bg-[#141518] overflow-hidden"
    role="img"
    aria-label="Comparison between Forward Engineering and Reverse Engineering stages"
  >
    <div className="font-mono text-xs uppercase tracking-wider text-[#A8ADB6] border-b border-[#22242A] px-5 py-3 bg-[#17181B]">
      Compilation vs. Architecture Recovery Workflow
    </div>
    <div className="divide-y divide-[#22242A]">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#F4F4F0]">Forward Engineering Path</p>
          <span className="font-mono text-xs text-[#34D399]">SOURCE → BINARY</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#22242A] bg-[#0B0C0E] font-mono text-xs">
          {["Source Code", "Parser & AST", "Compiler / IR", "Compiled Binary"].map((step) => (
            <div key={step} className="px-3 py-2.5 text-[#D4D7DC] text-center">
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#F4F4F0]">Reverse Engineering Path</p>
          <span className="font-mono text-xs text-[#F59E0B]">BINARY → SPEC</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#22242A] bg-[#0B0C0E] font-mono text-xs">
          {["Target Binary", "Disassembler", "Decompiler Pseudocode", "Protocol Spec"].map((step) => (
            <div key={step} className="px-3 py-2.5 text-[#D4D7DC] text-center">
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CleanRoomSchematic = () => (
  <div
    className="w-full rounded-[4px] border border-[#2B2E36] bg-[#141518] overflow-hidden"
    role="img"
    aria-label="Three-zone clean room software design isolation architecture"
  >
    <div className="font-mono text-xs uppercase tracking-wider text-[#A8ADB6] border-b border-[#22242A] px-5 py-3 bg-[#17181B]">
      Clean-Room Isolation Boundary
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#22242A]">
      <div className="p-5 space-y-2 bg-[#141518]">
        <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] uppercase">
          <GitPullRequest className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Zone A · Dirty Room
        </div>
        <p className="text-sm font-semibold text-[#F4F4F0]">Reverse Analysis Team</p>
        <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
          Inspects binary behavior and authors an abstract functional specification. Never writes implementation code.
        </p>
      </div>

      <div className="p-5 space-y-2 bg-[#0B0C0E]">
        <div className="flex items-center gap-2 font-mono text-xs text-[#F4F4F0] uppercase">
          <Lock className="w-3.5 h-3.5 text-[#DAFA9C] shrink-0" aria-hidden="true" />
          Zone B · Ethical Wall
        </div>
        <p className="text-sm font-semibold text-[#F4F4F0]">Legal &amp; IP Review</p>
        <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
          Strips any protected expression so only uncopyrightable I/O contracts cross to implementers.
        </p>
      </div>

      <div className="p-5 space-y-2 bg-[#141518]">
        <div className="flex items-center gap-2 font-mono text-xs text-[#34D399] uppercase">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Zone C · Clean Room
        </div>
        <p className="text-sm font-semibold text-[#F4F4F0]">Implementation Team</p>
        <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
          Zero prior exposure to the original source. Implements compatible software solely from the clean spec.
        </p>
      </div>
    </div>
  </div>
);

const TechnicalDiagram = ({ id }) => {
  if (id === "reverse-engineering" || id === "/reverse_engineering_workflow.png") {
    return <ReverseEngineeringSchematic />;
  }
  if (id === "clean-room" || id === "/clean_room_design.png") {
    return <CleanRoomSchematic />;
  }
  return <ArchitectureSchematic />;
};

export default TechnicalDiagram;
