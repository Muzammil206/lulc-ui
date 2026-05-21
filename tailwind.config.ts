import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['"Plus Jakarta Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        canvas:    '#F7F5F2',
        surface:   '#FFFFFF',
        raised:    '#F7F5F2',
        sunken:    '#EDE9E3',
        border:    '#DDD9D1',
        border2:   '#C9C4BA',
        line:      '#EDE9E3',
        ink:       '#1A1714',
        sub:       '#4B4540',
        muted:     '#9E9890',
        ghost:     '#BCB8B0',
        teal:      '#0F7B6C',
        'teal-2':  '#0D6B5E',
        'teal-bg': '#EBF5F3',
        'teal-bd': '#A8D9D3',
        forest:    '#16A34A',
        'forest-bg':'#F0FDF4',
        crop:      '#CA8A04',
        'crop-bg': '#FEFCE8',
        urban:     '#DC2626',
        'urban-bg':'#FEF2F2',
        water:     '#2563EB',
        'water-bg':'#EFF6FF',
        bare:      '#78716C',
        'bare-bg': '#F5F5F4',
      },
      borderRadius: {
        xs:'4px', sm:'6px', md:'10px', lg:'14px', xl:'20px',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(26,23,20,0.07), 0 1px 2px rgba(26,23,20,0.04)',
        panel: '0 4px 16px rgba(26,23,20,0.09), 0 1px 4px rgba(26,23,20,0.05)',
        float: '0 8px 32px rgba(26,23,20,0.11), 0 2px 8px rgba(26,23,20,0.07)',
        teal:  '0 0 0 3px rgba(15,123,108,0.12)',
        input: 'inset 0 1px 2px rgba(26,23,20,0.05)',
      },
      keyframes: {
        up:   { from:{ opacity:'0', transform:'translateY(8px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        'in': { from:{ opacity:'0' }, to:{ opacity:'1' } },
        spin: { to:{ transform:'rotate(360deg)' } },
        beat: { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'0.3' } },
        shimmer: {
          '0%':   { backgroundPosition:'-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
      },
      animation: {
        up:        'up 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'in 0.25s ease forwards',
        spin:      'spin 0.7s linear infinite',
        beat:      'beat 1.2s ease-in-out infinite',
        shimmer:   'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
} satisfies Config