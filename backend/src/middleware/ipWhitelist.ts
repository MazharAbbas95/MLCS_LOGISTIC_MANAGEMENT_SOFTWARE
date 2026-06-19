import { Request, Response, NextFunction } from 'express';

/**
 * IP Whitelist Middleware
 * 
 * Allows access ONLY from:
 * 1. The server machine itself (localhost)
 * 2. Your local WiFi/LAN subnet (192.168.x.x, 10.x.x.x, 172.16.x.x)
 * 3. Any explicitly allowed IPs listed in ALLOWED_IPS env var
 *
 * All other IPs are blocked with 403.
 */

// Parse allowed IPs from environment (comma-separated)
const ALLOWED_IPS_RAW = process.env.ALLOWED_IPS || '';
const EXTRA_ALLOWED_IPS = ALLOWED_IPS_RAW
  .split(',')
  .map(ip => ip.trim())
  .filter(Boolean);

// Private/local network CIDR ranges — always allowed (LAN traffic only)
const PRIVATE_RANGES = [
  // Loopback
  /^127\.\d+\.\d+\.\d+$/,
  /^::1$/,
  // Class A private (10.0.0.0/8)
  /^10\.\d+\.\d+\.\d+$/,
  // Class B private (172.16.0.0/12)
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  // Class C private (192.168.0.0/16)
  /^192\.168\.\d+\.\d+$/,
];

function isPrivateIp(ip: string): boolean {
  const cleanIp = ip.replace(/^::ffff:/, ''); // strip IPv4-mapped IPv6 prefix
  return PRIVATE_RANGES.some(pattern => pattern.test(cleanIp));
}

function isAllowedIp(ip: string): boolean {
  const cleanIp = ip.replace(/^::ffff:/, '');
  if (isPrivateIp(cleanIp)) return true;
  if (EXTRA_ALLOWED_IPS.includes(cleanIp)) return true;
  return false;
}

export function ipWhitelistMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip for health check from localhost (used by auto-start scripts)
  if (req.path === '/api/test-ping' && req.ip?.includes('127.0.0.1')) {
    return next();
  }

  const clientIp = req.ip || req.socket.remoteAddress || '';

  if (isAllowedIp(clientIp)) {
    return next();
  }

  // Log blocked attempt
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] Blocked request from unauthorized IP: ${clientIp} → ${req.method} ${req.url} at ${timestamp}`);

  res.status(403).json({
    success: false,
    message: 'Access denied. This application is only accessible from the local network.',
  });
}
