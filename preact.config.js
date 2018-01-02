import asyncPlugin from 'preact-cli-plugin-async';
export default function(config, env, helpers) {
  asyncPlugin(config);
  
  // config.resolve.alias['preact-cli-entrypoint'] = path.resolve(__dirname, 'demo.js');
}
