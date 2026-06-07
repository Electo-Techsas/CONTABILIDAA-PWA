export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f7faf9',
        ink: '#14201d',
        muted: '#64736f',
        primary: '#0f766e',
        positive: '#16794c',
        negative: '#c2410c'
      },
      boxShadow: {
        soft: '0 10px 28px rgba(20, 32, 29, 0.08)'
      }
    }
  },
  plugins: []
};
