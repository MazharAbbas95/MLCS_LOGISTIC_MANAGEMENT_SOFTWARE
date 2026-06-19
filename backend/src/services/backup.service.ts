/**
 * MLCS Database Auto-Backup Service
 * 
 * Automatically backs up prisma/dev.db on a schedule.
 * - Keeps 30 daily backups
 * - Keeps 12 monthly backups (one per month — forever until deleted)
 * - Backups are plain .db files — open with any SQLite viewer in 10+ years
 * 
 * SQLite is one of the most stable file formats in existence.
 * It is used by NASA, the US Library of Congress, and is recommended
 * for long-term archival (https://www.sqlite.org/locrsf.html)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ── Disk Space Monitor ───────────────────────────────────────────────────────
function checkDiskSpace(): { freeGB: number; totalGB: number; percentFree: number } | null {
  try {
    // Windows: use WMIC to get disk free space
    const drive = path.resolve('prisma/dev.db').split(':')[0] + ':';
    const result = execSync(
      `wmic logicaldisk where "DeviceID='${drive}'" get FreeSpace,Size /format:csv`,
      { encoding: 'utf8', timeout: 5000 }
    );
    const lines = result.trim().split('\n').filter(l => l.includes(',') && !l.includes('FreeSpace'));
    if (lines.length > 0) {
      const parts = lines[0].trim().split(',');
      const freeBytes = parseInt(parts[1]);
      const totalBytes = parseInt(parts[2]);
      if (!isNaN(freeBytes) && !isNaN(totalBytes)) {
        return {
          freeGB: Math.round((freeBytes / 1e9) * 10) / 10,
          totalGB: Math.round((totalBytes / 1e9) * 10) / 10,
          percentFree: Math.round((freeBytes / totalBytes) * 100)
        };
      }
    }
  } catch { /* silently ignore on non-Windows or permission error */ }
  return null;
}


const DB_SOURCE = path.resolve('prisma/dev.db');
const BACKUP_ROOT = path.resolve('backups');
const DAILY_DIR = path.join(BACKUP_ROOT, 'daily');
const MONTHLY_DIR = path.join(BACKUP_ROOT, 'monthly');

const MAX_DAILY_BACKUPS = 30;

function ensureDirs() {
  [BACKUP_ROOT, DAILY_DIR, MONTHLY_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function runBackup() {
  if (!fs.existsSync(DB_SOURCE)) {
    console.warn('[Backup] Database not found at', DB_SOURCE);
    return;
  }

  ensureDirs();
  const now = new Date();
  const dateStr = formatDate(now);

  // --- Daily backup ---
  const dailyFile = path.join(DAILY_DIR, `mlcs_backup_${dateStr}.db`);
  fs.copyFileSync(DB_SOURCE, dailyFile);
  console.log(`[Backup] Daily backup saved: ${dailyFile}`);

  // Prune old daily backups (keep last 30)
  const dailyFiles = fs.readdirSync(DAILY_DIR)
    .filter(f => f.endsWith('.db'))
    .sort(); // oldest first

  while (dailyFiles.length > MAX_DAILY_BACKUPS) {
    const oldest = dailyFiles.shift()!;
    fs.unlinkSync(path.join(DAILY_DIR, oldest));
    console.log(`[Backup] Pruned old daily backup: ${oldest}`);
  }

  // --- Monthly backup (keep forever — one file per month) ---
  const monthStr = now.toISOString().substring(0, 7); // YYYY-MM
  const monthlyFile = path.join(MONTHLY_DIR, `mlcs_monthly_${monthStr}.db`);
  if (!fs.existsSync(monthlyFile)) {
    fs.copyFileSync(DB_SOURCE, monthlyFile);
    console.log(`[Backup] Monthly backup saved: ${monthlyFile}`);
  }

  console.log(`[Backup] Backup complete. Daily: ${fs.readdirSync(DAILY_DIR).length} files, Monthly: ${fs.readdirSync(MONTHLY_DIR).length} files`);

  // ── Disk Space Check ──────────────────────────────────────────────────────
  const disk = checkDiskSpace();
  if (disk) {
    if (disk.freeGB < 0.5) {
      console.error(`[DISK] ⛔ CRITICAL: Only ${disk.freeGB} GB free on drive! Server may stop working. FREE UP SPACE NOW!`);
      console.error(`[DISK] Total: ${disk.totalGB} GB | Free: ${disk.freeGB} GB (${disk.percentFree}% free)`);
    } else if (disk.freeGB < 2) {
      console.warn(`[DISK] ⚠️  WARNING: Low disk space — ${disk.freeGB} GB free. Consider freeing up space.`);
      console.warn(`[DISK] Total: ${disk.totalGB} GB | Free: ${disk.freeGB} GB (${disk.percentFree}% free)`);
    } else {
      console.log(`[Disk] ✅ Space OK — ${disk.freeGB} GB free of ${disk.totalGB} GB (${disk.percentFree}% free)`);
    }
  }
}

// Run immediately on startup
runBackup();

// Run every 24 hours (86400000 ms)
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
setInterval(runBackup, BACKUP_INTERVAL_MS);

export { runBackup };
