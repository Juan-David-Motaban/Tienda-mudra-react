// Configuración de Karma + Jasmine para las pruebas unitarias de Tienda Mudra.
//   npm test          → ejecuta todas las pruebas una vez y genera el informe de cobertura en /coverage
//   npm run test:watch → las vuelve a ejecutar cada vez que guardas un archivo
//
// Karma ejecuta las pruebas en un navegador real (Chrome sin ventana). Como las pruebas están escritas en
// JSX/ES modules, webpack + Babel las empaquetan antes de enviarlas al navegador. babel-plugin-istanbul
// instrumenta el código de src/ para medir la cobertura.
const webpack = require("webpack");

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "webpack"],

    // Un único punto de entrada que reúne todos los archivos *.spec.js / *.spec.jsx.
    files: [{ pattern: "src/testing/indice.js", watched: false }],
    preprocessors: { "src/testing/indice.js": ["webpack", "sourcemap"] },

    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      resolve: { extensions: [".js", ".jsx"] },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { targets: { chrome: "100" } }],
                ["@babel/preset-react", { runtime: "automatic" }]
              ],
              plugins: [["istanbul", { exclude: ["**/*.spec.js", "**/*.spec.jsx", "src/testing/**"] }]]
            }
          }
        ]
      },
      // Algunas librerías de pruebas esperan la variable global `process`.
      plugins: [new webpack.ProvidePlugin({ process: "process/browser.js" })],
      stats: "errors-only"
    },

    reporters: ["spec", "coverage"],
    specReporter: { suppressPassed: false, suppressSkipped: true, showSpecTiming: false },
    coverageReporter: {
      dir: "coverage",
      subdir: ".",
      reporters: [{ type: "html" }, { type: "text-summary" }, { type: "lcovonly" }]
    },

    client: { jasmine: { random: true, stopOnSpecFailure: false } },

    browsers: ["ChromeHeadlessSinSandbox"],
    customLaunchers: {
      ChromeHeadlessSinSandbox: { base: "ChromeHeadless", flags: ["--no-sandbox"] }
    },
    singleRun: true,
    restartOnFileChange: true
  });
};
