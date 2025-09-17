// Browser client is embedded in index.html for Task 8 UI.
// This file remains for module loading by index.html if needed.
export class Client {
  constructor({ server_port }) { this.server_port = server_port || 3000; }
  async request({ method, params }) {
    const r = await fetch(`http://localhost:${this.server_port}/api/v1/rpc/run-rpc-method`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method_name: method, params })
    });
    const j = await r.json(); const { data, message } = j; return { message, ...data };
  }
}