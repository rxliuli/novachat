import { build, BuildOptions, context } from 'esbuild'
import { Command } from 'commander'
import path from 'path'
import { novachatPlugin } from './plugin'
import chalk from 'chalk'

new Command()
  .description('Build Novachat plugin with esbuild')
  .option('-w, --watch', 'Watch mode')
  .action(async ({ watch }) => {
    const options: BuildOptions = {
      platform: 'browser',
      bundle: true,
      splitting: false,
      sourcemap: 'inline',
      entryPoints: [path.resolve('src/index.ts')],
      outfile: path.resolve('dist/index.js'),
      external: ['@novachat/plugin'],
      format: 'esm',
      plugins: [novachatPlugin({ root: path.resolve() })],
    }
    if (watch) {
      options.plugins!.push({
        name: 'esbuild-plugin-log',
        setup(build) {
          build.onEnd((result) => {
            if (result.errors.length) {
              console.error(result.errors)
              return
            }
            console.log(chalk.green('Build success to ./publish/'))
          })
        },
      })
      const ctx = await context(options)
      ctx.watch()
    } else {
      await build(options)
      console.log(chalk.green('Build success to ./publish/'))
    }
  })
  .parse()
