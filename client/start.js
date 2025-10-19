import { spawn } from 'child_process';

console.log('🌐 Client: http://localhost:3000');

const vite = spawn('vite', [], {
  stdio: ['inherit', 'ignore', 'inherit'],
  shell: true
});

vite.on('close', (code) => {
  process.exit(code);
});
