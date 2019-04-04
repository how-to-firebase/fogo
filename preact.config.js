export default function(config, env, helpers) {
  // https://gist.github.com/developit/08acd182a30e66eda8de01dbbe9725ba
  let babel = helpers.getLoadersByName(config, 'babel-loader')[0].rule.options;

  // this doesn't seem to work anymore:
  babel.presets[0][1].exclude.push('transform-async-to-generator', 'transform-regenerator');

  babel.plugins.push([
    'fast-async',
    {
      env: {
        log: true,
      },
      compiler: {
        promises: true,
        noRuntime: true,
      },
    },
  ]);

  // turn off uglify to see the output without breaking the build:
  // let uglify = helpers.getPluginsByName(config, 'UglifyJsPlugin')[0];
  // if (uglify) {
  // 	config.plugins.splice(uglify.index, 1);
  // }
}
