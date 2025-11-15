/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
			},
			spacing: {
				// 8pt grid system
				'1': '8px',   // 1 * 8px
				'2': '16px',  // 2 * 8px
				'3': '24px',  // 3 * 8px
				'4': '32px',  // 4 * 8px
				'5': '40px',  // 5 * 8px
				'6': '48px',  // 6 * 8px
				'8': '64px',  // 8 * 8px
				'10': '80px', // 10 * 8px
				'12': '96px', // 12 * 8px
			},
			colors: {
				// Monochromatic palette
				'gray': {
					50: '#f9fafb',
					100: '#f3f4f6',
					200: '#e5e7eb',
					300: '#d1d5db',
					400: '#9ca3af',
					500: '#6b7280',
					600: '#4b5563',
					700: '#374151',
					800: '#1f2937',
					900: '#111827',
				},
				// Accent color (blue) - only for primary buttons and focus states
				'accent': {
					DEFAULT: '#2563eb', // Blue-600
					hover: '#1d4ed8',   // Blue-700
					light: '#dbeafe',   // Blue-100
				},
			},
		},
	},
	plugins: [],
};



