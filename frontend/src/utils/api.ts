const BACKEND_URL = 'http://localhost:8000';

export async function postData(endpoint: string, body: any) {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(errorData.detail || 'Request failed');
  }
  return res.ok ? res.json() : null;
}

export async function getData(endpoint: string) {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(errorData.detail || 'Request failed');
  }
  return res.json();
}
