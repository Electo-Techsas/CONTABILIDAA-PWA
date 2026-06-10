export default {
  darkMode: 'class', 
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Estos son tus colores base
        surface: '#f7faf9',
        ink: '#14201d',
        muted: '#64736f',
        primary: '#0f766e',
        positive: '#16794c',
        negative: '#c2410c',
        // Añade estos para el modo oscuro
        dark: {
          surface: '#0f172a',
          ink: '#f8fafc',
          muted: '#94a3b8'
        }
      },
      boxShadow: {
        soft: '0 10px 28px rgba(20, 32, 29, 0.08)'
      }
    }
  },
  plugins: []
};