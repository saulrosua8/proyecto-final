module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // Asegúrate de incluir todos los archivos relevantes
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF', // Azul oscuro
        secondary: '#9333EA', // Púrpura
        accent: '#F59E0B', // Amarillo
        background: '#F3F4F6', // Gris claro
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Fuente moderna
        serif: ['Merriweather', 'serif'], // Fuente clásica
      },
      boxShadow: {
        'custom-light': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'custom-dark': '0 4px 6px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
