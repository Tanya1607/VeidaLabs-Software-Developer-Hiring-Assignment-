import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                jiji: {
                    light: '#a5f3fc',
                    DEFAULT: '#06b6d4',
                    dark: '#0e7490',
                }
            }
        },
    },
    plugins: [],
};
export default config;
