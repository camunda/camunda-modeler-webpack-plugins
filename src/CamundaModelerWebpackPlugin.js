const defaultOptions = {
  type: '',
  propertiesPanelAlias: true,
  propertiesPanelLoader: true,
  reactAlias: true,
  reactLoader: true
};

const CONFIGURATIONS = [
  {
    key: 'propertiesPanel',
    path: './config/propertiesPanel.config.js',
    aliasFlag: 'propertiesPanelAlias',
    loaderFlag: 'propertiesPanelLoader'
  },
  {
    key: 'react',
    path: './config/react.config.js',
    aliasFlag: 'reactAlias',
    loaderFlag: 'reactLoader'
  }
];


class CamundaModelerWebpackPlugin {

  /**
   * Webpack plugin to easily configure Camunda Modeler extensions.
   *
   * @param {Object} [options]
   * @param {('propertiesPanel'|'react')} [options.type]
   * @param {boolean} [options.propertiesPanelAlias]
   * @param {boolean} [options.propertiesPanelLoader]
   * @param {boolean} [options.reactAlias]
   * @param {boolean} [options.reactLoader]
   */
  constructor(options = {}) {
    this.options = Object.assign({}, defaultOptions, options);
  }

  /**
   * @param {WebpackCompiler} compiler
   */
  apply(compiler) {
    const options = this.options;

    const {
      type,
    } = options;

    let configs = [];

    // set all as default, allow zero-config setup
    if (!type) {
      configs = CONFIGURATIONS;
    } else {
      const config = findConfig(type, CONFIGURATIONS);

      if (!config) {
        throw new Error('unknown type <' + type + '>');
      }

      configs.push(config);
    }

    // merge configs
    compiler.hooks.afterEnvironment.tap('CamundaModelerWebpackPlugin', () => {

      configs.forEach((config) => {
        const {
          path,
          aliasFlag,
          loaderFlag
        } = config;

        const alias = options[aliasFlag];
        const loader = options[loaderFlag];

        const webpackConfig = require(path)();

        // append (babel) loader
        if (loader) {
          compiler.options.module.rules.push(...webpackConfig.module.rules);
        }

        // append alias
        if (alias) {
          compiler.options.resolve.alias = {
            ...compiler.options.resolve.alias,
            ...webpackConfig.resolve.alias
          };
        }
      });
    });
  }
}

module.exports = CamundaModelerWebpackPlugin;


// helper //////////////

function findConfig(key, configs) {
  return configs.find(config => config.key === key);
}