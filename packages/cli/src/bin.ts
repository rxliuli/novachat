import { build, BuildOptions, context } from 'esbuild'
import { Argument, Command } from 'commander'
import path from 'path'
import { novachatPlugin } from './plugin'
import chalk from 'chalk'
import { cp } from 'fs/promises'
import { updateText } from './lib'

new Command()
  .addCommand(
    new Command('init')
      .addArgument(new Argument('name', 'Project name').argRequired())
      .description('Bootstrap Project')
      .action(async (name) => {
        const templateDir = path.resolve(
          __dirname,
          '../templates/plugin-template',
        )
        const toPath = path.resolve(name)
        await cp(templateDir, toPath, {
          recursive: true,
          filter: (src) => src !== path.resolve(templateDir, 'node_modules'),
        })
        console.log(chalk.green('Project initialized successfully'))
        await updateText({
          rootPath: path.resolve(name),
          rules: [
            {
              path: 'package.json',
              replaces: [['@novachat/plugin-template', name]],
            },
            {
              path: 'README.md',
              replaces: [['@novachat/plugin-template', name]],
            },
            {
              path: 'src/plugin.json',
              replaces: [['novachat.template', name]],
            },
          ],
        })
      }),
  )
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
