import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import terser from "@rollup/plugin-terser";

const plugins = [
    /* terser(), */
    resolve({ jsnext: true }),
    commonjs(),
];

export default {
    input: "src/main.js",
    output: {
        file: "dist/main.js",
        format: "iife",
        name: "Honey",
    },
    plugins: plugins,
};
