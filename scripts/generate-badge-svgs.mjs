// Generator script for standalone animated SVGs matching the profile achievement badges
// Deployable as static assets in /public/badges/<badge-id>.svg

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../public/badges');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Common CSS keyframes for smooth, looping standalone animations
const commonStyles = `
    @keyframes spin-cw {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes spin-ccw {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.35; transform: scale(0.97); }
      50% { opacity: 0.85; transform: scale(1.03); }
    }
    @keyframes pulse-node {
      0%, 100% { transform: scale(1); opacity: 0.85; }
      50% { transform: scale(1.2); opacity: 1; }
    }
    @keyframes sparkle-pulse {
      0%, 100% { opacity: 0.25; transform: scale(0.85); }
      50% { opacity: 1; transform: scale(1.3); }
    }
    @keyframes flame-flicker {
      0%, 100% { transform: scale(1) translateY(0); }
      50% { transform: scale(1.04, 0.96) translateY(-2.5px); }
    }
    @keyframes rocket-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    @keyframes rocket-fire {
      0%, 100% { transform: scaleY(1); opacity: 0.8; }
      50% { transform: scaleY(1.35) scaleX(0.9); opacity: 1; }
    }
    @keyframes brain-pulse {
      0%, 100% { transform: scale(1); opacity: 0.85; }
      50% { transform: scale(1.15); opacity: 1; }
    }
    .orbit-outer {
      transform-origin: 100px 100px;
      animation: spin-cw 25s linear infinite;
    }
    .orbit-outer-fast {
      transform-origin: 100px 100px;
      animation: spin-cw 20s linear infinite;
    }
    .orbit-outer-slow {
      transform-origin: 100px 100px;
      animation: spin-cw 28s linear infinite;
    }
    .orbit-inner {
      transform-origin: 100px 100px;
      animation: spin-ccw 15s linear infinite;
    }
    .orbit-inner-fast {
      transform-origin: 100px 100px;
      animation: spin-ccw 12s linear infinite;
    }
    .orbit-inner-slow {
      transform-origin: 100px 100px;
      animation: spin-ccw 18s linear infinite;
    }
    .glow-core {
      transform-origin: 100px 100px;
      animation: pulse-glow 3s ease-in-out infinite;
    }
    .sparkle-a {
      transform-origin: 65px 45px;
      animation: sparkle-pulse 1.8s ease-in-out infinite;
    }
    .sparkle-b {
      transform-origin: 135px 95px;
      animation: sparkle-pulse 2.2s ease-in-out infinite 0.7s;
    }
    .sparkle-c {
      transform-origin: 100px 60px;
      animation: sparkle-pulse 2s ease-in-out infinite 0.3s;
    }
    .node-pulse-anim {
      transform-origin: 85px 110px;
      animation: pulse-node 2s ease-in-out infinite;
    }
    .flame-anim {
      transform-origin: 100px 135px;
      animation: flame-flicker 0.85s ease-in-out infinite;
    }
    .rocket-anim {
      transform-origin: 100px 90px;
      animation: rocket-float 2.5s ease-in-out infinite;
    }
    .rocket-flame-anim {
      transform-origin: 100px 125px;
      animation: rocket-fire 0.4s ease-in-out infinite;
    }
    .brain-anim {
      transform-origin: 100px 98px;
      animation: brain-pulse 2s ease-in-out infinite;
    }
`;

