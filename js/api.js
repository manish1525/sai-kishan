// ============================================================
//  Hotel New Kishan – API Helper (talks to Flask backend)
// ============================================================

const API = '/api';

async function apiGet(path) {
    const r = await fetch(API + path);
    return r.json();
}

async function apiPost(path, body) {
    const r = await fetch(API + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return r.json();
}

async function apiPut(path, body) {
    const r = await fetch(API + path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return r.json();
}

async function apiDelete(path) {
    const r = await fetch(API + path, { method: 'DELETE' });
    return r.json();
}
