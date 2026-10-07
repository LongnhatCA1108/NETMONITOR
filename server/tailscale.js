// ponytail: Native Tailscale API v2 client using standard Node fetch (zero npm dependencies)
// Handles sync, status detection, and smart node categorization

/**
 * Fetches all devices from Tailscale Control Plane API
 * @param {string} apiKey - Tailscale Personal API Key (tskey-api-...)
 * @param {string} tailnet - Tailnet organization identifier (e.g. 'user@gmail.com' or 'your-tailnet.ts.net' or '-')
 */
async function fetchTailscaleDevices(apiKey, tailnet) {
  if (!apiKey || !tailnet) {
    throw new Error('Thiếu TAILSCALE_API_KEY hoặc TAILSCALE_TAILNET');
  }

  const cleanKey = apiKey.trim();
  const cleanTailnet = tailnet.trim();

  const url = `https://api.tailscale.com/api/v2/tailnet/${encodeURIComponent(cleanTailnet)}/devices?fields=all`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${cleanKey}`,
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    let parsedMsg = errorBody;
    try {
      const errJson = JSON.parse(errorBody);
      parsedMsg = errJson.message || errorBody;
    } catch {}
    throw new Error(`Tailscale API error (${res.status} ${res.statusText}): ${parsedMsg}`);
  }

  const data = await res.json();
  const rawDevices = Array.isArray(data.devices) ? data.devices : [];

  return rawDevices.map(d => {
    // Lấy IPv4 Tailscale (100.x.y.z)
    const ipv4 = (d.addresses || []).find(ip => ip.startsWith('100.')) || (d.addresses && d.addresses[0]) || '100.64.0.1';

    // Tính trạng thái Online: lastSeen trong vòng 3 phút
    const lastSeenTime = d.lastSeen ? new Date(d.lastSeen).getTime() : 0;
    const isOnline = (Date.now() - lastSeenTime) < (3 * 60 * 1000) ? 1 : 0;

    // Phân loại Node thông minh: monitor, server, endpoint
    const tags = Array.isArray(d.tags) ? d.tags : [];
    const hostname = (d.hostname || d.name || 'unnamed-node').split('.')[0].toLowerCase();
    const os = (d.os || 'linux').toLowerCase();

    let nodeType = 'endpoint';
    if (tags.some(t => t.includes('monitor') || t.includes('core')) || hostname.includes('hub') || hostname.includes('monitor')) {
      nodeType = 'monitor';
    } else if (
      tags.some(t => t.includes('server') || t.includes('prod') || t.includes('db') || t.includes('storage') || t.includes('k8s')) ||
      (os === 'linux' && !hostname.includes('phone') && !hostname.includes('laptop'))
    ) {
      nodeType = 'server';
    }

    return {
      node_id: d.id ? `node-${d.id}` : (d.nodeId || `node-${hostname}`),
      hostname: d.hostname || (d.name ? d.name.split('.')[0] : 'node'),
      ip: ipv4,
      os: `${d.os || 'unknown'} (${d.clientVersion || 'Tailscale'})`,
      client_version: d.clientVersion ? d.clientVersion.split('-')[0] : 'v1.78.0',
      last_seen: d.lastSeen || new Date().toISOString(),
      is_online: isOnline,
      node_type: nodeType,
      tags: tags
    };
  });
}

module.exports = {
  fetchTailscaleDevices
};
