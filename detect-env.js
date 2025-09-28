import { exec } from 'child_process';
import { promises as fs } from 'fs';
import http from 'http';

const LOG_FILE = 'build-detect.log';

async function log(message) {
  console.log(message);
  await fs.appendFile(LOG_FILE, message + '\n');
}

function runCommand(command) {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: stderr || error.message });
      } else {
        resolve({ success: true, output: stdout.trim() });
      }
    });
  });
}

async function checkNetwork() {
    return new Promise((resolve) => {
        const req = http.get('http://binaries.prisma.sh', { timeout: 5000 }, (res) => {
            res.resume(); // consume response data to free up memory
            if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve({ success: true, output: `Successfully connected. Status: ${res.statusCode}` });
            } else {
                resolve({ success: false, error: `Failed to connect. Status: ${res.statusCode}` });
            }
        });

        req.on('error', (e) => {
            resolve({ success: false, error: `Network error: ${e.message}` });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ success: false, error: 'Request timed out after 5 seconds.' });
        });
    });
}


async function main() {
  await fs.writeFile(LOG_FILE, '--- Environment Detection Log ---\n\n');

  const checks = {
    docker: await runCommand('docker --version'),
    dockerCompose: await runCommand('docker compose version'),
    node: await runCommand('node --version'),
    npm: await runCommand('npm --version'),
    openSSL: await runCommand('openssl version'),
    prismaNetwork: await checkNetwork(),
  };

  let fullModePossible = true;
  let buildMetaContent = 'Mode: **preview-mode**\n\n';
  buildMetaContent += 'Reasoning:\n';

  await log('--- Detection Results ---');
  for (const [key, result] of Object.entries(checks)) {
    if (result.success) {
      await log(`[✅ SUCCESS] ${key}: ${result.output}`);
    } else {
      await log(`[❌ FAILED] ${key}: ${result.error}`);
      fullModePossible = false;
      buildMetaContent += `- Check for '${key}' failed. This is required for full-mode.\n`;
    }
  }
  await log('-------------------------\n');

  if (fullModePossible) {
    await log('Conclusion: Environment supports full-mode.');
    buildMetaContent = 'Mode: **full-mode**\n\nReasoning: All environment checks passed successfully.';
  } else {
    await log('Conclusion: Environment does not support full-mode. Falling back to preview-mode.');
    await log('\nUsing preview database — Prisma/Postgres not available in this environment.');
  }
  
  await fs.writeFile('BUILDMETA.md', buildMetaContent);
}

main().catch(console.error);
