const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) {
        message = data.message;
      }
    } catch {
      
    }
    throw new Error(message);
  }

  return res.json();
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) {
        message = data.message;
      }
    } catch {
      
    }
    throw new Error(message);
  }

  return res.json();
}
