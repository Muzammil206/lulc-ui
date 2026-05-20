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
        // Warm neutral base — light theme
        canvas:   '#F7F5F2',   // warm off-white page bg
        surface:  '#FFFFFF',   // card / panel surfaces
        raised:   '#F2EFE9',   // slightly raised element bg
        sunken:   '#EAE6DF',   // input bg, subtle inset
        border:   '#DDD9D1',   // default border
        border2:  '#C9C4BA',   // stronger border
        line:     '#E8E4DC',   // hairline separator

        // Text
        ink:      '#1A1714',   // primary text
        sub:      '#6B6560',   // secondary text
        muted:    '#9E9890',   // tertiary / placeholder
        ghost:    '#BCB8B0',   // very faint text

        // Accent — earthy teal, works in light context
        teal:     '#0F7B6C',
        'teal-2': '#12937F',
        'teal-bg':'#EBF5F3',
        'teal-bd':'#B3DDD7',

        // LULC semantic colours — clear, accessible
        forest:   '#16A34A',
        'forest-bg': '#F0FDF4',
        crop:     '#CA8A04',
        'crop-bg':  '#FEFCE8',
        urban:    '#DC2626',
        'urban-bg': '#FEF2F2',
        water:    '#2563EB',
        'water-bg': '#EFF6FF',
        bare:     '#78716C',
        'bare-bg':  '#F5F5F4',

        // Status
        success:  '#16A34A',
        warn:     '#D97706',
        danger:   '#DC2626',
      },
      borderRadius: {
        xs: '4px', sm: '6px', md: '10px',
        lg: '14px', xl: '20px', '2xl': '28px',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(26,23,20,0.08), 0 1px 2px rgba(26,23,20,0.05)',
        panel: '0 4px 16px rgba(26,23,20,0.10), 0 1px 4px rgba(26,23,20,0.06)',
        float: '0 8px 32px rgba(26,23,20,0.12), 0 2px 8px rgba(26,23,20,0.08)',
        input: '0 1px 2px rgba(26,23,20,0.06) inset',
        teal:  '0 0 0 3px rgba(15,123,108,0.15)',
      },
      keyframes: {
        'up': {
          '0%':   { opacity:'0', transform:'translateY(8px)' },
          '100%': { opacity:'1', transform:'translateY(0)' },
        },
        'in': { '0%':{ opacity:'0' }, '100%':{ opacity:'1' } },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        spin: { to: { transform: 'rotate(360deg)' } },
        beat: { '0%,100%':{ opacity:1 }, '50%':{ opacity:0.3 } },
      },
      animation: {
        up:      'up 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'in 0.25s ease forwards',
        shimmer: 'shimmer 2s infinite linear',
        spin:    'spin 0.7s linear infinite',
        beat:    'beat 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