const badges = {
  // 1. First Contribution
  'first-contribution': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082" />
      <stop offset="50%" stop-color="#FFB300" />
      <stop offset="100%" stop-color="#FF6F00" />
    </linearGradient>
    <linearGradient id="neonBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
    <linearGradient id="neonPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC" />
      <stop offset="100%" stop-color="#8B5CF6" />
    </linearGradient>
    <radialGradient id="glowBackdrop" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#glowBackdrop)" class="glow-core" />

  <g class="orbit-outer">
    <circle cx="100" cy="100" r="85" fill="none" stroke="url(#neonBlue)" stroke-width="2" stroke-dasharray="6 8" stroke-opacity="0.65" />
    <circle cx="100" cy="15" r="3.5" fill="#60A5FA" />
    <circle cx="100" cy="185" r="3.5" fill="#60A5FA" />
  </g>

  <g class="orbit-inner">
    <circle cx="100" cy="100" r="70" fill="none" stroke="url(#neonPurple)" stroke-width="1.5" stroke-dasharray="40 20" stroke-opacity="0.5" />
  </g>

  <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#11121F" stroke="#1E293B" stroke-width="3" />
  <polygon points="100,42 148,68 148,132 100,158 52,132 52,68" fill="none" stroke="url(#neonBlue)" stroke-width="1.5" stroke-opacity="0.8" />

  <polygon class="sparkle-a" points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63" fill="#60A5FA" transform="translate(-35, -20) scale(0.6)" />
  <polygon class="sparkle-b" points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63" fill="#A78BFA" transform="translate(35, 30) scale(0.6)" />

  <path d="M 73 80 L 55 100 L 73 120" fill="none" stroke="url(#neonPurple)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 127 80 L 145 100 L 127 120" fill="none" stroke="url(#neonPurple)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />

  <polygon points="100,70 109,90 130,93 115,108 119,130 100,119 81,130 85,108 70,93 91,90" fill="url(#goldGradient)" stroke="#FFD54F" stroke-width="2" stroke-linejoin="round" filter="url(#glow)" />
</svg>`,

  // 2. First Merge
  'first-merge': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="50%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="neonEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6EE7B7" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
    <linearGradient id="neonMint" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A7F3D0" />
      <stop offset="100%" stop-color="#34D399" />
    </linearGradient>
    <radialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="emeraldBlur">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#emeraldGlow)" class="glow-core" />

  <g class="orbit-outer-fast">
    <circle cx="100" cy="100" r="85" fill="none" stroke="url(#neonEmerald)" stroke-width="2" stroke-dasharray="8 6" stroke-opacity="0.65" />
    <circle cx="100" cy="15" r="3.5" fill="#34D399" />
    <circle cx="100" cy="185" r="3.5" fill="#34D399" />
  </g>

  <g class="orbit-inner-fast">
    <circle cx="100" cy="100" r="72" fill="none" stroke="url(#neonMint)" stroke-width="1.5" stroke-dasharray="30 15" stroke-opacity="0.45" />
  </g>

  <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#111A1E" stroke="#1E293B" stroke-width="3" />
  <polygon points="100,42 148,68 148,132 100,158 52,132 52,68" fill="none" stroke="url(#neonEmerald)" stroke-width="1.5" stroke-opacity="0.8" />

  <path d="M 85 65 L 85 135" fill="none" stroke="#34D399" stroke-width="4" stroke-linecap="round" />
  <path d="M 125 75 C 125 95, 85 95, 85 115" fill="none" stroke="url(#neonMint)" stroke-width="4" stroke-linecap="round" />

  <circle cx="85" cy="70" r="5" fill="#111A1E" stroke="#34D399" stroke-width="3" />
  <circle cx="125" cy="75" r="5" fill="#111A1E" stroke="#6EE7B7" stroke-width="3" />
  <circle cx="85" cy="130" r="5" fill="#111A1E" stroke="#34D399" stroke-width="3" />

  <circle class="node-pulse-anim" cx="85" cy="110" r="10" fill="url(#emeraldGradient)" stroke="#A7F3D0" stroke-width="2.5" filter="url(#emeraldBlur)" />
</svg>`,

  // 3. Contributor 5 (Active Contributor)
  'contributor-5': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC" />
      <stop offset="50%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#7E22CE" />
    </linearGradient>
    <linearGradient id="neonPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E9D5FF" />
      <stop offset="100%" stop-color="#A855F7" />
    </linearGradient>
    <radialGradient id="purpleGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#A855F7" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="purpleBlur">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#purpleGlow)" class="glow-core" />

  <g class="orbit-outer-slow">
    <polygon points="100,10 178,55 178,145 100,190 22,145 22,55" fill="none" stroke="url(#purpleGradient)" stroke-width="1.5" stroke-dasharray="10 12" stroke-opacity="0.55" />
    <circle cx="100" cy="10" r="3" fill="#C084FC" />
    <circle cx="178" cy="55" r="3" fill="#C084FC" />
    <circle cx="178" cy="145" r="3" fill="#C084FC" />
    <circle cx="100" cy="190" r="3" fill="#C084FC" />
    <circle cx="22" cy="145" r="3" fill="#C084FC" />
    <circle cx="22" cy="55" r="3" fill="#C084FC" />
  </g>

  <g class="orbit-inner-slow">
    <circle cx="100" cy="100" r="72" fill="none" stroke="url(#neonPurpleGrad)" stroke-width="2" stroke-dasharray="40 30" stroke-opacity="0.6" />
  </g>

  <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#14111E" stroke="#1E293B" stroke-width="3" />
  <polygon points="100,42 148,68 148,132 100,158 52,132 52,68" fill="none" stroke="url(#purpleGradient)" stroke-width="1.5" stroke-opacity="0.8" />

  <circle class="sparkle-a" cx="70" cy="65" r="2.5" fill="#E9D5FF" opacity="0.6" />
  <circle class="sparkle-b" cx="130" cy="65" r="2" fill="#E9D5FF" opacity="0.4" />
  <circle class="sparkle-c" cx="75" cy="140" r="2" fill="#E9D5FF" opacity="0.5" />

  <path d="M 78 82 L 64 100 L 78 118" fill="none" stroke="url(#neonPurpleGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 122 82 L 136 100 L 122 118" fill="none" stroke="url(#neonPurpleGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

  <text x="100" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="900" fill="url(#purpleGradient)" text-anchor="middle" filter="url(#purpleBlur)">5</text>
  <text x="100" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="900" fill="url(#neonPurpleGrad)" text-anchor="middle">5</text>
</svg>`,

  // 4. Contributor 10 (Dedicated Contributor)
  'contributor-10': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818CF8" />
      <stop offset="50%" stop-color="#6366F1" />
      <stop offset="100%" stop-color="#4338CA" />
    </linearGradient>
    <linearGradient id="neonIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C7D2FE" />
      <stop offset="100%" stop-color="#6366F1" />
    </linearGradient>
    <radialGradient id="indigoGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6366F1" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="indigoBlur">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#indigoGlow)" class="glow-core" />

  <g class="orbit-outer">
    <polygon points="100,10 178,55 178,145 100,190 22,145 22,55" fill="none" stroke="url(#indigoGradient)" stroke-width="1.5" stroke-dasharray="8 10" stroke-opacity="0.55" />
    <circle cx="100" cy="10" r="3" fill="#818CF8" />
    <circle cx="178" cy="55" r="3" fill="#818CF8" />
    <circle cx="178" cy="145" r="3" fill="#818CF8" />
    <circle cx="100" cy="190" r="3" fill="#818CF8" />
    <circle cx="22" cy="145" r="3" fill="#818CF8" />
    <circle cx="22" cy="55" r="3" fill="#818CF8" />
  </g>

  <g class="orbit-inner">
    <circle cx="100" cy="100" r="72" fill="none" stroke="url(#neonIndigo)" stroke-width="2" stroke-dasharray="30 40" stroke-opacity="0.6" />
  </g>

  <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#11121F" stroke="#1E293B" stroke-width="3" />
  <polygon points="100,42 148,68 148,132 100,158 52,132 52,68" fill="none" stroke="url(#indigoGradient)" stroke-width="1.5" stroke-opacity="0.8" />

  <circle class="sparkle-a" cx="68" cy="62" r="2" fill="#C7D2FE" opacity="0.6" />
  <circle class="sparkle-b" cx="132" cy="62" r="2.5" fill="#C7D2FE" opacity="0.4" />

  <path d="M 72 82 L 58 100 L 72 118" fill="none" stroke="url(#neonIndigo)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 128 82 L 142 100 L 128 118" fill="none" stroke="url(#neonIndigo)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

  <text x="100" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="900" fill="url(#indigoGradient)" text-anchor="middle" filter="url(#indigoBlur)">10</text>
  <text x="100" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="900" fill="url(#neonIndigo)" text-anchor="middle">10</text>
</svg>`,

  // 5. Contributor 25 (Prolific Contributor)
  'contributor-25': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB7185" />
      <stop offset="50%" stop-color="#F43F5E" />
      <stop offset="100%" stop-color="#BE123C" />
    </linearGradient>
    <linearGradient id="neonPink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#F43F5E" />
    </linearGradient>
    <radialGradient id="pinkGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F43F5E" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="pinkBlur">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#pinkGlow)" class="glow-core" />

  <g class="orbit-outer-fast">
    <polygon points="100,10 178,55 178,145 100,190 22,145 22,55" fill="none" stroke="url(#pinkGradient)" stroke-width="1.5" stroke-dasharray="8 10" stroke-opacity="0.55" />
    <circle cx="100" cy="10" r="3" fill="#FB7185" />
    <circle cx="178" cy="55" r="3" fill="#FB7185" />
    <circle cx="178" cy="145" r="3" fill="#FB7185" />
    <circle cx="100" cy="190" r="3" fill="#FB7185" />
    <circle cx="22" cy="145" r="3" fill="#FB7185" />
    <circle cx="22" cy="55" r="3" fill="#FB7185" />
  </g>

  <g class="orbit-inner-fast">
    <circle cx="100" cy="100" r="72" fill="none" stroke="url(#neonPink)" stroke-width="2" stroke-dasharray="30 40" stroke-opacity="0.6" />
  </g>

  <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#1A1115" stroke="#1E293B" stroke-width="3" />
  <polygon points="100,42 148,68 148,132 100,158 52,132 52,68" fill="none" stroke="url(#pinkGradient)" stroke-width="1.5" stroke-opacity="0.8" />

  <circle class="sparkle-a" cx="68" cy="62" r="2" fill="#FECDD3" opacity="0.6" />
  <circle class="sparkle-b" cx="132" cy="62" r="2.5" fill="#FECDD3" opacity="0.4" />

  <path d="M 72 82 L 58 100 L 72 118" fill="none" stroke="url(#neonPink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 128 82 L 142 100 L 128 118" fill="none" stroke="url(#neonPink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

  <text x="100" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="900" fill="url(#pinkGradient)" text-anchor="middle" filter="url(#pinkBlur)">25</text>
  <text x="100" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="900" fill="url(#neonPink)" text-anchor="middle">25</text>
</svg>`,

  // 6. Contributor 50 (Elite Contributor)
  'contributor-50': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="neonAmber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF3C7" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
    <radialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="amberBlur">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#amberGlow)" class="glow-core" />

  <g class="orbit-outer-fast">
    <polygon points="100,10 178,55 178,145 100,190 22,145 22,55" fill="none" stroke="url(#amberGradient)" stroke-width="1.5" stroke-dasharray="8 10" stroke-opacity="0.6" />
    <circle cx="100" cy="10" r="3" fill="#FBBF24" />
    <circle cx="178" cy="55" r="3" fill="#FBBF24" />
    <circle cx="178" cy="145" r="3" fill="#FBBF24" />
    <circle cx="100" cy="190" r="3" fill="#FBBF24" />
    <circle cx="22" cy="145" r="3" fill="#FBBF24" />
    <circle cx="22" cy="55" r="3" fill="#FBBF24" />
  </g>

  <g class="orbit-inner-fast">
    <circle cx="100" cy="100" r="72" fill="none" stroke="url(#neonAmber)" stroke-width="2" stroke-dasharray="30 40" stroke-opacity="0.6" />
  </g>

  <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#1A1710" stroke="#1E293B" stroke-width="3" />
  <polygon points="100,42 148,68 148,132 100,158 52,132 52,68" fill="none" stroke="url(#amberGradient)" stroke-width="1.5" stroke-opacity="0.8" />

  <circle class="sparkle-a" cx="68" cy="62" r="2" fill="#FEF3C7" opacity="0.6" />
  <circle class="sparkle-b" cx="132" cy="62" r="2.5" fill="#FEF3C7" opacity="0.4" />

  <path d="M 78 82 L 64 100 L 78 118" fill="none" stroke="url(#neonAmber)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 122 82 L 136 100 L 122 118" fill="none" stroke="url(#neonAmber)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

  <text x="100" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="url(#amberGradient)" text-anchor="middle" filter="url(#amberBlur)">50</text>
  <text x="100" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="url(#neonAmber)" text-anchor="middle">50</text>
</svg>`,

  // 7. Contributor 100 (Centurion)
  'contributor-100': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="centurionGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="50%" stop-color="#FFA500" />
      <stop offset="100%" stop-color="#FF6B00" />
    </linearGradient>
    <linearGradient id="centurionRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF4444" />
      <stop offset="100%" stop-color="#DC2626" />
    </linearGradient>
    <linearGradient id="centurionCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B6B" />
      <stop offset="100%" stop-color="#B91C1C" />
    </linearGradient>
    <radialGradient id="centurionGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#DC2626" stop-opacity="0.32" />
      <stop offset="70%" stop-color="#991B1B" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="centurionBlur">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#centurionGlow)" class="glow-core" />

  <g class="orbit-outer">
    <circle cx="100" cy="100" r="86" fill="none" stroke="url(#centurionGold)" stroke-width="2" stroke-dasharray="8 6" stroke-opacity="0.65" />
    <circle cx="100" cy="14" r="3.5" fill="#FFD700" />
    <circle cx="100" cy="186" r="3.5" fill="#FFD700" />
  </g>

  <g class="orbit-inner">
    <circle cx="100" cy="100" r="72" fill="none" stroke="url(#centurionRed)" stroke-width="1.5" stroke-dasharray="35 18" stroke-opacity="0.55" />
  </g>

  <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#11121F" stroke="#1E293B" stroke-width="3" />
  <polygon points="100,40 150,66 150,134 100,160 50,134 50,66" fill="none" stroke="url(#centurionRed)" stroke-width="1.5" stroke-opacity="0.75" />

  <path d="M 56 120 C 52 110, 50 98, 52 86 C 54 78, 58 72, 64 68 C 58 78, 56 90, 58 102" fill="none" stroke="url(#centurionGold)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 144 120 C 148 110, 150 98, 148 86 C 146 78, 142 72, 136 68 C 142 78, 144 90, 142 102" fill="none" stroke="url(#centurionGold)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

  <path d="M 100 60 L 125 75 L 125 110 L 100 130 L 75 110 L 75 75 Z" fill="none" stroke="url(#centurionCrimson)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 100 65 L 121 77 L 121 108 L 100 125 L 79 108 L 79 77 Z" fill="url(#centurionRed)" opacity="0.2" />

  <path d="M 100 50 L 100 140 M 90 62 L 110 62" fill="none" stroke="url(#centurionGold)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#centurionBlur)" />

  <text x="100" y="102" text-anchor="middle" dominant-baseline="middle" fill="url(#centurionGold)" font-size="22" font-weight="bold" font-family="monospace" filter="url(#centurionBlur)">100</text>
  <polygon class="sparkle-a" points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63" fill="#FFD700" transform="translate(-42, -18) scale(0.5)" />
  <polygon class="sparkle-b" points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63" fill="#FF4444" transform="translate(42, 28) scale(0.5)" />
</svg>`,

  // 8. Merge Master (5 PRs)
  'merge-master-5': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="50%" stop-color="#059669" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
    <linearGradient id="neonMintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A7F3D0" />
      <stop offset="100%" stop-color="#34D399" />
    </linearGradient>
    <radialGradient id="mintGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="mintBlur">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#mintGlow)" class="glow-core" />

  <g class="orbit-outer">
    <circle cx="100" cy="100" r="85" fill="none" stroke="url(#mintGrad)" stroke-width="2" stroke-dasharray="6 8" stroke-opacity="0.65" />
    <circle cx="100" cy="15" r="3.5" fill="#34D399" />
    <circle cx="100" cy="185" r="3.5" fill="#34D399" />
  </g>

  <g class="orbit-inner">
    <circle cx="100" cy="100" r="70" fill="none" stroke="url(#neonMintGrad)" stroke-width="1.5" stroke-dasharray="40 20" stroke-opacity="0.5" />
  </g>

  <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#111E18" stroke="#1E293B" stroke-width="3" />
  <polygon points="100,42 148,68 148,132 100,158 52,132 52,68" fill="none" stroke="url(#mintGrad)" stroke-width="1.5" stroke-opacity="0.8" />

  <path d="M 100 70 L 100 135" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round" />
  <path d="M 75 75 C 75 95, 100 95, 100 115" fill="none" stroke="url(#neonMintGrad)" stroke-width="3.5" stroke-linecap="round" />
  <path d="M 125 75 C 125 95, 100 95, 100 115" fill="none" stroke="url(#neonMintGrad)" stroke-width="3.5" stroke-linecap="round" />

  <circle cx="100" cy="70" r="4.5" fill="#111E18" stroke="#10B981" stroke-width="2.5" />
  <circle cx="75" cy="75" r="4" fill="#111E18" stroke="#34D399" stroke-width="2.5" />
  <circle cx="125" cy="75" r="4" fill="#111E18" stroke="#34D399" stroke-width="2.5" />
  <circle cx="100" cy="130" r="4.5" fill="#111E18" stroke="#10B981" stroke-width="2.5" />

  <circle class="node-pulse-anim" cx="100" cy="108" r="9" fill="url(#mintGrad)" stroke="#A7F3D0" stroke-width="2" filter="url(#mintBlur)" />

  <path d="M 88 50 L 92 56 L 100 48 L 108 56 L 112 50 L 108 60 L 92 60 Z" fill="url(#neonMintGrad)" stroke="#10B981" stroke-width="1" stroke-linejoin="round" />
</svg>`,

  // 9. Merge Champion (10 PRs)
  'merge-master-10': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="emeraldChampionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="50%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
    <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#CA8A04" />
    </linearGradient>
    <linearGradient id="neonMintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A7F3D0" />
      <stop offset="100%" stop-color="#34D399" />
    </linearGradient>
    <radialGradient id="championGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="championBlur">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#championGlow)" class="glow-core" />

  <g class="orbit-outer">
    <polygon points="100,10 178,55 178,145 100,190 22,145 22,55" fill="none" stroke="url(#emeraldChampionGrad)" stroke-width="2" stroke-dasharray="10 12" stroke-opacity="0.55" />
    <circle cx="100" cy="10" r="3.5" fill="#FDE047" />
    <circle cx="100" cy="190" r="3.5" fill="#FDE047" />
  </g>

  <g class="orbit-inner">
    <circle cx="100" cy="100" r="74" fill="none" stroke="url(#neonMintGrad)" stroke-width="1.5" stroke-dasharray="50 30" stroke-opacity="0.45" />
  </g>

  <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#0B1310" stroke="#1E293B" stroke-width="3.5" />
  <polygon points="100,40 150,66 150,134 100,160 50,134 50,66" fill="none" stroke="url(#emeraldChampionGrad)" stroke-width="1.5" stroke-opacity="0.8" />

  <path d="M 52,110 C 45,90 52,70 65,65 M 148,110 C 155,90 148,70 135,65" fill="none" stroke="url(#neonMintGrad)" stroke-width="1.5" stroke-dasharray="4 4" stroke-opacity="0.4" />

  <path d="M 100 68 L 100 138" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round" />
  <path d="M 68 75 C 68 100, 100 100, 100 125" fill="none" stroke="url(#neonMintGrad)" stroke-width="3" stroke-linecap="round" />
  <path d="M 84 82 C 84 95, 100 95, 100 108" fill="none" stroke="url(#neonMintGrad)" stroke-width="3" stroke-linecap="round" />
  <path d="M 132 75 C 132 100, 100 100, 100 125" fill="none" stroke="url(#neonMintGrad)" stroke-width="3" stroke-linecap="round" />
  <path d="M 116 82 C 116 95, 100 95, 100 108" fill="none" stroke="url(#neonMintGrad)" stroke-width="3" stroke-linecap="round" />

  <path class="sparkle-a" d="M 58 135 L 60 138 L 63 135 L 60 132 Z" fill="#FDE047" opacity="0.6" />
  <path class="sparkle-b" d="M 142 135 L 144 138 L 147 135 L 144 132 Z" fill="#FDE047" opacity="0.6" />

  <circle cx="100" cy="68" r="4.5" fill="#0B1310" stroke="#10B981" stroke-width="2.5" />
  <circle cx="68" cy="75" r="4" fill="#0B1310" stroke="#34D399" stroke-width="2.5" />
  <circle cx="84" cy="82" r="3.5" fill="#0B1310" stroke="#34D399" stroke-width="2" />
  <circle cx="132" cy="75" r="4" fill="#0B1310" stroke="#34D399" stroke-width="2.5" />
  <circle cx="116" cy="82" r="3.5" fill="#0B1310" stroke="#34D399" stroke-width="2" />
  <circle cx="100" cy="132" r="4.5" fill="#0B1310" stroke="#10B981" stroke-width="2.5" />

  <circle class="node-pulse-anim" cx="100" cy="114" r="10" fill="url(#emeraldChampionGrad)" stroke="#A7F3D0" stroke-width="2" filter="url(#championBlur)" />

  <path d="M 82 52 L 88 40 L 94 48 L 100 36 L 106 48 L 112 40 L 118 52" fill="none" stroke="url(#goldHighlight)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#championBlur)" />
</svg>`,

  // 10. Merge Legend (25 PRs)
  'merge-master-25': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="mergeLegendEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6EE7B7" />
      <stop offset="50%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="mergeLegendGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082" />
      <stop offset="50%" stop-color="#FFB300" />
      <stop offset="100%" stop-color="#FF8F00" />
    </linearGradient>
    <linearGradient id="mergeLegendTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5EEAD4" />
      <stop offset="100%" stop-color="#14B8A6" />
    </linearGradient>
    <radialGradient id="mergeLegendGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.3" />
      <stop offset="70%" stop-color="#065F46" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="mergeLegendBlur">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#mergeLegendGlow)" class="glow-core" />

  <g class="orbit-outer">
    <circle cx="100" cy="100" r="86" fill="none" stroke="url(#mergeLegendEmerald)" stroke-width="2" stroke-dasharray="7 7" stroke-opacity="0.65" />
    <circle cx="100" cy="14" r="3.5" fill="#6EE7B7" />
    <circle cx="100" cy="186" r="3.5" fill="#6EE7B7" />
    <circle cx="14" cy="100" r="2.5" fill="#10B981" />
    <circle cx="186" cy="100" r="2.5" fill="#10B981" />
  </g>

  <g class="orbit-inner">
    <circle cx="100" cy="100" r="72" fill="none" stroke="url(#mergeLegendTeal)" stroke-width="1.5" stroke-dasharray="30 20" stroke-opacity="0.5" />
  </g>

  <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#11121F" stroke="#1E293B" stroke-width="3" />
  <polygon points="100,40 150,66 150,134 100,160 50,134 50,66" fill="none" stroke="url(#mergeLegendEmerald)" stroke-width="1.5" stroke-opacity="0.75" />

  <path d="M 65 70 C 65 70, 70 85, 85 95 L 100 105" fill="none" stroke="url(#mergeLegendEmerald)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 135 70 C 135 70, 130 85, 115 95 L 100 105" fill="none" stroke="url(#mergeLegendEmerald)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 100 105 L 100 140 M 90 130 L 100 140 L 110 130" fill="none" stroke="url(#mergeLegendGold)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#mergeLegendBlur)" />

  <circle cx="65" cy="70" r="5" fill="#6EE7B7" opacity="0.9" />
  <circle cx="135" cy="70" r="5" fill="#6EE7B7" opacity="0.9" />
  <circle cx="100" cy="105" r="6" fill="url(#mergeLegendGold)" filter="url(#mergeLegendBlur)" />

  <path d="M 82 60 L 88 48 L 94 56 L 100 44 L 106 56 L 112 48 L 118 60" fill="none" stroke="url(#mergeLegendGold)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#mergeLegendBlur)" />

  <text x="100" y="88" text-anchor="middle" dominant-baseline="middle" fill="url(#mergeLegendGold)" font-size="16" font-weight="bold" font-family="monospace" opacity="0.85">25</text>
  <polygon class="sparkle-a" points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63" fill="#6EE7B7" transform="translate(-38, -22) scale(0.5)" />
  <polygon class="sparkle-b" points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63" fill="#FFE082" transform="translate(38, 32) scale(0.5)" />
</svg>`,

  // 11. Week Warrior (7-day streak)
  'streak-7': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#EA580C" />
      <stop offset="60%" stop-color="#F97316" />
      <stop offset="100%" stop-color="#FDE047" />
    </linearGradient>
    <linearGradient id="orangeRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F97316" />
      <stop offset="100%" stop-color="#C2410C" />
    </linearGradient>
    <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F97316" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="fireBlur">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#fireGlow)" class="glow-core" />

  <g class="orbit-outer-fast">
    <circle cx="100" cy="100" r="84" fill="none" stroke="url(#orangeRingGrad)" stroke-width="2" stroke-dasharray="10 8" stroke-opacity="0.65" />
    <circle cx="100" cy="16" r="3" fill="#F97316" />
    <circle cx="100" cy="184" r="3" fill="#F97316" />
  </g>

  <g class="orbit-inner-fast">
    <circle cx="100" cy="100" r="70" fill="none" stroke="#FDBA74" stroke-width="1.5" stroke-dasharray="40 20" stroke-opacity="0.45" />
  </g>

  <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#1A1310" stroke="#1E293B" stroke-width="3" />
  <polygon points="100,42 148,68 148,132 100,158 52,132 52,68" fill="none" stroke="url(#orangeRingGrad)" stroke-width="1.5" stroke-opacity="0.8" />

  <path class="flame-anim" d="M 100 135 C 75 135 70 105 85 85 C 70 100 80 120 90 105 C 80 80 100 50 100 50 C 100 50 120 80 110 105 C 120 120 130 100 115 85 C 130 105 125 135 100 135 Z" fill="url(#fireGrad)" filter="url(#fireBlur)" />
</svg>`,

  // 12. Month Master (30-day streak)
  'streak-30': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="monthFireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#EA580C" />
      <stop offset="40%" stop-color="#F97316" />
      <stop offset="80%" stop-color="#FB923C" />
      <stop offset="100%" stop-color="#FEF08A" />
    </linearGradient>
    <linearGradient id="monthGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <radialGradient id="monthGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#EA580C" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="monthBlur">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#monthGlow)" class="glow-core" />

  <g class="orbit-outer">
    <polygon points="100,10 178,55 178,145 100,190 22,145 22,55" fill="none" stroke="url(#monthGoldGrad)" stroke-width="2.0" stroke-dasharray="12 10" stroke-opacity="0.65" />
    <circle cx="100" cy="10" r="3.5" fill="#F59E0B" />
    <circle cx="178" cy="55" r="3.5" fill="#F59E0B" />
    <circle cx="178" cy="145" r="3.5" fill="#F59E0B" />
    <circle cx="100" cy="190" r="3.5" fill="#F59E0B" />
    <circle cx="22" cy="145" r="3.5" fill="#F59E0B" />
    <circle cx="22" cy="55" r="3.5" fill="#F59E0B" />
  </g>

  <g class="orbit-inner">
    <circle cx="100" cy="100" r="72" fill="none" stroke="#FED7AA" stroke-width="1.5" stroke-dasharray="30 25 15 25" stroke-opacity="0.5" />
  </g>

  <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#1E140F" stroke="#1E293B" stroke-width="3.5" />
  <polygon points="100,40 150,66 150,134 100,160 50,134 50,66" fill="none" stroke="url(#monthGoldGrad)" stroke-width="1.5" stroke-opacity="0.8" />

  <circle class="sparkle-a" cx="70" cy="130" r="2" fill="#FDBA74" opacity="0.6" />
  <circle class="sparkle-b" cx="130" cy="130" r="2.5" fill="#FDBA74" opacity="0.4" />

  <path d="M 85 130 C 70 130 65 105 78 90 C 70 100 75 115 82 105 C 75 85 90 70 90 70 C 90 70 100 88 95 108 C 100 118 105 105 98 92 C 105 108 100 130 85 130 Z" fill="url(#monthFireGrad)" opacity="0.85" />
  <path d="M 115 130 C 100 130 95 108 102 92 C 95 105 100 118 105 108 C 100 88 110 70 110 70 C 110 70 125 85 118 105 C 125 115 130 100 122 90 C 135 105 130 130 115 130 Z" fill="url(#monthFireGrad)" opacity="0.85" />
  <path class="flame-anim" d="M 100 135 C 72 135 68 105 82 82 C 68 98 78 118 88 102 C 78 75 100 42 100 42 C 100 42 122 75 112 102 C 122 118 132 98 118 82 C 132 105 128 135 100 135 Z" fill="url(#monthFireGrad)" filter="url(#monthBlur)" />

  <path d="M 88 44 L 92 50 L 100 40 L 108 50 L 112 44 L 106 54 L 94 54 Z" fill="url(#monthGoldGrad)" />

  <text x="100" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="950" fill="#0A0B10" text-anchor="middle" opacity="0.85">30</text>
</svg>`,

  // 13. Perfect Score
  'perfect-score': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="goldSealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="40%" stop-color="#FACC15" />
      <stop offset="80%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#A16207" />
    </linearGradient>
    <linearGradient id="goldNeon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="100%" stop-color="#FACC15" />
    </linearGradient>
    <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#EAB308" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="goldBlur">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#goldGlow)" class="glow-core" />

  <g class="orbit-outer">
    <polygon points="100,10 178,55 178,145 100,190 22,145 22,55" fill="none" stroke="url(#goldSealGrad)" stroke-width="2" stroke-dasharray="10 12" stroke-opacity="0.65" />
    <circle cx="100" cy="10" r="3.5" fill="#FACC15" />
    <circle cx="100" cy="190" r="3.5" fill="#FACC15" />
  </g>

  <g class="orbit-inner">
    <circle cx="100" cy="100" r="74" fill="none" stroke="url(#goldNeon)" stroke-width="1.5" stroke-dasharray="50 30" stroke-opacity="0.45" />
  </g>

  <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#1A180F" stroke="#1E293B" stroke-width="3.5" />
  <polygon points="100,40 150,66 150,134 100,160 50,134 50,66" fill="none" stroke="url(#goldSealGrad)" stroke-width="1.5" stroke-opacity="0.8" />

  <circle class="sparkle-a" cx="70" cy="130" r="2" fill="#FEF08A" opacity="0.6" />
  <circle class="sparkle-b" cx="130" cy="130" r="2.5" fill="#FEF08A" opacity="0.4" />

  <circle cx="100" cy="104" r="38" fill="none" stroke="url(#goldSealGrad)" stroke-width="3" stroke-dasharray="8 8" stroke-opacity="0.75" />
  <circle cx="100" cy="104" r="28" fill="#292518" stroke="url(#goldNeon)" stroke-width="1.5" stroke-opacity="0.45" />

  <path d="M 82 104 L 94 116 L 122 86" fill="none" stroke="url(#goldNeon)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" filter="url(#goldBlur)" />
  <path d="M 85 45 L 90 52 L 100 42 L 110 52 L 115 45 L 110 58 L 90 58 Z" fill="url(#goldNeon)" stroke="#EAB308" stroke-width="1.5" stroke-linejoin="round" />
</svg>`,

  // 14. Early Adopter
  'early-adopter': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="cyberCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22D3EE" />
      <stop offset="50%" stop-color="#06B6D4" />
      <stop offset="100%" stop-color="#0891B2" />
    </linearGradient>
    <linearGradient id="cyberIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>
    <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#94A3B8" />
    </linearGradient>
    <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#EF4444" stop-opacity="0" />
      <stop offset="50%" stop-color="#F97316" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#FBBF24" stop-opacity="1" />
    </linearGradient>
    <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#0B0C10" stop-opacity="0" />
    </radialGradient>
    <filter id="cyanBlur">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#portalGlow)" class="glow-core" />

  <g class="orbit-outer">
    <circle cx="100" cy="100" r="85" fill="none" stroke="url(#cyberCyan)" stroke-width="2" stroke-dasharray="15 10 5 10" stroke-opacity="0.75" />
    <circle cx="100" cy="15" r="3.5" fill="#22D3EE" />
    <circle cx="15" cy="100" r="3.5" fill="#22D3EE" />
    <circle cx="100" cy="185" r="3.5" fill="#22D3EE" />
    <circle cx="185" cy="100" r="3.5" fill="#22D3EE" />
  </g>

  <g class="orbit-inner">
    <circle cx="100" cy="100" r="72" fill="none" stroke="url(#cyberIndigo)" stroke-width="1.5" stroke-dasharray="40 25 15 25" stroke-opacity="0.5" />
  </g>

  <polygon points="100,35 150,60 150,140 100,165 50,140 50,60" fill="#0F172A" stroke="url(#cyberCyan)" stroke-width="2.5" filter="url(#cyanBlur)" />

  <path class="sparkle-a" d="M 68 55 L 70 58 L 73 55 L 70 52 Z" fill="#22D3EE" />
  <path class="sparkle-b" d="M 132 55 L 134 58 L 137 55 L 134 52 Z" fill="#22D3EE" />

  <g class="rocket-anim">
    <path class="rocket-flame-anim" d="M 92 125 L 100 155 L 108 125 Z" fill="url(#flameGrad)" />
    <path d="M 95 125 L 100 145 L 105 125 Z" fill="#FBBF24" />
    <path d="M 75 120 C 75 120, 80 125, 90 120 L 90 95 Z" fill="url(#cyberIndigo)" stroke="url(#cyberCyan)" stroke-width="1" />
    <path d="M 125 120 C 125 120, 120 125, 110 120 L 110 95 Z" fill="url(#cyberIndigo)" stroke="url(#cyberCyan)" stroke-width="1" />
    <path d="M 90 120 L 90 85 C 90 65, 100 50, 100 50 C 100 50, 110 65, 110 85 L 110 120 Z" fill="url(#rocketGrad)" stroke="#475569" stroke-width="1.5" />
    <circle cx="100" cy="85" r="6" fill="#0F172A" stroke="url(#cyberCyan)" stroke-width="1.5" />
    <circle cx="98" cy="83" r="1.5" fill="#FFFFFF" opacity="0.8" />
    <path d="M 93 70 C 97 60, 100 52, 100 52 C 100 52, 103 60, 107 70 Z" fill="url(#cyberCyan)" />
  </g>
</svg>`,

  // 15. Verified Contributor (POW-1)
  'pow-1': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="powEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="powMint" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A7F3D0" />
      <stop offset="100%" stop-color="#34D399" />
    </linearGradient>
    <radialGradient id="powGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="powBlur">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#powGlow)" class="glow-core" />

  <g class="orbit-outer-fast">
    <circle cx="100" cy="100" r="84" fill="none" stroke="url(#powEmerald)" stroke-width="2" stroke-dasharray="10 8" stroke-opacity="0.65" />
    <circle cx="100" cy="16" r="3.5" fill="#34D399" />
    <circle cx="100" cy="184" r="3.5" fill="#34D399" />
  </g>

  <g class="orbit-inner-fast">
    <circle cx="100" cy="100" r="70" fill="none" stroke="#A7F3D0" stroke-width="1.5" stroke-dasharray="40 20" stroke-opacity="0.45" />
  </g>

  <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#111E18" stroke="#1E293B" stroke-width="3" />
  <polygon points="100,42 148,68 148,132 100,158 52,132 52,68" fill="none" stroke="url(#powEmerald)" stroke-width="1.5" stroke-opacity="0.8" />

  <path d="M 80 102 L 94 116 L 124 84" fill="none" stroke="url(#powMint)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#powBlur)" />
  <path d="M 94 116 L 94 135" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" opacity="0.75" />
</svg>`,

  // 16. Impact Maker (POW-10)
  'pow-10': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="impactCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22D3EE" />
      <stop offset="100%" stop-color="#0891B2" />
    </linearGradient>
    <linearGradient id="impactBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <radialGradient id="impactGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="impactBlur">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#impactGlow)" class="glow-core" />

  <g class="orbit-outer">
    <polygon points="100,12 176,56 176,144 100,188 24,144 24,56" fill="none" stroke="url(#impactCyan)" stroke-width="2" stroke-dasharray="8 10" stroke-opacity="0.65" />
  </g>

  <g class="orbit-inner">
    <circle cx="100" cy="100" r="72" fill="none" stroke="url(#impactBlue)" stroke-width="1.5" stroke-dasharray="40 20" stroke-opacity="0.5" />
  </g>

  <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#0F1B1F" stroke="#1E293B" stroke-width="3.5" />
  <polygon points="100,40 150,66 150,134 100,160 50,134 50,66" fill="none" stroke="url(#impactCyan)" stroke-width="1.5" stroke-opacity="0.8" />

  <circle class="sparkle-a" cx="65" cy="55" r="2" fill="#22D3EE" opacity="0.6" />
  <circle class="sparkle-b" cx="135" cy="55" r="2.5" fill="#22D3EE" opacity="0.4" />

  <path d="M 68 105 L 82 119 L 110 89" fill="none" stroke="#3B82F6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.8" />
  <path d="M 85 97 L 98 111 L 132 75" fill="none" stroke="url(#impactCyan)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" filter="url(#impactBlur)" />
  <path d="M 88 44 L 92 50 L 100 40 L 108 50 L 112 44 L 106 54 L 94 54 Z" fill="url(#impactCyan)" stroke="#0891B2" stroke-width="1" />
</svg>`,

  // 17. FirstMate Mentor
  'firstmate-mentor': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="aiIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7" />
      <stop offset="50%" stop-color="#6366F1" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
    <linearGradient id="aiCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0E7FF" />
      <stop offset="50%" stop-color="#A5B4FC" />
      <stop offset="100%" stop-color="#38BDF8" />
    </linearGradient>
    <linearGradient id="aiCore" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F472B6" />
      <stop offset="50%" stop-color="#C084FC" />
      <stop offset="100%" stop-color="#60A5FA" />
    </linearGradient>
    <radialGradient id="aiGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.32" />
      <stop offset="60%" stop-color="#3B82F6" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#0B0C10" stop-opacity="0" />
    </radialGradient>
    <filter id="aiNeonBlur">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#aiGlow)" class="glow-core" />

  <g class="orbit-outer">
    <circle cx="100" cy="100" r="85" fill="none" stroke="url(#aiIndigo)" stroke-width="2" stroke-dasharray="12 8" stroke-opacity="0.75" />
    <circle cx="100" cy="15" r="3.5" fill="#38BDF8" />
    <circle cx="100" cy="185" r="3.5" fill="#C084FC" />
  </g>

  <g class="orbit-inner">
    <circle cx="100" cy="100" r="72" fill="none" stroke="url(#aiCyan)" stroke-width="1.5" stroke-dasharray="36 18" stroke-opacity="0.5" />
    <circle cx="28" cy="100" r="2.5" fill="#A855F7" />
    <circle cx="172" cy="100" r="2.5" fill="#38BDF8" />
  </g>

  <polygon points="100,34 156,66 156,134 100,166 44,134 44,66" fill="#10111A" stroke="#1E2033" stroke-width="3" />
  <polygon points="100,41 149,69 149,131 100,159 51,131 51,69" fill="none" stroke="url(#aiIndigo)" stroke-width="1.5" stroke-opacity="0.85" />

  <path d="M 72 82 Q 80 62 100 62 Q 120 62 128 82 Q 138 98 126 116 Q 116 128 100 138 Q 84 128 74 116 Q 62 98 72 82 Z" fill="none" stroke="url(#aiCyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#aiNeonBlur)" />

  <g class="brain-anim">
    <circle cx="100" cy="98" r="14" fill="url(#aiCore)" opacity="0.95" />
    <circle cx="100" cy="98" r="7" fill="#FFFFFF" opacity="0.9" filter="url(#aiNeonBlur)" />
  </g>
</svg>`,

  // 18. Curator
  'curator': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bookmarkBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <linearGradient id="curatorPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC" />
      <stop offset="100%" stop-color="#7C3AED" />
    </linearGradient>
    <radialGradient id="bookmarkGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#12131C" stop-opacity="0" />
    </radialGradient>
    <filter id="bookmarkBlur">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>${commonStyles}</style>
  </defs>

  <circle cx="100" cy="100" r="82" fill="url(#bookmarkGlow)" class="glow-core" />

  <g class="orbit-outer">
    <circle cx="100" cy="100" r="84" fill="none" stroke="url(#bookmarkBlue)" stroke-width="2" stroke-dasharray="10 8" stroke-opacity="0.65" />
    <circle cx="100" cy="16" r="3" fill="#60A5FA" />
    <circle cx="100" cy="184" r="3" fill="#60A5FA" />
  </g>

  <g class="orbit-inner">
    <circle cx="100" cy="100" r="70" fill="none" stroke="url(#curatorPurple)" stroke-width="1.5" stroke-dasharray="40 20" stroke-opacity="0.45" />
  </g>

  <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#10151E" stroke="#1E293B" stroke-width="3" />
  <polygon points="100,42 148,68 148,132 100,158 52,132 52,68" fill="none" stroke="url(#bookmarkBlue)" stroke-width="1.5" stroke-opacity="0.8" />

  <path d="M 82 50 L 118 50 L 118 135 L 100 120 L 82 135 Z" fill="none" stroke="url(#bookmarkBlue)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
  <polygon class="node-pulse-anim" points="100,82 108,95 100,108 92,95" fill="#60A5FA" filter="url(#bookmarkBlur)" />
</svg>`
};

let count = 0;
for (const [id, svgContent] of Object.entries(badges)) {
  const filePath = path.join(outDir, `${id}.svg`);
  fs.writeFileSync(filePath, svgContent.trim());
  count++;
}

console.log(`Successfully generated ${count} animated badge SVGs in ${outDir}`);
