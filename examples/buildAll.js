import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

var exampleDirs = fs.readdirSync(__dirname).filter((file) => {
  return fs.statSync(path.join(__dirname, file)).isDirectory();
});

var cmdArgs = [
  { cmd: 'npm', args: ['install'] },
  { cmd: 'npm', args: ['run', 'build'] },
];

for (const dir of exampleDirs) {
  const opts = {
    cwd: path.join(__dirname, dir),
    stdio: 'inherit',
  };

  for (const cmdArg of cmdArgs) {
    const result = spawnSync(cmdArg.cmd, cmdArg.args, opts);
    if (result.status !== 0) {
      throw new Error('Building examples exited with non-zero');
    }
  }
}
