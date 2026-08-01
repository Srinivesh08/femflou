import React from 'react';
import { motion } from 'framer-motion';

export const CartridgeIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer glow */}
      <motion.div
        className="absolute w-[320px] h-[320px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(15,118,110,0.06) 50%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Cartridge body */}
      <motion.div
        className="relative w-[220px] h-[300px] md:w-[260px] md:h-[360px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <svg
          viewBox="0 0 260 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* ─── Cartridge outer body ─── */}
          <rect x="30" y="20" width="200" height="320" rx="20" ry="20"
            fill="url(#cartridgeGrad)" stroke="url(#borderGrad)" strokeWidth="1.5" />

          {/* Inner panel */}
          <rect x="46" y="50" width="168" height="260" rx="12" ry="12"
            fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />

          {/* ─── Sample inlet port ─── */}
          <rect x="110" y="28" width="40" height="16" rx="4"
            fill="#0E7A72" stroke="#14B8A6" strokeWidth="0.8" />
          <text x="130" y="39" textAnchor="middle" fill="#5EEAD4" fontSize="6" fontFamily="Inter" fontWeight="600">
            INLET
          </text>

          {/* ─── Microfluidic channels ─── */}
          {/* Main vertical channel */}
          <motion.line x1="130" y1="44" x2="130" y2="90"
            stroke="#14B8A6" strokeWidth="2" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }} />

          {/* Branching channels */}
          <motion.path d="M130 90 Q130 100 100 105 L80 110"
            stroke="#14B8A6" strokeWidth="1.5" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1 }} />
          <motion.path d="M130 90 Q130 100 160 105 L180 110"
            stroke="#14B8A6" strokeWidth="1.5" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }} />
          <motion.path d="M130 90 L130 115"
            stroke="#14B8A6" strokeWidth="1.5" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }} />

          {/* ─── Reaction chambers (6 biomarkers) ─── */}
          {[
            { cx: 80, cy: 135, color: '#22C55E', label: 'PRO' },
            { cx: 130, cy: 130, color: '#F59E0B', label: 'GLU' },
            { cx: 180, cy: 135, color: '#06B6D4', label: 'pH' },
            { cx: 80, cy: 185, color: '#EF4444', label: 'BLD' },
            { cx: 130, cy: 180, color: '#8B5CF6', label: 'NIT' },
            { cx: 180, cy: 185, color: '#2563EB', label: 'LEU' },
          ].map((chamber, i) => (
            <g key={i}>
              {/* Connecting line from branch */}
              <motion.line
                x1={chamber.cx} y1={chamber.cy - 18}
                x2={chamber.cx} y2={chamber.cy - 10}
                stroke="#14B8A6" strokeWidth="1" strokeLinecap="round" opacity={0.5}
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 1.4 + i * 0.1 }}
              />
              {/* Chamber glow */}
              <motion.circle
                cx={chamber.cx} cy={chamber.cy} r="18"
                fill={chamber.color} opacity={0.08}
                animate={{ opacity: [0.05, 0.15, 0.05], r: [16, 20, 16] }}
                transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Chamber ring */}
              <motion.circle
                cx={chamber.cx} cy={chamber.cy} r="13"
                fill="none" stroke={chamber.color} strokeWidth="1.5"
                opacity={0.6}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.5 + i * 0.15, type: 'spring' }}
              />
              {/* Inner fill */}
              <motion.circle
                cx={chamber.cx} cy={chamber.cy} r="8"
                fill={chamber.color} opacity={0.25}
                animate={{ opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 3, delay: 2 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Label */}
              <text x={chamber.cx} y={chamber.cy + 3} textAnchor="middle"
                fill={chamber.color} fontSize="7" fontFamily="Inter" fontWeight="700" opacity={0.9}>
                {chamber.label}
              </text>
            </g>
          ))}

          {/* ─── Result zone ─── */}
          <rect x="70" y="215" width="120" height="40" rx="8"
            fill="rgba(14,122,114,0.1)" stroke="#14B8A6" strokeWidth="0.8" strokeDasharray="3 3" />
          <text x="130" y="232" textAnchor="middle" fill="#14B8A6" fontSize="7" fontFamily="Inter" fontWeight="600">
            ANALYSIS ZONE
          </text>
          <text x="130" y="245" textAnchor="middle" fill="#5EEAD4" fontSize="5.5" fontFamily="Inter" opacity={0.7}>
            Fluorescence Detection
          </text>

          {/* ─── QR code area ─── */}
          <rect x="100" y="268" width="60" height="52" rx="6"
            fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
          {/* Simplified QR grid */}
          {[0, 1, 2, 3, 4].map(r =>
            [0, 1, 2, 3, 4].map(c => (
              <rect key={`${r}-${c}`}
                x={109 + c * 8.5} y={276 + r * 8}
                width={6} height={6} rx={1}
                fill={(r + c) % 3 === 0 ? '#14B8A6' : 'rgba(255,255,255,0.05)'}
                opacity={(r + c) % 3 === 0 ? 0.5 : 0.15}
              />
            ))
          )}
          <text x="130" y="330" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="5" fontFamily="Inter">
            SCAN TO ANALYZE
          </text>

          {/* ─── Gradients ─── */}
          <defs>
            <linearGradient id="cartridgeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A3A4A" />
              <stop offset="50%" stopColor="#0F2A35" />
              <stop offset="100%" stopColor="#0A1F2A" />
            </linearGradient>
            <linearGradient id="borderGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#2563EB" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.25" />
            </linearGradient>
          </defs>
        </svg>

        {/* Light streak reflection */}
        <motion.div
          className="absolute top-0 left-[15%] w-[30%] h-full"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.02) 100%)',
            borderRadius: '20px',
          }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
};

export default CartridgeIllustration;
