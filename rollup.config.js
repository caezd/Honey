<<<<<<< HEAD
import { nodeResolve } from "@rollup/plugin-node-resolve";
/* import commonjs from "@rollup/plugin-commonjs"; */
=======
import { uglify } from 'rollup-plugin-uglify';
>>>>>>> 02ddcc05f22dd13d26696fdf6915ea94c69a1aa8

export default {
    input: "src/main.js",
    output: {
        file: "dist/main.js",
        format: "umd",
        name: "Honey",
    },
<<<<<<< HEAD
    plugins: [nodeResolve({ browser: true })],
=======
    external: ['jquery'],
    /* plugins: [uglify()] */
>>>>>>> 02ddcc05f22dd13d26696fdf6915ea94c69a1aa8
};
