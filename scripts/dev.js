const args = require('minimist')(process.argv.slice(2)) // 
console.log('args: ', args);
const { resolve } = require('path');
const { build } = require('esbuild');
const target = args._[0] || 'reactivity';
const format = args.f || 'global';
// // 开发环境只打包某一个
// // iife 立即执行函数(function(){})()
// // cjs module.exports
// // esm  import
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm';
const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`);
console.log('---------------: ',resolve(__dirname, `../packages/${target}/src/index.ts`));
build({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true, // 把所有包都打包到一起
    sourcemap: true,
    format: outputFormat, // 输出格式
    globalName: pkg.buildOptions.name, // 全局名称
    platform: format === 'cjs' ? 'node' : 'browser',
    watch: { // 监控文件变化
        onRebuild(error) {
            if (!error) console.log(`rebuilt~~~~`)
        }
    }
}).then(() => {
    console.log('watching~~~')
})