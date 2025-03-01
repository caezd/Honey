import { nodeResolve } from "@rollup/plugin-node-resolve";
/* import commonjs from "@rollup/plugin-commonjs"; */

export default {
    input: "src/main.js",
    output: {
        file: "dist/main.js",
        format: "umd",
        name: "Honey",
    },
    plugins: [nodeResolve({ browser: true })],
};
