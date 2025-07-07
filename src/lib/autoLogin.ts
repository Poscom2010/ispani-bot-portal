// Utility to call the auto-login Edge Function and store session in localStorage
export async function autoLogin() {
  const EDGE_URL = "https://uufbuatrnoprynesbirw.supabase.co/functions/v1/auto-login";
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZmJ1YXRybm9wcnluZXNiaXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODA2NTQsImV4cCI6MjA2NzA1NjY1NH0.1My4PFcOcrYV6NPaRFfTEIo4bpnjZA1wx93Nh5CX3Sc";

  const res = await fetch(EDGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error("Auto-login failed");
  const data = await res.json();
  if (data.session) {
    localStorage.setItem("sb-autologin-session", JSON.stringify(data.session));
  }
  return data.session;
} 