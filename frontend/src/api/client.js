async function apiFetch(method, url, body) {
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const r = await fetch(url, opts);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export const getDashboardSummary = () => apiFetch('GET', '/api/dashboard/summary');
export const getTasks = () => apiFetch('GET', '/api/tasks');
export const getOrders = () => apiFetch('GET', '/api/orders');
export const getProducts = () => apiFetch('GET', '/api/products');
export const getShipments = () => apiFetch('GET', '/api/shipments');
export const getMessages = (limit = 20) => apiFetch('GET', `/api/messages?limit=${limit}`);

export const updateTaskStatus = (id, status) =>
  apiFetch('PATCH', `/api/tasks/${id}`, { status });

export const generateBriefing = () =>
  apiFetch('POST', '/api/ai/tasks/generate', {});

export const sendAlert = (payload) =>
  apiFetch('POST', '/api/alerts/send', payload);

export const sendChat = (message) =>
  apiFetch('POST', '/api/chat', { message });
