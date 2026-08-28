/**
 * SyncService — manages durable persistence and the local web server.
 *
 * - Persists the full workspace state to a JSON file in userData (auto-save).
 * - Serves a web client on http://<host>:<port> bound to 0.0.0.0 so the app
 *   can be accessed from any device on the LAN or, with port-forwarding/
 *   tunneling, from other networks.
 * - REST endpoints:
 *     GET  /api/state   → current workspace state
 *     POST /api/state   → replace workspace state (from web client)
 *     GET  /api/info    → { port, urls, hostname }
 *     GET  /            → web client HTML page
 */

import * as fs from "node:fs/promises";
import * as http from "node:http";
import * as https from "node:https";
import * as os from "node:os";
import * as path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import { app, logger } from "@glaze/core/backend";

function isFileNotFound(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code: string }).code === "ENOENT"
  );
}

// ── Types ────────────────────────────────────────────────────────────

export interface WorkspaceState {
  projects: unknown[];
  activeProjectId: string | null;
  mode: string;
  globalStickies: unknown[];
  lastSavedAt: number;
}

type StateChangeListener = (state: WorkspaceState) => void;

// ── Web client HTML ───────────────────────────────────────────────────

const WEB_CLIENT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Canvas — Web</title>
<style>
  /* Glaze minimalistic — matches app's styles.css + @glaze/core */
  :root { --glaze-bg-app: #ffffff; --glaze-bg-sidebar: #f8f8f7; --glaze-bg-popover: #ffffff; --glaze-bg-well: #f5f5f5; --glaze-bg-control: #f0f0f0; --glaze-border-separator: #e5e5e5; --glaze-border-secondary: #d1d1d1; --glaze-text-primary: #111111; --glaze-text-secondary: #6b6b6b; --glaze-text-tertiary: #9a9a9a; --glaze-accent: #007aff; --glaze-accent-soft: rgba(0,122,255,0.08); --bg: var(--glaze-bg-app); --surface: var(--glaze-bg-sidebar); --text: var(--glaze-text-primary); --text-dim: var(--glaze-text-secondary); --accent: var(--glaze-accent); --accent-dim: #0056d6; --border: var(--glaze-border-separator); --radius: 8px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--glaze-bg-app); color: var(--glaze-text-primary); height: 100vh; display: flex; }
  .sidebar { width: 240px; min-width: 240px; background: var(--glaze-bg-sidebar); border-right: 1px solid var(--glaze-border-separator); display: flex; flex-direction: column; }
  .sidebar-header { height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid var(--glaze-border-separator); }
  .sidebar-header h2 { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--glaze-text-tertiary); }
  .sidebar-list { flex: 1; overflow-y: auto; padding: 8px; }
  .sidebar-item { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 8px; cursor: pointer; font-size: 13px; color: var(--glaze-text-primary); border: 1px solid transparent; }
  .sidebar-item:hover { background: #efefed; }
  .sidebar-item.active { background: var(--glaze-bg-popover); border-color: var(--glaze-border-separator); box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
  header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: var(--glaze-bg-sidebar); border-bottom: 1px solid var(--glaze-border-separator); display:none; }
  .main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--glaze-bg-app); }
  .toolbar { height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; background: rgba(248,248,247,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid var(--glaze-border-separator); gap: 12px; }
  .toolbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .toolbar-title { font-size: 13px; font-weight: 600; }
  .toolbar-meta { font-size: 11px; color: var(--glaze-text-tertiary); }
  .status { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--glaze-text-tertiary); }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #00c950; }
  .dot.offline { background: #ff3b30; }
  .dot.syncing { background: #ff9500; }
  .seg { display: flex; background: #ededec; border-radius: 999px; padding: 2px; gap: 1px; }
  .seg button { border: none; background: transparent; padding: 5px 9px; border-radius: 999px; cursor: pointer; font-size: 11px; font-weight: 500; color: var(--glaze-text-secondary); }
  .seg button.active { background: var(--glaze-bg-popover); color: var(--glaze-text-primary); box-shadow: 0 1px 2px rgba(0,0,0,0.06); border: 1px solid var(--glaze-border-separator); }
  .btn { border: 1px solid transparent; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px; }
  .btn-glass { background: rgba(17,17,16,0.06); color: var(--glaze-text-primary); }
  .btn-glass:hover { background: rgba(17,17,16,0.1); }
  .btn-accent { background: var(--glaze-accent); color: white; border-color: var(--glaze-accent); }
  .btn-accent:hover { background: #0056d6; }
  .content { flex: 1; overflow-y: auto; padding: 24px; background: var(--glaze-bg-app); }
  .section { margin-bottom: 24px; }
  .section h2 { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--glaze-text-tertiary); margin-bottom: 12px; }
  .project-card { background: var(--glaze-bg-popover); border: 1px solid var(--glaze-border-separator); border-radius: 10px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
  .project-card h3 { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  .project-meta { font-size: 11px; color: var(--glaze-text-tertiary); margin-bottom: 8px; }
  .sticky-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
  .sticky { padding: 12px; border-radius: 8px; font-size: 13px; min-height: 80px; white-space: pre-wrap; word-break: break-word; border: 1px solid; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
  .sticky.yellow { background: #fef3c7; color: #78350f; border-color: #fde68a; }
  .sticky.pink { background: #fce7f3; color: #831843; border-color: #fbcfe8; }
  .sticky.blue { background: #dbeafe; color: #1e3a8a; border-color: #bfdbfe; }
  .sticky.green { background: #d1fae5; color: #064e3b; border-color: #a7f3d0; }
  .sticky.purple { background: #ede9fe; color: #4c1d95; border-color: #ddd6fe; }
  .doc-list { display: flex; flex-direction: column; gap: 8px; }
  .doc-item { background: var(--glaze-bg-popover); border: 1px solid var(--glaze-border-separator); border-radius: 10px; padding: 14px; }
  .doc-item h4 { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .doc-item p { font-size: 11px; color: var(--glaze-text-tertiary); line-height: 14px; }
  .phase-list { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
  .phase-badge { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 500; border: 1px solid transparent; }
  .phase-badge.discover { background: #eff6ff; color: #1d4ed8; border-color: #dbeafe; }
  .phase-badge.define { background: #f5f3ff; color: #6d28d9; border-color: #ede9fe; }
  .phase-badge.develop { background: #fff7ed; color: #9a3412; border-color: #ffedd5; }
  .phase-badge.deliver { background: #f0fdf4; color: #166534; border-color: #dcfce7; }
  .task-list { list-style: none; }
  .task-item { display: flex; align-items: center; gap: 8px; padding: 7px 0; font-size: 13px; border-bottom: 1px solid var(--glaze-border-separator); }
  .task-item:last-child { border-bottom: none; }
  .task-item input { accent-color: var(--glaze-accent); }
  .task-item.done span { text-decoration: line-through; color: var(--glaze-text-tertiary); }
  .notes { background: var(--glaze-bg-well); border: 1px solid var(--glaze-border-separator); border-radius: 8px; padding: 12px; font-size: 13px; min-height: 60px; white-space: pre-wrap; }
  .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; gap: 8px; }
  .empty h3 { font-size: 13px; font-weight: 600; }
  .empty p { font-size: 11px; color: var(--glaze-text-tertiary); max-width: 320px; line-height: 14px; }
  .save-bar { height: 28px; display: flex; justify-content: space-between; align-items: center; padding: 0 16px; background: var(--glaze-bg-sidebar); border-top: 1px solid var(--glaze-border-separator); font-size: 11px; color: var(--glaze-text-tertiary); }
  .save-bar strong { font-weight: 500; color: var(--glaze-text-secondary); }
  .btn-sm { background: var(--accent); color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; }
  .btn-sm:hover { background: var(--accent-dim); }
  /* Responsive */
  @media (max-width: 768px) {
    body { flex-direction: column; }
    .sidebar { width: 100% !important; min-width: 100% !important; max-height: 200px; border-right: none !important; border-bottom: 1px solid var(--border); }
    .main { flex-direction: column; }
    .toolbar { padding: 8px 12px !important; gap: 6px !important; flex-wrap: wrap; }
    .toolbar .seg { gap: 2px; }
    .toolbar .seg button { padding: 4px 6px !important; font-size: 10px !important; }
    .content { padding: 16px !important; }
    .sticky-grid, .card-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; gap: 8px !important; }
    #web-canvas { height: 400px !important; }
    .save-bar { padding: 6px 12px !important; font-size: 10px !important; flex-direction: column; gap: 4px; }
  }
  @media (max-width: 480px) {
    header { padding: 8px 12px !important; }
    header h1 { font-size: 14px !important; }
    .toolbar { padding: 6px 8px !important; }
    .content { padding: 12px !important; }
    .sticky { min-height: 60px !important; padding: 8px !important; font-size: 11px !important; }
    .doc-item { padding: 8px !important; }
    #web-canvas { height: 320px !important; }
    .sidebar { max-height: 160px !important; }
  }
  @media (min-width: 769px) and (max-width: 1024px) {
    .sidebar { width: 200px !important; min-width: 200px !important; }
    .sticky-grid, .card-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important; }
  }
  @media (min-width: 1200px) {
    .sticky-grid, .card-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important; }
    .content { padding: 24px !important; max-width: 1200px; margin: 0 auto; width: 100%; }
  }
  </style>
</head>
<body>
<div class="sidebar">
  <div class="sidebar-header"><h2>Projects</h2><span id="sidebar-count" class="toolbar-meta"></span></div>
  <div class="sidebar-list" id="sidebar-list"></div>
  <div class="sidebar-footer"><span id="sidebar-footer-text">0 projects</span><div id="user-display" style="margin-top:8px; display:flex; align-items:center; gap:6px; padding:6px 8px; background:var(--bg-well); border:1px solid var(--border-separator); border-radius:var(--radius-md);"><span id="user-avatar" style="width:20px; height:20px; border-radius:50%; background:var(--accent); color:white; display:grid; place-items:center; font-size:10px; font-weight:600;">?</span><span id="user-name" style="font-size:11px; font-weight:500;">Anonymous</span><span id="user-role" style="font-size:10px; color:var(--text-quaternary); margin-left:auto;"></span></div><div style="font-size:10px; color:var(--text-quaternary); margin-top:4px; text-align:center;">Right-click project for menu</div></div>
</div>
<div id="web-context-menu" style="position:fixed; display:none; min-width:200px; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:8px; box-shadow:var(--shadow-popover); z-index:50; padding:4px 0; font-size:13px;"></div>
<div id="web-doc-menu" style="position:fixed; display:none; min-width:200px; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:8px; box-shadow:var(--shadow-popover); z-index:50; padding:4px 0; font-size:13px;"></div>
<div class="main">
  <div class="toolbar">
    <div class="toolbar-left">
      <div class="toolbar-title" id="toolbar-title">Canvas</div>
      <span class="toolbar-meta" id="toolbar-meta"></span>
      <span class="status"><span class="dot" id="status-dot"></span><span id="status-text">Connected</span></span>
      <span class="separator" style="margin:0 8px;"></span>
      <div id="presence" style="display:flex; align-items:center; gap:6px; font-size:11px; color:var(--text-tertiary);"><span id="presence-count">● 1 online</span><span id="presence-avatars" style="display:flex; gap:3px;"></span></div>
    </div>
    <div class="toolbar-actions">
      <div class="seg" id="mode-seg"></div>
      <div class="separator"></div>
      <button class="btn btn-glass btn-icon" onclick="refresh()" title="Refresh">↻</button>
    </div>
  </div>
  <div class="content" id="content"></div>
  <div class="save-bar"><span id="last-sync">Last synced: never</span><span><strong>Auto-save</strong> • Auto-sync 500ms</span></div>
</div>
<div id="username-modal" style="position:fixed; inset:0; background:rgba(0,0,0,0.45); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); display:none; place-items:center; z-index:100;">
  <div style="background:#ffffff; color:#1d1d1f; border:1px solid rgba(0,0,0,0.1); border-radius:20px; padding:24px; width:360px; box-shadow:0 24px 48px rgba(0,0,0,0.25);">
    <h3 style="font-size:17px; font-weight:600; margin-bottom:6px; letter-spacing:-0.02em;">Welcome to Canvas</h3>
    <p style="font-size:12px; color:#666666; margin-bottom:16px; line-height:1.4;">Create a username. It will be saved forever on this device and shown on the left bottom. Your edits will be logged with this name.</p>
    <input id="username-input" placeholder="Enter username (e.g. Alex)" maxlength="24" style="width:100%; padding:10px 12px; border:1px solid #d1d1d6; border-radius:10px; font-size:13px; background:#f5f5f7; color:#1d1d1f; margin-bottom:12px; outline:none;">
    <button id="username-submit" class="btn btn-accent" style="width:100%; justify-content:center; padding:10px; border-radius:10px; font-weight:600;">Continue</button>
    <p style="font-size:10px; color:#8e8e93; margin-top:10px; text-align:center;">Stored in localStorage — clear site data to change</p>
  </div>
</div>
<script>
let state = null;
let currentProjectId = null;
let currentMode = 'canvas';
let canvasTx = 0, canvasTy = 0, canvasScale = 1;
const WEB_TABS = [
  { id: 'canvas', label: 'Canvas', enabled: true, order: 0 },
  { id: 'document', label: 'Document', enabled: true, order: 1 },
  { id: 'methodology', label: 'Method', enabled: true, order: 2 },
  { id: 'viewer', label: 'Prototype', enabled: true, order: 3 },
  { id: 'screenplay', label: 'Screenplay', enabled: true, order: 4 },
  { id: 'log', label: 'Log', enabled: false, order: 5 },
  { id: 'cad', label: 'CAD', enabled: false, order: 6 },
  { id: 'research', label: 'Research', enabled: false, order: 7 },
];
function getWebTabs(){
  try{
    const s=localStorage.getItem('canvas-web-tabs');
    if(s) return JSON.parse(s);
  }catch{}
  return JSON.parse(JSON.stringify(WEB_TABS));
}
let webTabs = getWebTabs();
let hasCompletedWebSetup = false;
try{ hasCompletedWebSetup = localStorage.getItem('canvas-web-setup') === 'true'; }catch{}
function showWebSetupIfNeeded(){
  // App default: no setup wizard dialog on startup
  hasCompletedWebSetup = true;
  try{ localStorage.setItem('canvas-web-setup', 'true'); }catch{}
}
function saveWebTabs(){ try{ localStorage.setItem('canvas-web-tabs', JSON.stringify(webTabs)); }catch{} }
function isTabEnabled(id){ const t=webTabs.find(x=>x.id===id); return t ? t.enabled : false; }
let _canvasDrag = null;
let _canvasPan = null;
let _canvasListenersAttached = false;
let syncTimeout = null;
function scheduleSync(){
  if(syncTimeout) clearTimeout(syncTimeout);
  setStatus('syncing');
  syncTimeout = setTimeout(async ()=>{ await syncNow(); syncTimeout=null; heartbeatPresence(); }, 500);
}
function getUsername(){ try{ const u=localStorage.getItem('canvas-username'); if(u) return u; }catch{} return 'Anonymous'; }
function isAdminUser(){ try{ const u=localStorage.getItem('canvas-username'); return u && u.toLowerCase()==='admin'; }catch{ return false; } }
function updateUserDisplay(){ const name=getUsername(); const el=document.getElementById('user-name'); const av=document.getElementById('user-avatar'); const role=document.getElementById('user-role'); if(el) el.textContent=name; if(av) av.textContent=name.charAt(0).toUpperCase()||'?'; if(role) role.textContent=isAdminUser()?'admin':''; if(el) el.title='Click to change username'; }
function ensureUsername(){
  const name=getUsername();
  const modal=document.getElementById('username-modal');
  if(name==='Anonymous' && modal){
    modal.style.display='grid';
    const input=document.getElementById('username-input');
    const submit=document.getElementById('username-submit');
    const save=()=>{
      const v=(input.value||'').trim();
      if(!v){ input.style.borderColor='#ff3b30'; if(input) input.focus(); return; }
      try{ localStorage.setItem('canvas-username', v); localStorage.setItem('canvas-isAdmin', String(v.toLowerCase()==='admin')); }catch{}
      modal.style.display='none';
      updateUserDisplay();
    };
    if(submit) submit.onclick=save;
    if(input){ input.onkeydown=(e)=>{ if(e.key==='Enter') save(); }; setTimeout(()=>input.focus(), 100); }
  } else {
    updateUserDisplay();
  }
  // allow clicking username to change
  const disp=document.getElementById('user-display');
  if(disp) disp.onclick=()=>{
    const cur=getUsername();
    const nv=prompt('Change username:', cur!=='Anonymous'?cur:'');
    if(nv && nv.trim()){ try{ localStorage.setItem('canvas-username', nv.trim()); localStorage.setItem('canvas-isAdmin', String(nv.trim().toLowerCase()==='admin')); }catch{} updateUserDisplay(); }
  };
}
let presenceId = null;
try{ presenceId = localStorage.getItem('canvas-client-id'); if(!presenceId){ presenceId = 'c-'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); localStorage.setItem('canvas-client-id', presenceId); } }catch{ presenceId = 'c-'+Math.random().toString(36).slice(2,7); }
async function heartbeatPresence(){
  try{
    const user=getUsername();
    const isAdmin=isAdminUser();
    await fetch('/api/presence', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: presenceId, user, isAdmin, projectId: currentProjectId }) });
  }catch{}
}
async function fetchPresence(){
  try{
    const res=await fetch('/api/presence');
    if(!res.ok) return;
    const data=await res.json();
    const countEl=document.getElementById('presence-count');
    const avEl=document.getElementById('presence-avatars');
    if(countEl) countEl.textContent='● ' + (data.count||1) + ' online' + (data.count>1 ? ' • ' + data.users.map(u=>u.user).join(', ') : '');
    if(avEl){
      avEl.innerHTML='';
      (data.users||[]).slice(0,5).forEach(u=>{
        const dot=document.createElement('span');
        dot.textContent=u.user.charAt(0).toUpperCase();
        dot.title=u.user + (u.isAdmin?' (admin)':'');
        dot.style.cssText='width:18px; height:18px; border-radius:50%; background:' + (u.isAdmin ? 'var(--accent)' : '#e5e5e3') + '; color:' + (u.isAdmin ? 'white' : 'var(--text-primary)') + '; display:grid; place-items:center; font-size:9px; font-weight:600; border:1px solid var(--border-separator);';
        avEl.appendChild(dot);
      });
      if((data.users||[]).length>5){
        const more=document.createElement('span');
        more.textContent='+' + (data.users.length-5);
        more.style.cssText='font-size:10px; color:var(--text-tertiary);';
        avEl.appendChild(more);
      }
    }
  }catch{}
}
function addChangeLog(action,targetId,targetType,targetName){
  const proj=state && state.projects ? state.projects.find(x=>x.id===currentProjectId) : null; if(!proj) return;
  if(!proj.changeLog) proj.changeLog=[];
  const user=getUsername(); const isAdmin=isAdminUser();
  proj.changeLog.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), user, isAdmin, action, targetId, targetType, targetName: targetName||targetId.slice(0,6), projectId: proj.id, projectName: proj.name, timestamp: Date.now() });
  if(proj.changeLog.length>100) proj.changeLog=proj.changeLog.slice(-100);
}
async function fetchState() {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('Failed to fetch');
    state = await res.json();
    setStatus('online');
    render();
  } catch (e) {
    setStatus('offline');
  }
}
function setStatus(s) {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  if (s === 'online') { dot.className = 'dot'; text.textContent = 'Connected'; }
  else if (s === 'syncing') { dot.className = 'dot syncing'; text.textContent = 'Syncing…'; }
  else { dot.className = 'dot offline'; text.textContent = 'Disconnected'; }
}
function setMode(m) {
  if (!isTabEnabled(m)) {
    const first = webTabs.find(t=>t.enabled);
    if (first) m = first.id;
  }
  currentMode = m;
  document.querySelectorAll('#mode-seg button').forEach(b => b.classList.toggle('active', b.dataset.mode === m));
  render();
  updateModeSeg();
}
function updateModeSeg(){
  const seg = document.getElementById('mode-seg');
  if (!seg) return;
  const enabled = webTabs.filter(t=>t.enabled).sort((a,b)=>a.order-b.order);
  seg.innerHTML = enabled.map(tab=> '<button data-mode="'+tab.id+'" class="' + (currentMode===tab.id?'active':'') + '" title="'+tab.label+'">'+tab.label+'</button>').join('') + '<button id="web-tab-config" title="Configure tabs" style="margin-left:4px; padding:4px 6px; background:var(--bg-well); border:1px solid var(--border-separator); border-radius:6px; cursor:pointer; font-size:10px;">⚙</button>';
  seg.querySelectorAll('button[data-mode]').forEach(btn=>{
    btn.addEventListener('click', ()=> setMode(btn.getAttribute('data-mode')));
  });
  const cfgBtn = document.getElementById('web-tab-config');
  if(cfgBtn) cfgBtn.addEventListener('click', ()=> openWebTabConfig());
}
function openWebTabConfig(){
  // iOS style modal configurator for tabs
  const oldModal = document.getElementById('web-tab-modal');
  if(oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'web-tab-modal';
  modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); display:grid; place-items:center; z-index:100; padding:16px;';
  
  let html = '<div style="background:var(--bg-popover, #ffffff); backdrop-filter:none; -webkit-backdrop-filter:none; border:1px solid var(--border-separator, #e5e5e5); border-radius:20px; padding:24px; width:100%; max-width:440px; box-shadow:0 24px 48px rgba(0,0,0,0.25);">'
    + '<h2 style="font-size:17px; font-weight:600; margin-bottom:4px; letter-spacing:-0.02em;">Configure Tabs</h2>'
    + '<p style="font-size:12px; color:var(--text-tertiary, #666); margin-bottom:18px;">Select tabs to enable or disable in your workspace.</p>'
    + '<div style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px; max-height:300px; overflow-y:auto;">';

  webTabs.sort((a,b)=>a.order-b.order).forEach(t => {
    html += '<label style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:var(--bg-well, #f5f5f7); border-radius:12px; cursor:pointer; font-size:13px; font-weight:500;">'
      + '<span>' + t.label + '</span>'
      + '<input type="checkbox" data-tab-id="' + t.id + '" ' + (t.enabled ? 'checked' : '') + ' style="width:18px; height:18px; accent-color:var(--accent, #007aff); cursor:pointer;">'
      + '</label>';
  });

  html += '</div><div style="display:flex; justify-content:flex-end; gap:10px;">'
    + '<button id="web-tab-cancel" class="btn" style="padding:8px 16px; border-radius:10px; background:var(--bg-well); border:none; cursor:pointer; font-size:13px; font-weight:500;">Cancel</button>'
    + '<button id="web-tab-save" class="btn" style="padding:8px 18px; border-radius:10px; background:var(--accent, #007aff); color:white; border:none; cursor:pointer; font-size:13px; font-weight:600;">Save Changes</button>'
    + '</div></div>';

  modal.innerHTML = html;
  document.body.appendChild(modal);

  modal.querySelector('#web-tab-cancel').onclick = () => modal.remove();
  modal.querySelector('#web-tab-save').onclick = () => {
    modal.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      const id = chk.getAttribute('data-tab-id');
      const tab = webTabs.find(t=>t.id===id);
      if(tab) tab.enabled = chk.checked;
    });
    if(!webTabs.some(t=>t.enabled)) webTabs[0].enabled = true;
    saveWebTabs();
    updateModeSeg();
    if(!isTabEnabled(currentMode)){
      const first = webTabs.find(t=>t.enabled);
      if(first) setMode(first.id);
    }
    modal.remove();
  };
}

function render() {
  const list = document.getElementById('sidebar-list');
  const count = document.getElementById('sidebar-count');
  const foot = document.getElementById('sidebar-footer-text');
  if (!state || !state.projects || state.projects.length === 0) {
    list.innerHTML = '<div class="empty"><h3>No projects</h3><p>Create your first project in the desktop app to start building moodboards.</p></div>';
    count.textContent = '';
    foot.textContent = '0 projects';
    document.getElementById('content').innerHTML = '<div class="empty"><h3>No project selected</h3><p>Select a project from the sidebar or create a new one in the desktop app.</p></div>';
    document.getElementById('toolbar-title').textContent = 'Canvas';
    document.getElementById('toolbar-meta').textContent = '';
    return;
  }
  if (!currentProjectId || !state.projects.find(p => p.id === currentProjectId)) {
    currentProjectId = state.activeProjectId || state.projects[0].id;
  }
  count.textContent = state.projects.length + ' projects';
  foot.textContent = state.projects.length + ' ' + (state.projects.length===1?'project':'projects');
  list.innerHTML = state.projects.map(p => '<div class="sidebar-item' + (p.id===currentProjectId?' active':'') + '" data-id="' + p.id + '"><span class="icon">◧</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(p.name) + '</span><span class="toolbar-meta">' + (p.nodes||[]).length + '</span></div>').join('');
  list.querySelectorAll('.sidebar-item').forEach(el => {
    el.addEventListener('click', () => selectProject(el.getAttribute('data-id')));
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const id = el.getAttribute('data-id');
      const proj = state.projects.find(x=>x.id===id); if(!proj) return;
      const menu = document.getElementById('web-context-menu');
      if(!menu) return;
      menu.innerHTML = '<div style="padding:6px 10px; border-bottom:1px solid var(--border-separator);"><div style="font-size:12px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(proj.name) + '</div><div style="font-size:10px; color:var(--text-tertiary);">' + proj.nodes.length + ' items • ' + (proj.documents||[]).length + ' docs</div></div>'
        + '<button data-action="rename" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>✎</span> Rename</button>'
        + '<button data-action="duplicate" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>⧉</span> Duplicate</button>'
        + '<div style="height:1px; background:var(--border-separator); margin:4px 0;"></div>'
        + '<div style="padding:4px 10px; font-size:10px; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">Share</div>'
        + '<button data-action="copy_link" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>↗</span> Copy Link</button>'
        + '<button data-action="copy_json" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>⎘</span> Copy JSON</button>'
        + '<button data-action="export" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>⬇</span> Export File…</button>'
        + '<div style="height:1px; background:var(--border-separator); margin:4px 0;"></div>'
        + '<button data-action="delete" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; color:#b12424; display:flex; gap:6px; align-items:center;"><span>✕</span> Delete</button>';
      menu.style.display='block';
      menu.style.left = Math.min(e.clientX, window.innerWidth - 210) + 'px';
      menu.style.top = Math.min(e.clientY, window.innerHeight - 280) + 'px';
      const handleAction = async (action) => {
        console.log('handleAction', action, proj.name);
        menu.style.display='none';
        if(action==='rename'){
          const name=prompt('Rename project:', proj.name);
          console.log('rename prompt result', name);
          if(name&&name.trim()){
            const newName=name.trim();
            proj.name=newName;
            console.log('renamed to', newName);
            // Update UI immediately
            const titleEl=document.getElementById('toolbar-title');
            if(titleEl) titleEl.textContent=newName;
            // Also update the sidebar item directly for immediate feedback
            const listItem = document.querySelector('.sidebar-item[data-id="'+proj.id+'"] span');
            if(listItem) listItem.textContent=newName;
            // Direct POST for immediate persistence (in addition to scheduleSync)
            fetch('/api/state', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(state) }).catch(e=>console.error(e));
            scheduleSync(); render();
          } else { console.log('rename cancelled or empty'); }
        } else if(action==='duplicate'){
          const newId = Date.now().toString(36)+Math.random().toString(36).slice(2,7);
          const copy = JSON.parse(JSON.stringify(proj));
          copy.id=newId; copy.name=proj.name+' Copy'; copy.createdAt=Date.now(); copy.changeLog=[];
          state.projects.push(copy); state.activeProjectId=newId; scheduleSync(); render();
        } else if(action==='copy_link'){
          const link = location.origin + location.pathname + '?project=' + proj.id;
          const webUrl = 'http://' + location.hostname + ':7531?project=' + proj.id;
          try{ await navigator.clipboard.writeText(link + ' Web: ' + webUrl); alert('Link copied: '+link); }catch{ prompt('Copy link:', link); }
        } else if(action==='copy_json'){
          const json=JSON.stringify(proj,null,2);
          try{ await navigator.clipboard.writeText(json); alert('Project JSON copied'); }catch{ prompt('Copy JSON:', json.slice(0,3000)); }
        } else if(action==='export'){
          const json=JSON.stringify(proj,null,2);
          const blob=new Blob([json],{type:'application/json'});
          const url=URL.createObjectURL(blob);
          const a=document.createElement('a'); a.href=url; a.download=(proj.name.replace(/[^a-z0-9]/gi,'_')+'.canvas.json'); document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        } else if(action==='delete'){
          if(confirm('Delete "'+proj.name+'"?')){ state.projects=state.projects.filter(p=>p.id!==proj.id); if(state.activeProjectId===proj.id) state.activeProjectId=(state.projects[0]&&state.projects[0].id)||null; scheduleSync(); render(); }
        }
      };
      menu.querySelectorAll('button[data-action]').forEach(btn=>{
        btn.addEventListener('click', ()=> handleAction(btn.getAttribute('data-action')));
        btn.addEventListener('mouseenter', ()=> btn.style.background='var(--bg-well)');
        btn.addEventListener('mouseleave', ()=> btn.style.background='none');
      });
      const close = (ev)=>{ if(!menu.contains(ev.target)){ menu.style.display='none'; window.removeEventListener('click', close); } };
      setTimeout(()=> window.addEventListener('click', close), 0);
    });
  });
  const p = state.projects.find(x => x.id === currentProjectId);
  if (!p) return;
  document.getElementById('toolbar-title').textContent = p.name;
  document.getElementById('toolbar-meta').textContent = p.nodes.length + ' ' + (p.nodes.length===1?'item':'items') + ' • ' + (p.documents||[]).length + ' docs';
  let html = '';
  if (currentMode === 'canvas') {
    const snapshots = p.snapshots || [];
    html += '<div class="section"><div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px;"><h2 style="margin:0">Canvas — ' + escapeHtml(p.name) + '</h2><div style="display:flex; gap:6px;"><button class="btn btn-glass" id="canvas-add-snapshot" title="Capture current view">◎ Snapshot</button><button class="btn btn-glass" id="canvas-add-sticky" title="Add sticky note">+ Sticky</button><button class="btn btn-glass" id="canvas-add-image" title="Add image from device">+ Image</button><button class="btn btn-glass" id="canvas-add-link" title="Add link">+ Link</button></div></div><div class="project-meta">' + p.nodes.length + ' items • ' + snapshots.length + ' snapshots on left • drag background to pan • scroll to zoom • drag nodes to move</div><input type="file" id="canvas-image-input" accept="image/*" style="display:none"></div>';
    html += '<div style="display:flex; gap:12px; height:560px;">';
    // Left snapshots panel
    html += '<div style="width:200px; min-width:200px; background:var(--bg-sidebar); border:1px solid var(--border-separator); border-radius:var(--radius-lg); display:flex; flex-direction:column; overflow:hidden;">';
    html += '<div style="height:36px; display:flex; align-items:center; justify-content:space-between; padding:0 10px; border-bottom:1px solid var(--border-separator);"><span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-tertiary);">Snapshots</span><span style="font-size:11px; color:var(--text-quaternary);">' + snapshots.length + '</span></div>';
    html += '<div style="flex:1; overflow-y:auto; padding:8px; display:flex; flex-direction:column; gap:8px;">';
    if (snapshots.length === 0) {
      html += '<div style="padding:16px; text-align:center;"><div style="font-size:11px; color:var(--text-tertiary);">No snapshots</div><div style="font-size:10px; color:var(--text-quaternary); margin-top:4px; line-height:12px;">Click ◎ Snapshot to capture current view. It will be fixed here on the left.</div></div>';
    } else {
      snapshots.forEach(snap => {
        html += '<div style="border:1px solid var(--border-separator); border-radius:var(--radius-md); overflow:hidden; background:var(--bg-popover); box-shadow:var(--shadow-sm);"><div class="snapshot-thumb" data-restore="' + snap.id + '" style="height:80px; background:var(--bg-well); border-bottom:1px solid var(--border-separator); cursor:pointer; position:relative; overflow:hidden; display:grid; place-items:center;">';
        if (snap.thumbnail) {
          html += '<img src="' + snap.thumbnail + '" style="width:100%; height:100%; object-fit:cover; display:block;">';
        } else {
          html += '<span style="font-size:11px; color:var(--text-tertiary);">' + snap.nodes.length + ' items • ' + Math.round((snap.viewport?.zoom||1)*100) + '%</span>';
        }
        html += '<div style="position:absolute; inset:0; background:rgba(0,0,0,0);"></div></div><div style="padding:6px 8px;"><div style="display:flex; justify-content:space-between; align-items:center; gap:4px;"><span style="font-size:11px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">' + escapeHtml(snap.name) + '</span><span style="font-size:10px; color:var(--text-quaternary);">' + new Date(snap.createdAt).toLocaleTimeString() + '</span></div><div style="display:flex; gap:4px; margin-top:6px;"><button class="btn btn-glass" data-restore="' + snap.id + '" style="flex:1; padding:4px; font-size:11px;">View</button><button class="btn btn-glass" data-rename-snap="' + snap.id + '" style="padding:4px 6px; font-size:11px;">✎</button><button class="btn btn-glass" data-delete-snap="' + snap.id + '" style="padding:4px 6px; font-size:11px; color:#b12424;">✕</button></div></div></div>';
      });
    }
    html += '</div><div style="padding:6px 8px; border-top:1px solid var(--border-separator); font-size:10px; color:var(--text-quaternary); text-align:center;">Click View to restore • Snapshots sync</div></div>';
    // Right canvas
    html += '<div style="flex:1; display:flex; flex-direction:column; min-width:0;">';
    html += '<div id="web-canvas" style="position:relative; width:100%; flex:1; overflow:hidden; background: var(--bg-well); border:1px solid var(--border-separator); border-radius:var(--radius-lg); background-image: radial-gradient(circle, var(--border-separator) 1px, transparent 1px); background-size: 20px 20px;"><div id="canvas-viewport" style="position:absolute; left:0; top:0; width:2000px; height:2000px; transform-origin:0 0;">';
    const nodes = p.nodes || [];
    const edges = p.edges || [];
    if (edges.length > 0) {
      html += '<svg style="position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none;"><g>';
      edges.forEach(e => {
        const s = nodes.find(n => n.id === e.source);
        const tt = nodes.find(n => n.id === e.target);
        if (s && tt) {
          const sx = (s.position?.x||0) + 80, sy = (s.position?.y||0) + 48, tx = (tt.position?.x||0) + 80, ty = (tt.position?.y||0) + 48;
          html += '<line x1="' + sx + '" y1="' + sy + '" x2="' + tx + '" y2="' + ty + '" stroke="var(--border-secondary)" stroke-width="1.5" />';
        }
      });
      html += '</g></svg>';
    }
    nodes.forEach(n => {
      const x = n.position?.x||0, y = n.position?.y||0;
      if (n.type === 'sticky') {
        const c = n.data?.color || 'yellow';
        html += '<div class="web-node sticky ' + c + '" data-id="' + n.id + '" data-type="sticky" style="position:absolute; left:' + x + 'px; top:' + y + 'px; width:160px; min-height:96px; cursor:grab;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><span style="font-size:8px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; opacity:0.6;">Note</span><button class="web-node-delete" data-delete="' + n.id + '" style="background:none; border:none; cursor:pointer; opacity:0.5; font-size:12px;">✕</button></div><div class="web-node-text" data-edit="' + n.id + '" style="min-height:60px; white-space:pre-wrap; word-break:break-word; cursor:text;">' + escapeHtml(n.data?.text || 'Double-click to edit...') + '</div></div>';
      } else if (n.type === 'image') {
        const src = n.data?.src || '';
        const label = n.data?.label || '';
        html += '<div class="web-node img-card" data-id="' + n.id + '" data-type="image" style="position:absolute; left:' + x + 'px; top:' + y + 'px; width:200px; cursor:grab;"><img src="' + escapeHtml(src) + '" draggable="false" style="width:100%; height:120px; object-fit:cover; display:block;"/><div style="padding:6px 8px; display:flex; justify-content:space-between; align-items:center;"><span style="font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:150px;">' + escapeHtml(label||'Image') + '</span><button class="web-node-delete" data-delete="' + n.id + '" style="background:none; border:none; cursor:pointer;">✕</button></div></div>';
      } else if (n.type === 'link') {
        html += '<div class="web-node link-card" data-id="' + n.id + '" data-type="link" style="position:absolute; left:' + x + 'px; top:' + y + 'px; width:220px; cursor:grab;"><div style="display:flex; gap:8px; align-items:center; flex:1; min-width:0;"><div style="width:28px; height:28px; background:var(--accent-soft); color:var(--accent); display:grid; place-items:center; border-radius:6px; flex-shrink:0;">↗</div><div style="flex:1; min-width:0;"><div style="font-size:12px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(n.data?.title||'Untitled') + '</div><div style="font-size:10px; color:var(--text-tertiary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(n.data?.url||'') + '</div></div></div><button class="web-node-delete" data-delete="' + n.id + '" style="background:none; border:none; cursor:pointer; flex-shrink:0;">✕</button></div>';
      }
    });
    html += '</div></div></div></div>';
    html += '<div style="margin-top:8px; display:flex; gap:6px; align-items:center; font-size:11px; color:var(--text-tertiary); flex-wrap:wrap;"><button class="btn btn-glass" id="canvas-reset-view">Reset view</button><span>Drag background to pan • Scroll to zoom • Drag nodes to move • Snapshots on left</span></div>';
    if (nodes.length === 0) {
      html += '<div class="empty" style="margin-top:12px;"><h3>Empty canvas</h3><p>Click + Sticky / + Image / + Link above to add items. They sync instantly to the desktop app.</p></div>';
    }
  } else if (currentMode === 'document') {
    const docs = p.documents || [];
    const activeDocId = p.activeDocumentId || (docs[0] && docs[0].id) || null;
    const activeDoc = docs.find(d=>d.id===activeDocId) || null;
    html += '<div style="display:flex; gap:12px; height:560px;">';
    // Lateral section - document list
    html += '<div style="width:220px; min-width:220px; background:var(--bg-sidebar); border:1px solid var(--border-separator); border-radius:var(--radius-lg); display:flex; flex-direction:column; overflow:hidden;">';
    html += '<div style="height:36px; display:flex; align-items:center; justify-content:space-between; padding:0 10px; border-bottom:1px solid var(--border-separator);"><span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-tertiary);">Text Files</span><span style="font-size:11px; color:var(--text-quaternary);">' + docs.length + '</span></div>';
    html += '<div style="padding:8px;"><button class="btn btn-accent" id="doc-add" title="Create new text file" style="width:100%; justify-content:center;"><span>+</span> New text file</button></div>';
    html += '<div style="flex:1; overflow-y:auto; padding:0 8px 8px; display:flex; flex-direction:column; gap:4px;">';
    if (docs.length===0) {
      html += '<div style="padding:16px; text-align:center; font-size:11px; color:var(--text-tertiary);">No files yet<br><span style="font-size:10px; color:var(--text-quaternary);">Create one to start</span></div>';
    } else {
      docs.forEach(d=>{
        const isActive = d.id===activeDocId;
        const preview = d.content ? extractText(d.content).slice(0,40) : 'Empty';
        html += '<div data-activate-doc="' + d.id + '" title="Open ' + escapeHtml(d.title) + '" style="padding:8px; border-radius:var(--radius-md); cursor:pointer; border:1px solid ' + (isActive ? 'var(--accent)' : 'transparent') + '; background:' + (isActive ? 'var(--bg-popover)' : 'transparent') + '; ' + (isActive ? 'box-shadow:var(--shadow-sm);' : '') + '"><div style="display:flex; align-items:center; gap:6px;"><span style="font-size:12px;">📄</span><span style="font-size:11px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">' + escapeHtml(d.title||'Untitled') + '</span>' + (isActive ? '<span style="width:6px; height:6px; border-radius:50%; background:var(--accent); flex-shrink:0;"></span>' : '') + '</div><div style="font-size:10px; color:var(--text-tertiary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px;">' + escapeHtml(preview) + '</div><div style="font-size:10px; color:var(--text-quaternary); margin-top:2px;">' + new Date(d.updatedAt||Date.now()).toLocaleDateString() + '</div></div>';
      });
    }
    html += '</div>';
    html += '<div style="padding:6px 8px; border-top:1px solid var(--border-separator); font-size:10px; color:var(--text-quaternary); text-align:center;">Click a file to navigate • ' + docs.length + ' files</div>';
    html += '</div>';
    // Main editor - current text file
    html += '<div style="flex:1; min-width:0; display:flex; flex-direction:column; overflow:hidden;">';
    if (activeDoc) {
      const text = activeDoc.content ? extractText(activeDoc.content) : '';
      html += '<div style="background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-lg); display:flex; flex-direction:column; height:100%; overflow:hidden; box-shadow:var(--shadow-sm);">';
      html += '<div style="height:40px; display:flex; align-items:center; gap:8px; padding:0 10px; border-bottom:1px solid var(--border-separator); background:var(--bg-sidebar);"><span style="font-size:12px;">📄</span><input data-rename-doc="' + activeDoc.id + '" value="' + escapeHtml(activeDoc.title) + '" title="Rename text file" style="font-size:13px; font-weight:600; border:1px solid var(--border-separator); background:var(--bg-well); flex:1; padding:4px 8px; border-radius:6px;"><span style="font-size:10px; color:var(--text-quaternary);">' + new Date(activeDoc.updatedAt||Date.now()).toLocaleTimeString() + '</span><button class="btn btn-glass" data-delete-doc="' + activeDoc.id + '" title="Delete this text file" style="padding:4px 8px; font-size:11px; color:#b12424;">Delete</button></div>';
      html += '<textarea data-edit-doc="' + activeDoc.id + '" placeholder="Start writing... (auto-saves 500ms)" title="Edit text file content" style="flex:1; width:100%; padding:16px; border:none; font-size:13px; line-height:18px; resize:none; background:var(--bg-popover); outline:none;">' + escapeHtml(text) + '</textarea>';
      html += '<div style="height:28px; display:flex; justify-content:space-between; align-items:center; padding:0 10px; border-top:1px solid var(--border-separator); background:var(--bg-sidebar); font-size:10px; color:var(--text-quaternary);"><span>' + escapeHtml(activeDoc.title) + ' • Auto-save 500ms</span><span>' + text.length + ' chars</span></div>';
      html += '</div>';
    } else {
      html += '<div style="flex:1; display:grid; place-items:center; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-lg);"><div style="text-align:center; padding:24px;"><div style="font-size:14px; font-weight:600; margin-bottom:4px;">No text file selected</div><div style="font-size:11px; color:var(--text-tertiary); margin-bottom:12px;">Select a file from the left or create a new one.</div><button class="btn btn-accent" id="doc-add-empty" title="Create new text file">+ New text file</button></div></div>';
    }
    html += '</div>';
    html += '</div>';
  } else if (currentMode === 'screenplay') {
    const screenplayText = p.documents && p.documents[0] ? extractText(p.documents[0].content) : "INT. COFFEE SHOP - DAY\n\nALEX (30s) sits by the window, typing furiously on a sleek laptop.\n\nBARISTA\n(O.S.)\nYour double espresso, Alex.\n\nALEX\nThanks. Just in time.\n\nAlex takes a sip, staring at the glowing screen.";
    html += '<div style="display:flex; flex-direction:column; height:580px; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow-sm);">';
    html += '<div style="height:48px; display:flex; align-items:center; justify-content:space-between; padding:0 16px; border-bottom:1px solid var(--border-separator); background:var(--bg-sidebar);"><div style="display:flex; align-items:center; gap:8px;"><span style="font-size:14px;">🎬</span><span style="font-size:13px; font-weight:600;">Screenplay Studio</span></div><button id="screenplay-export" class="btn btn-glass" style="font-size:12px; padding:6px 12px;">Export .Fountain</button></div>';
    html += '<div style="flex:1; display:flex; min-height:0;">';
    // Raw editor
    html += '<div style="flex:1; display:flex; flex-direction:column; border-right:1px solid var(--border-separator); background:var(--bg-well); padding:16px;">';
    html += '<div style="font-size:11px; font-weight:600; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">Fountain Raw Text</div>';
    html += '<textarea id="screenplay-textarea" placeholder="Type your screenplay..." style="flex:1; width:100%; background:var(--bg-popover); color:var(--text-primary); border:1px solid var(--border-separator); border-radius:8px; padding:12px; font-family:ui-monospace, monospace; font-size:12px; line-height:1.6; resize:none; outline:none;">' + escapeHtml(screenplayText) + '</textarea>';
    html += '</div>';
    // Preview
    html += '<div style="flex:1; display:flex; flex-direction:column; background:var(--bg-app); padding:20px; overflow-y:auto;">';
    html += '<div style="font-size:11px; font-weight:600; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">Industry Standard Formatter</div>';
    html += '<div id="screenplay-preview" style="max-width:480px; width:100%; margin:0 auto; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:12px; padding:24px; box-shadow:0 4px 12px rgba(0,0,0,0.05); font-family:ui-monospace, monospace; font-size:12px;">';
    
    // Parse fountain lines
    const lines = screenplayText.split('\n');
    lines.forEach(l => {
      const trimmed = l.trim();
      if (!trimmed) { html += '<div style="height:12px;"></div>'; return; }
      if (/^(INT|EXT|EST|INT\/EXT)\b/i.test(trimmed) || (/^[A-Z0-9\s\-\.\,\/\(\)]+$/.test(trimmed) && trimmed === trimmed.toUpperCase() && !trimmed.endsWith(':') && trimmed.length < 60)) {
        html += '<div style="font-weight:700; text-transform:uppercase; margin:16px 0 8px 0; letter-spacing:0.05em; color:var(--text-primary);">' + escapeHtml(trimmed) + '</div>';
      } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        html += '<div style="color:var(--text-tertiary); font-style:italic; text-align:center; margin:2px 0; padding-left:40px;">' + escapeHtml(trimmed) + '</div>';
      } else if (trimmed === trimmed.toUpperCase() && trimmed.length < 35 && !/[.?!]$/.test(trimmed)) {
        html += '<div style="font-weight:700; color:var(--accent); text-transform:uppercase; text-align:center; margin:14px 0 2px 0; letter-spacing:0.05em;">' + escapeHtml(trimmed) + '</div>';
      } else {
        html += '<div style="color:var(--text-primary); margin-bottom:8px; line-height:1.5;">' + escapeHtml(trimmed) + '</div>';
      }
    });

    html += '</div></div></div></div>';
    if (p.methodology) {
      const phases = p.methodology.phases || {};
      const order = ['discover','define','develop','deliver'];
      html += '<div class="section"><h2>Double Diamond Methodology</h2><div class="phase-list">';
      order.forEach(ph => {
        const pd = phases[ph];
        if (!pd) return;
        const done = (pd.tasks||[]).filter(t => t.done).length;
        const total = (pd.tasks||[]).length;
        const isActive = (p.methodology.currentPhase||'discover')===ph;
        html += '<button class="phase-badge ' + ph + '" data-set-phase="' + ph + '" style="cursor:pointer; border:none; ' + (isActive ? 'box-shadow:0 0 0 2px var(--accent); opacity:1;' : 'opacity:0.8;') + '">' + escapeHtml(pd.title) + ' (' + done + '/' + total + ')</button>';
      });
      html += '</div>';
      const cur = phases[p.methodology.currentPhase || 'discover'];
      if (cur) {
        html += '<div class="project-card"><h3>' + escapeHtml(cur.title) + '</h3><p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;line-height:18px">' + escapeHtml(cur.description) + '</p>';
        html += '<div style="display:flex; gap:6px; margin-bottom:12px;"><input id="method-new-task" placeholder="Add task..." style="flex:1; padding:6px 10px; border:1px solid var(--border-separator); border-radius:var(--radius-md); font-size:13px; background:var(--bg-well);"><button class="btn btn-accent" id="method-add-task">Add</button></div>';
        if (cur.tasks && cur.tasks.length > 0) {
          html += '<ul class="task-list">';
          cur.tasks.forEach(t => {
            html += '<li class="task-item' + (t.done ? ' done' : '') + '" style="justify-content:space-between;"><div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;"><input type="checkbox" data-phase="' + (p.methodology.currentPhase||'discover') + '" data-task="' + t.id + '" ' + (t.done ? 'checked' : '') + '><span style="flex:1; min-width:0; word-break:break-word;">' + escapeHtml(t.text) + '</span></div><button class="btn btn-glass" data-delete-task="' + t.id + '" data-phase="' + (p.methodology.currentPhase||'discover') + '" style="padding:2px 6px; font-size:11px;">✕</button></li>';
          });
          html += '</ul>';
        } else {
          html += '<p style="font-size:11px;color:var(--text-tertiary)">No tasks yet — add one above.</p>';
        }
        html += '<div style="margin-top:16px"><div style="font-size:11px;color:var(--text-tertiary);margin-bottom:6px;letter-spacing:0.06em;text-transform:uppercase;font-weight:600">Notes</div><textarea id="method-notes" data-phase="' + (p.methodology.currentPhase||'discover') + '" placeholder="Add notes for this phase... (auto-saves 500ms)" style="width:100%; min-height:80px; padding:10px; border:1px solid var(--border-separator); border-radius:var(--radius-md); font-size:13px; background:var(--bg-well); resize:vertical;">' + escapeHtml(cur.notes||'') + '</textarea></div>';
        html += '</div>';
      }
      html += '</div>';
    } else {
      html += '<div class="empty"><h3>No methodology</h3><p>Methodology data will appear here once created.</p></div>';
    }
  } else if (currentMode === 'viewer') {
    const prototypes = p.prototypes || (p.viewerModel ? [{ id: 'legacy', kind: (p.viewerModel.type||'').startsWith('image/') ? 'image' : '3d', name: p.viewerModel.name, src: p.viewerModel.src, type: p.viewerModel.type, createdAt: p.viewerModel.uploadedAt }] : []);
    html += '<div class="section"><div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;"><h2>Prototype — Website / 3D / Image</h2><div style="display:flex; gap:6px;"><button class="btn btn-glass" id="proto-add-website">+ Website</button><button class="btn btn-glass" id="proto-add-3d">+ 3D</button><button class="btn btn-glass" id="proto-add-image">+ Image</button></div></div><p style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">Add website prototypes (URL), 3D products (.OBJ/.GLTF/.GLB) or image concepts. All sync to desktop app.</p></div>';
    html += '<input type="file" id="viewer-file-input" accept=".obj,.gltf,.glb,.png,.jpg,.jpeg,.webp" style="display:none">';
    if (prototypes.length === 0) {
      html += '<div class="empty"><h3>No prototypes</h3><p>Add a website, 3D product or image concept. They sync instantly.</p><div id="viewer-drop" style="margin-top:12px; width:100%; height:200px; border:2px dashed var(--border-separator); border-radius:var(--radius-lg); display:grid; place-items:center; color:var(--text-tertiary); background:var(--bg-well);">Drop .OBJ/.GLTF/.GLB or image here, or click + buttons</div></div>';
    } else {
      html += '<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:12px;">';
      prototypes.forEach(proto=>{
        const isWebsite = proto.kind==='website';
        const isImage = proto.kind==='image' || (proto.type||'').startsWith('image/');
        const is3d = proto.kind==='3d';
        html += '<div style="border:1px solid var(--border-separator); border-radius:var(--radius-lg); overflow:hidden; background:var(--bg-popover); box-shadow:var(--shadow-sm); display:flex; flex-direction:column;">';
        html += '<div style="height:180px; background:var(--bg-well); border-bottom:1px solid var(--border-separator); overflow:hidden; position:relative;">';
        if (isWebsite) {
          html += '<iframe src="' + escapeHtml(proto.src) + '" style="width:100%; height:100%; border:0;" sandbox="allow-scripts allow-same-origin"></iframe><div style="position:absolute; inset:0; pointer-events:none;"></div>';
        } else if (isImage) {
          html += '<img src="' + proto.src + '" style="width:100%; height:100%; object-fit:contain; display:block; padding:8px;">';
        } else {
          html += '<div style="width:100%; height:100%; display:grid; place-items:center; text-align:center; padding:12px;"><div style="font-size:24px;">◈</div><div style="font-size:12px; font-weight:600; margin-top:4px;">' + escapeHtml(proto.name) + '</div><div style="font-size:11px; color:var(--text-tertiary);">' + escapeHtml(proto.type||'3d model') + ' • ' + Math.round((proto.src||'').length/1024) + ' KB</div></div>';
        }
        html += '</div>';
        html += '<div style="padding:10px;"><div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;"><div style="min-width:0; flex:1;"><div style="font-size:12px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(proto.name) + '</div><div style="font-size:10px; color:var(--text-tertiary);">' + (isWebsite?'Website': is3d?'3D Product':'Image Concept') + ' • ' + new Date(proto.createdAt).toLocaleDateString() + '</div></div><button class="btn btn-glass" data-delete-proto="' + proto.id + '" style="padding:4px 6px; font-size:11px; color:#b12424;">✕</button></div>';
        if (isWebsite) html += '<div style="font-size:11px; color:var(--text-tertiary); margin-top:6px; word-break:break-all; background:var(--bg-well); padding:6px; border-radius:6px; border:1px solid var(--border-separator); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(proto.src) + '</div>';
        html += '</div></div>';
      });
      html += '</div>';
      html += '<div id="viewer-drop" style="margin-top:12px; height:80px; border:2px dashed var(--border-separator); border-radius:var(--radius-lg); display:grid; place-items:center; color:var(--text-tertiary); background:var(--bg-well); font-size:11px;">Drop more files here</div>';
    }
  } else if (currentMode === 'cad') {
    const cads = p.cadDrawings || [];
    html += '<div class="section"><div style="display:flex; justify-content:space-between; align-items:center; gap:12px;"><h2>CAD Drawings — ' + cads.length + '</h2><button class="btn btn-accent" id="cad-upload" title="Add CAD drawing">+ Add CAD</button></div><p style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">Upload .DXF, .DWG, .PDF or images and visualize. Drag background to pan, scroll to zoom.</p></div>';
    html += '<input type="file" id="cad-file-input" accept=".dxf,.dwg,.pdf,.png,.jpg,.jpeg,.svg,.webp" style="display:none">';
    if (cads.length===0) {
      html += '<div class="empty"><h3>No CAD drawings</h3><p>Click + Add CAD to upload a drawing. Supports images, PDF, DXF, DWG (preview as image).</p><div id="cad-drop" style="margin-top:12px; height:160px; border:2px dashed var(--border-separator); border-radius:var(--radius-lg); display:grid; place-items:center; color:var(--text-tertiary); background:var(--bg-well);">Drop CAD file here</div></div>';
    } else {
      // Lateral list + viewer
      html += '<div style="display:flex; gap:12px; height:520px;">';
      html += '<div style="width:220px; min-width:220px; background:var(--bg-sidebar); border:1px solid var(--border-separator); border-radius:var(--radius-lg); display:flex; flex-direction:column; overflow:hidden;">';
      html += '<div style="height:32px; display:flex; align-items:center; justify-content:space-between; padding:0 10px; border-bottom:1px solid var(--border-separator);"><span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-tertiary);">Drawings</span><span style="font-size:11px; color:var(--text-quaternary);">' + cads.length + '</span></div>';
      html += '<div style="flex:1; overflow-y:auto; padding:8px; display:flex; flex-direction:column; gap:4px;">';
      cads.forEach(c=>{
        html += '<div data-select-cad="' + c.id + '" style="padding:8px; border-radius:8px; border:1px solid ' + (p.cadDrawings && p.cadDrawings[0] && p.cadDrawings[0].id===c.id ? 'var(--accent)' : 'transparent') + '; background:' + (p.cadDrawings && p.cadDrawings[0] && p.cadDrawings[0].id===c.id ? 'var(--bg-popover)' : 'transparent') + '; cursor:pointer; display:flex; gap:8px; align-items:center;"><span style="width:36px; height:36px; border-radius:6px; background:var(--bg-well); border:1px solid var(--border-separator); display:grid; place-items:center; font-size:12px; overflow:hidden;">' + (c.type.startsWith('image/')||c.src.startsWith('data:image') ? '<img src="'+c.src+'" style="width:100%; height:100%; object-fit:cover;">' : '◈') + '</span><span style="flex:1; min-width:0;"><span style="font-size:11px; font-weight:500; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(c.name) + '</span><span style="font-size:10px; color:var(--text-tertiary);">' + escapeHtml(c.type||'cad') + '</span></span><button data-delete-cad="' + c.id + '" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary);">✕</button></div>';
      });
      html += '</div></div>';
      // Viewer for first CAD
      const first = cads[0];
      html += '<div style="flex:1; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-lg); display:flex; flex-direction:column; overflow:hidden;">';
      html += '<div style="height:36px; display:flex; align-items:center; justify-content:space-between; padding:0 10px; border-bottom:1px solid var(--border-separator);"><span style="font-size:11px; font-weight:600;">' + escapeHtml(first.name) + '</span><span style="font-size:10px; color:var(--text-tertiary);">' + Math.round((first.src||'').length/1024) + ' KB</span></div>';
      html += '<div id="cad-viewer" style="flex:1; background:radial-gradient(circle, var(--border-separator) 1px, transparent 1px); background-size:20px 20px; background-color:var(--bg-well); display:grid; place-items:center; overflow:hidden; position:relative;"><div id="cad-zoom" style="transform-origin:center; transition:transform 0.1s;">';
      if (first.type.startsWith('image/') || first.src.startsWith('data:image')) {
        html += '<img src="' + first.src + '" style="max-width:700px; max-height:400px; object-fit:contain; box-shadow:0 8px 32px rgba(0,0,0,0.12); border-radius:8px; border:1px solid var(--border-separator); background:white;">';
      } else {
        html += '<div style="width:400px; height:300px; background:white; border:1px solid var(--border-separator); border-radius:8px; display:grid; place-items:center; box-shadow:0 8px 32px rgba(0,0,0,0.12);"><span style="font-size:12px; color:var(--text-tertiary);">CAD: ' + escapeHtml(first.name) + '<br><span style="font-size:10px;">' + escapeHtml(first.type) + '</span></span></div>';
      }
      html += '</div></div>';
      html += '<div style="height:32px; display:flex; align-items:center; justify-content:center; gap:6px; border-top:1px solid var(--border-separator);"><button class="btn btn-glass" data-cad-zoom="out" style="padding:4px 8px; font-size:11px;">− Zoom out</button><span id="cad-zoom-label" style="font-size:11px; color:var(--text-tertiary);">100%</span><button class="btn btn-glass" data-cad-zoom="in" style="padding:4px 8px; font-size:11px;">+ Zoom in</button><button class="btn btn-glass" data-cad-reset style="padding:4px 8px; font-size:11px;">Reset</button></div>';
      html += '</div>';
      html += '</div>';
    }
  } else if (currentMode === 'research') {
    const research = p.research || { qa: [], websites: [], forms: [] };
    html += '<div class="section"><h2>Research</h2><p style="font-size:11px; color:var(--text-tertiary);">Q&A transcriptions, website researches and form results — all synced.</p></div>';
    // QA
    html += '<div class="section"><div style="display:flex; justify-content:space-between; align-items:center;"><h2>Q&A Transcriptions — ' + research.qa.length + '</h2><button class="btn btn-glass" id="research-add-qa" style="padding:4px 8px; font-size:11px;">+ Q&A</button></div>';
    html += '<div id="research-qa-form" style="display:none; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); padding:10px; margin-top:8px; gap:6px; flex-direction:column;"><input id="qa-q" placeholder="Question" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><textarea id="qa-a" placeholder="Answer / transcription" rows="2" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"></textarea><input id="qa-speaker" placeholder="Speaker (optional)" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><div style="display:flex; gap:6px;"><button class="btn btn-accent" id="qa-save" style="padding:4px 10px; font-size:11px;">Save</button><button class="btn btn-glass" id="qa-cancel" style="padding:4px 10px; font-size:11px;">Cancel</button></div></div>';
    if (research.qa.length===0) html += '<div style="font-size:11px; color:var(--text-tertiary); margin-top:8px;">No Q&A yet.</div>';
    else {
      html += '<div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">';
      research.qa.forEach(qa=>{
        html += '<div style="background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); padding:10px;"><div style="display:flex; justify-content:space-between; gap:8px;"><div style="flex:1;"><div style="font-size:11px; font-weight:600;">Q: ' + escapeHtml(qa.question) + '</div><div style="font-size:11px; color:var(--text-secondary); margin-top:4px;">A: ' + escapeHtml(qa.answer) + '</div>' + (qa.speaker ? '<div style="font-size:10px; color:var(--text-quaternary); margin-top:4px;">Speaker: ' + escapeHtml(qa.speaker) + '</div>' : '') + '</div><button data-delete-qa="' + qa.id + '" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary);">✕</button></div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
    // Websites
    html += '<div class="section"><div style="display:flex; justify-content:space-between; align-items:center;"><h2>Website Researches — ' + research.websites.length + '</h2><button class="btn btn-glass" id="research-add-web" style="padding:4px 8px; font-size:11px;">+ Website</button></div>';
    html += '<div id="research-web-form" style="display:none; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); padding:10px; margin-top:8px; gap:6px; flex-direction:column;"><input id="web-url" placeholder="https://" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><input id="web-title" placeholder="Title" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><textarea id="web-notes" placeholder="Notes" rows="2" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"></textarea><div style="display:flex; gap:6px;"><button class="btn btn-accent" id="web-save" style="padding:4px 10px; font-size:11px;">Save</button><button class="btn btn-glass" id="web-cancel" style="padding:4px 10px; font-size:11px;">Cancel</button></div></div>';
    if (research.websites.length===0) html += '<div style="font-size:11px; color:var(--text-tertiary); margin-top:8px;">No websites yet.</div>';
    else {
      html += '<div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">';
      research.websites.forEach(w=>{
        html += '<div style="background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); padding:10px; display:flex; justify-content:space-between; gap:8px;"><div style="flex:1; min-width:0;"><div style="font-size:11px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(w.title) + '</div><div style="font-size:10px; color:var(--text-link); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(w.url) + '</div>' + (w.notes ? '<div style="font-size:11px; color:var(--text-secondary); margin-top:4px; white-space:pre-wrap;">' + escapeHtml(w.notes) + '</div>' : '') + '</div><button data-delete-web="' + w.id + '" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary);">✕</button></div>';
      });
      html += '</div>';
    }
    html += '</div>';
    // Forms
    html += '<div class="section"><div style="display:flex; justify-content:space-between; align-items:center;"><h2>Form Results — ' + research.forms.length + '</h2><button class="btn btn-glass" id="research-add-form" style="padding:4px 8px; font-size:11px;">+ Form</button></div>';
    html += '<div id="research-form-form" style="display:none; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); padding:10px; margin-top:8px; gap:6px; flex-direction:column;"><input id="form-title" placeholder="Form title" style="padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><div id="form-qa-list" style="display:flex; flex-direction:column; gap:4px;"></div><div style="display:flex; gap:4px;"><input id="form-q" placeholder="Question" style="flex:1; padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><input id="form-a" placeholder="Answer" style="flex:1; padding:6px 8px; border:1px solid var(--border-separator); border-radius:6px; font-size:12px; background:var(--bg-well);"><button class="btn btn-glass" id="form-add-qa" style="padding:4px 8px; font-size:11px;">Add</button></div><div style="display:flex; gap:6px; margin-top:6px;"><button class="btn btn-accent" id="form-save" style="padding:4px 10px; font-size:11px;">Save form</button><button class="btn btn-glass" id="form-cancel" style="padding:4px 10px; font-size:11px;">Cancel</button></div></div>';
    if (research.forms.length===0) html += '<div style="font-size:11px; color:var(--text-tertiary); margin-top:8px;">No forms yet.</div>';
    else {
      html += '<div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">';
      research.forms.forEach(f=>{
        html += '<div style="background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); padding:10px;"><div style="display:flex; justify-content:space-between; gap:8px;"><div><div style="font-size:11px; font-weight:600;">' + escapeHtml(f.formTitle) + '</div><div style="font-size:10px; color:var(--text-quaternary);">' + new Date(f.submittedAt).toLocaleString() + ' • ' + f.responses.length + ' answers</div></div><button data-delete-form="' + f.id + '" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary);">✕</button></div><div style="margin-top:6px; display:flex; flex-direction:column; gap:4px;">';
        f.responses.forEach(r=>{ html += '<div style="font-size:11px; background:var(--bg-well); padding:6px; border-radius:6px;"><b>Q:</b> ' + escapeHtml(r.question) + '<br><b>A:</b> ' + escapeHtml(r.answer) + '</div>'; });
        html += '</div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
  } else if (currentMode === 'log') {
    const log = (p.changeLog||[]).filter(e=>['add','delete','move'].includes(e.action)).slice().reverse();
    html += '<div class="section"><div style="display:flex; justify-content:space-between; align-items:center; gap:12px;"><h2>Activity Log — ' + log.length + ' changes</h2><div style="display:flex; gap:6px;"><span style="font-size:11px; color:var(--text-tertiary); align-self:center;">adds / deletes / moves only</span><button class="btn btn-glass" id="log-clear" style="padding:4px 8px; font-size:11px;">Clear</button></div></div><p style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">Shows who added, deleted or moved canvas items. Synced across app & website. Admin sees all.</p></div>';
    if (log.length===0) {
      html += '<div class="empty"><h3>No activity yet</h3><p>Canvas adds, deletes and moves will appear here with username and time.</p></div>';
    } else {
      html += '<div style="display:flex; flex-direction:column; gap:8px;">';
      log.forEach(entry=>{
        const d = new Date(entry.timestamp);
        const time = d.toLocaleTimeString() + ' ' + d.toLocaleDateString();
        const icon = entry.action==='add' ? '＋' : entry.action==='delete' ? '✕' : '↔';
        const col = entry.action==='add' ? '#0a7a42' : entry.action==='delete' ? '#b12424' : '#6a3dec';
        const adminBadge = entry.isAdmin ? '<span style="font-size:9px; background:var(--accent); color:white; padding:1px 4px; border-radius:4px; margin-left:4px;">admin</span>' : '';
        html += '<div style="display:flex; gap:10px; align-items:flex-start; padding:10px 12px; background:var(--bg-popover); border:1px solid var(--border-separator); border-radius:var(--radius-md); box-shadow:var(--shadow-sm);"><div style="width:28px; height:28px; border-radius:50%; background:' + (entry.isAdmin ? 'var(--accent)' : '#e5e5e3') + '; color:' + (entry.isAdmin ? 'white' : 'var(--text-primary)') + '; display:grid; place-items:center; font-size:11px; font-weight:600; flex-shrink:0;">' + escapeHtml(entry.user.charAt(0).toUpperCase()) + '</div><div style="flex:1; min-width:0;"><div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;"><span style="font-size:12px; font-weight:600;">' + escapeHtml(entry.user) + '</span>' + adminBadge + '<span style="font-size:11px; color:' + col + '; font-weight:600; text-transform:uppercase;">' + icon + ' ' + escapeHtml(entry.action) + '</span><span style="font-size:11px; color:var(--text-secondary);">' + escapeHtml(entry.targetType) + ': ' + escapeHtml(entry.targetName) + '</span></div><div style="font-size:11px; color:var(--text-tertiary); margin-top:2px;">' + time + ' • ' + escapeHtml(entry.projectName) + ' • ' + escapeHtml(entry.targetId.slice(0,8)) + '</div></div></div>';
      });
      html += '</div>';
    }
  }
  const gs = state.globalStickies || [];
  if (gs.length > 0) {
    html += '<div class="section"><h2>Global Post-its (' + gs.length + ')</h2><div class="sticky-grid">';
    gs.forEach(s => {
      html += '<div class="sticky ' + (s.color||'yellow') + '">' + escapeHtml(s.text || 'Empty') + '</div>';
    });
    html += '</div></div>';
  }
  document.getElementById('content').innerHTML = html;
  document.getElementById('content').querySelectorAll('input[data-task]').forEach(el => {
    el.addEventListener('change', () => toggleTask(el.getAttribute('data-phase'), el.getAttribute('data-task')));
  });
  // ── Canvas interactions (add / delete / drag / pan / zoom / edit) ──
  (function attachCanvasHandlers(){
    const canvas = document.getElementById('web-canvas');
    const viewport = document.getElementById('canvas-viewport');
    if (canvas && viewport) {
      // Add buttons
      const addSticky = document.getElementById('canvas-add-sticky');
      const addImage = document.getElementById('canvas-add-image');
      const addLink = document.getElementById('canvas-add-link');
      const resetView = document.getElementById('canvas-reset-view');
      function genId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
      function getProject(){ return state.projects.find(x=>x.id===currentProjectId); }
      if (addSticky) addSticky.addEventListener('click', () => {
        const proj = getProject(); if(!proj) return;
        const colors = ['yellow','pink','blue','green','purple'];
        const col = colors[Math.floor(Math.random()*colors.length)];
        const id = genId();
        proj.nodes.push({ id, type: 'sticky', position: { x: 100 + Math.random()*300, y: 100 + Math.random()*200 }, data: { kind: 'sticky', text: '', color: col } });
        addChangeLog('add', id, 'sticky', 'Sticky: empty');
        scheduleSync(); render();
      });
      const imageInput = document.getElementById('canvas-image-input');
      if (addImage) addImage.addEventListener('click', () => {
        if (imageInput) imageInput.click();
        else {
          const url = prompt('Image URL:', 'https://picsum.photos/300/200');
          if (url === null) return;
          const src = url || 'https://picsum.photos/300/200';
          const label = prompt('Label:', 'Image');
          const proj = getProject(); if(!proj) return;
          proj.nodes.push({ id: genId(), type: 'image', position: { x: 120 + Math.random()*300, y: 120 + Math.random()*200 }, data: { kind: 'image', src, label: label||'Image' } });
          scheduleSync(); render();
        }
      });
      if (imageInput) imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert('Please select an image file'); e.target.value=''; return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
          const src = ev.target.result;
          const proj = getProject(); if(!proj) return;
          const id = genId();
          proj.nodes.push({ id, type: 'image', position: { x: 120 + Math.random()*300, y: 120 + Math.random()*200 }, data: { kind: 'image', src, label: file.name } });
          addChangeLog('add', id, 'image', 'Image: ' + file.name);
          scheduleSync(); render();
        };
        reader.readAsDataURL(file);
        e.target.value = '';
      });
      if (addLink) addLink.addEventListener('click', () => {
        const url = prompt('Link URL:', 'https://');
        if (!url) return;
        const title = prompt('Title:', url);
        const proj = getProject(); if(!proj) return;
        const id = genId();
        proj.nodes.push({ id, type: 'link', position: { x: 140 + Math.random()*300, y: 140 + Math.random()*200 }, data: { kind: 'link', url, title: title||url } });
        addChangeLog('add', id, 'link', 'Link: ' + (title||url));
        scheduleSync(); render();
      });
      if (resetView) resetView.addEventListener('click', () => {
        canvasTx = 0; canvasTy = 0; canvasScale = 1;
        viewport.style.transform = 'translate(' + canvasTx + 'px,' + canvasTy + 'px) scale(' + canvasScale + ')';
      });
      // Drag & drop image files from device (Documents / Photos) directly onto canvas
      canvas.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; canvas.style.outline = '2px dashed var(--accent)'; });
      canvas.addEventListener('dragleave', () => { canvas.style.outline = 'none'; });
      canvas.addEventListener('drop', (e) => {
        e.preventDefault(); canvas.style.outline = 'none';
        const files = e.dataTransfer.files;
        const proj = getProject(); if(!proj) return;
        // Handle image files
        let added = false;
        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const src = ev.target.result;
              const rect = canvas.getBoundingClientRect();
              const x = (e.clientX - rect.left - canvasTx) / canvasScale + (Math.random()*40-20);
              const y = (e.clientY - rect.top - canvasTy) / canvasScale + (Math.random()*40-20);
              proj.nodes.push({ id: genId(), type: 'image', position: { x, y }, data: { kind: 'image', src, label: file.name } });
              addChangeLog('add', proj.nodes[proj.nodes.length-1].id, 'image', 'Image: ' + file.name);
              scheduleSync(); render();
            };
            reader.readAsDataURL(file);
            added = true;
          }
        }
        if (!added) {
          // Try HTML drag (from web) or text/uri
          const html = e.dataTransfer.getData('text/html');
          const uri = e.dataTransfer.getData('text/uri-list');
          const text = e.dataTransfer.getData('text/plain');
          const rect = canvas.getBoundingClientRect();
          const px = (e.clientX - rect.left - canvasTx) / canvasScale;
          const py = (e.clientY - rect.top - canvasTy) / canvasScale;
          if (html) {
            const m = html.match(/<img[^>]+src=["']([^"']+)["']/);
            if (m) { proj.nodes.push({ id: genId(), type: 'image', position: { x: px, y: py }, data: { kind: 'image', src: m[1], label: 'Image' } }); syncNow(); render(); return; }
          }
          if (uri || (text && (text.startsWith('http://') || text.startsWith('https://')))) {
            const url = uri || text;
            const lower = url.toLowerCase();
            const isImageUrl = ['.png','.jpg','.jpeg','.gif','.webp','.svg'].some(ext => lower.split('?')[0].endsWith(ext));
            if (isImageUrl || html) {
              const _uid = genId(); proj.nodes.push({ id: _uid, type: 'image', position: { x: px, y: py }, data: { kind: 'image', src: url, label: 'Image' } }); addChangeLog('add', _uid, 'image', 'Image: dropped URL');
            } else {
              const title = url.length > 40 ? url.slice(0,40)+'...' : url;
              proj.nodes.push({ id: genId(), type: 'link', position: { x: px, y: py }, data: { kind: 'link', url, title } });
            }
            scheduleSync(); render(); return;
          }
          if (text) {
            const _sid = genId(); proj.nodes.push({ id: _sid, type: 'sticky', position: { x: px, y: py }, data: { kind: 'sticky', text, color: 'yellow' } }); addChangeLog('add', _sid, 'sticky', 'Sticky: ' + (text.slice(0,20)||'empty')); scheduleSync(); render();
          }
        }
      });
      // Delete buttons
      canvas.querySelectorAll('.web-node-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-delete');
          const proj = getProject(); if(!proj) return;
          const target = proj.nodes.find(n=>n.id===id);
          const name = target ? (target.data?.kind==='sticky' ? 'Sticky: ' + ((target.data.text||'').slice(0,20)||'empty') : target.data?.kind==='image' ? 'Image: ' + (target.data.label||'image') : 'Link: ' + (target.data.title||target.data.url||'')) : id;
          const type = target ? target.type : 'unknown';
          proj.nodes = proj.nodes.filter(n=>n.id!==id);
          proj.edges = (proj.edges||[]).filter(ed=>ed.source!==id && ed.target!==id);
          addChangeLog('delete', id, type, name);
          scheduleSync(); render();
        });
      });
      // Edit sticky double-click
      canvas.querySelectorAll('.web-node-text[data-edit]').forEach(el => {
        el.addEventListener('dblclick', () => {
          const id = el.getAttribute('data-edit');
          const proj = getProject(); const node = proj.nodes.find(n=>n.id===id); if(!node) return;
          const cur = node.data?.text || '';
          const ta = document.createElement('textarea');
          ta.value = cur;
          ta.style.width = '100%'; ta.style.minHeight = '60px'; ta.style.font = 'inherit'; ta.style.fontSize = '13px';
          ta.style.border = '1px solid var(--border-separator)'; ta.style.borderRadius = '6px'; ta.style.padding = '6px';
          el.replaceWith(ta); ta.focus();
          let done = false;
          const finish = () => {
            if (done) return; done = true;
            node.data.text = ta.value;
            scheduleSync(); render();
          };
          ta.addEventListener('blur', finish);
          ta.addEventListener('keydown', (ev) => {
            if (ev.key==='Enter' && (ev.metaKey||ev.ctrlKey)) finish();
            if (ev.key==='Escape') { done = true; render(); }
          });
        });
      });
      // Drag nodes
      canvas.querySelectorAll('.web-node').forEach(nodeEl => {
        nodeEl.addEventListener('mousedown', (e) => {
          if (e.target.closest('.web-node-delete') || e.target.closest('textarea')) return;
          const id = nodeEl.getAttribute('data-id');
          const proj = getProject(); const node = proj.nodes.find(n=>n.id===id); if(!node) return;
          _canvasDrag = { id, el: nodeEl, startX: e.clientX, startY: e.clientY, origX: node.position.x, origY: node.position.y };
          nodeEl.style.cursor = 'grabbing'; nodeEl.style.zIndex = '10';
          e.preventDefault();
        });
      });
      // Pan viewport (drag background)
      canvas.addEventListener('mousedown', (e) => {
        if (_canvasDrag) return;
        if (e.target.closest('.web-node')) return;
        _canvasPan = { startX: e.clientX, startY: e.clientY, origTx: canvasTx, origTy: canvasTy };
        canvas.style.cursor = 'grabbing';
      });
      if (!_canvasListenersAttached) {
        _canvasListenersAttached = true;
        window.addEventListener('mousemove', (e) => {
          if (_canvasDrag) {
            const dx = (e.clientX - _canvasDrag.startX) / canvasScale;
            const dy = (e.clientY - _canvasDrag.startY) / canvasScale;
            const proj = state.projects.find(x=>x.id===currentProjectId);
            const node = proj.nodes.find(n=>n.id===_canvasDrag.id);
            if (node) { node.position.x = _canvasDrag.origX + dx; node.position.y = _canvasDrag.origY + dy; }
            _canvasDrag.el.style.left = node.position.x + 'px';
            _canvasDrag.el.style.top = node.position.y + 'px';
            const svg = viewport.querySelector('svg');
            if (svg) {
              const edges = proj.edges||[];
              const nodes = proj.nodes;
              svg.querySelectorAll('line').forEach((line, i) => {
                const ed = edges[i]; if(!ed) return;
                const s = nodes.find(n=>n.id===ed.source), tt = nodes.find(n=>n.id===ed.target);
                if (s&&tt) { line.setAttribute('x1', s.position.x+80); line.setAttribute('y1', s.position.y+48); line.setAttribute('x2', tt.position.x+80); line.setAttribute('y2', tt.position.y+48); }
              });
            }
          } else if (_canvasPan) {
            const dx = e.clientX - _canvasPan.startX;
            const dy = e.clientY - _canvasPan.startY;
            canvasTx = _canvasPan.origTx + dx;
            canvasTy = _canvasPan.origTy + dy;
            viewport.style.transform = 'translate(' + canvasTx + 'px,' + canvasTy + 'px) scale(' + canvasScale + ')';
            const bgX = canvasTx % 20, bgY = canvasTy % 20;
            canvas.style.backgroundPosition = bgX + 'px ' + bgY + 'px';
          }
        });
        window.addEventListener('mouseup', () => {
          if (_canvasDrag) {
            _canvasDrag.el.style.cursor = 'grab'; _canvasDrag.el.style.zIndex = '';
            const proj = state.projects.find(x=>x.id===currentProjectId);
            const node = proj ? proj.nodes.find(n=>n.id===_canvasDrag.id) : null;
            if (node) addChangeLog('move', node.id, node.type, 'Moved to ' + Math.round(node.position.x) + ',' + Math.round(node.position.y));
            scheduleSync();
            _canvasDrag = null;
          }
          if (_canvasPan) { canvas.style.cursor = ''; _canvasPan = null; }
        });
      }
      // Zoom
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(2, Math.max(0.4, canvasScale * delta));
        // zoom toward mouse
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left - canvasTx;
        const my = e.clientY - rect.top - canvasTy;
        canvasScale = newScale;
        // adjust to keep mouse point stable (optional simple)
        viewport.style.transform = 'translate(' + canvasTx + 'px,' + canvasTy + 'px) scale(' + canvasScale + ')';
      }, { passive: false });
      // init transform
      viewport.style.transform = 'translate(' + canvasTx + 'px,' + canvasTy + 'px) scale(' + canvasScale + ')';
    }
  })();
  // ── Snapshot handlers (web left panel) ──
  (function(){
    const snapBtn = document.getElementById('canvas-add-snapshot');
    if (snapBtn) snapBtn.addEventListener('click', () => {
      const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
      let thumbnail;
      try {
        const c = document.createElement('canvas'); c.width=160; c.height=100;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.fillStyle='#f8f8f7'; ctx.fillRect(0,0,c.width,c.height);
          const nodes = proj.nodes||[];
          if (nodes.length>0) {
            let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
            nodes.forEach(n=>{ minX=Math.min(minX,n.position.x); minY=Math.min(minY,n.position.y); maxX=Math.max(maxX,n.position.x+160); maxY=Math.max(maxY,n.position.y+96); });
            const w=maxX-minX||800, h=maxY-minY||600; const scale=Math.min(150/w,90/h); const ox=5-minX*scale, oy=5-minY*scale;
            ctx.strokeStyle='#e8e8e6'; ctx.lineWidth=1;
            for(let x=0;x<c.width;x+=20){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,c.height); ctx.stroke(); }
            for(let y=0;y<c.height;y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(c.width,y); ctx.stroke(); }
            nodes.forEach(n=>{
              const x=n.position.x*scale+ox, y=n.position.y*scale+oy, rw=160*scale, rh=44*scale;
              let col='#ddd6fe';
              if(n.data?.kind==='sticky'){ col=n.data.color==='yellow'?'#fef08a': n.data.color==='pink'?'#fbcfe8': n.data.color==='blue'?'#bfdbfe': n.data.color==='green'?'#bbf7d0':'#ddd6fe'; }
              else if(n.data?.kind==='image') col='#e5e5e3';
              else if(n.data?.kind==='link') col='#e0e7ff';
              ctx.fillStyle=col; ctx.strokeStyle='#e8e8e6'; ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x,y,rw,rh,4); else ctx.rect(x,y,rw,rh); ctx.fill(); ctx.stroke();
            });
            thumbnail=c.toDataURL('image/png');
          }
        }
      } catch {}
      if(!proj.snapshots) proj.snapshots=[];
      proj.snapshots.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), name: 'Snapshot '+new Date().toLocaleTimeString(), createdAt: Date.now(), viewport:{x:canvasTx,y:canvasTy,zoom:canvasScale}, nodes: JSON.parse(JSON.stringify(proj.nodes)), edges: JSON.parse(JSON.stringify(proj.edges||[])), thumbnail });
      scheduleSync(); render();
    });
    document.querySelectorAll('[data-restore]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id=btn.getAttribute('data-restore');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.snapshots) return;
        const snap=proj.snapshots.find(s=>s.id===id); if(!snap) return;
        canvasTx=snap.viewport.x; canvasTy=snap.viewport.y; canvasScale=snap.viewport.zoom;
        const viewport=document.getElementById('canvas-viewport');
        const canvasEl=document.getElementById('web-canvas');
        if(viewport) viewport.style.transform='translate('+canvasTx+'px,'+canvasTy+'px) scale('+canvasScale+')';
        if(canvasEl) canvasEl.style.backgroundPosition=(canvasTx%20)+'px '+(canvasTy%20)+'px';
      });
      btn.addEventListener('dblclick', ()=>{
        const id=btn.getAttribute('data-restore');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.snapshots) return;
        const snap=proj.snapshots.find(s=>s.id===id); if(!snap) return;
        if(confirm('Restore snapshot content (nodes/edges) as well? This will overwrite current canvas.')){ proj.nodes=JSON.parse(JSON.stringify(snap.nodes)); proj.edges=JSON.parse(JSON.stringify(snap.edges)); canvasTx=snap.viewport.x; canvasTy=snap.viewport.y; canvasScale=snap.viewport.zoom; scheduleSync(); render(); }
      });
    });
    document.querySelectorAll('[data-delete-snap]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); const id=btn.getAttribute('data-delete-snap'); const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.snapshots) return; proj.snapshots=proj.snapshots.filter(s=>s.id!==id); scheduleSync(); render(); });
    });
    document.querySelectorAll('[data-rename-snap]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); const id=btn.getAttribute('data-rename-snap'); const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.snapshots) return; const snap=proj.snapshots.find(s=>s.id===id); if(!snap) return; const name=prompt('Rename snapshot:', snap.name); if(name&&name.trim()){ snap.name=name.trim(); scheduleSync(); render(); } });
    });
    // Log clear (admin can clear, but anyone on web can clear their view - we allow all, admin in app has full)
    const logClear = document.getElementById('log-clear');
    if (logClear) logClear.addEventListener('click', ()=>{
      const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
      if (isAdminUser() || confirm('Clear activity log for this project?')) {
        proj.changeLog = [];
        scheduleSync(); render();
      }
    });
    // Research handlers
    const qaAddBtn = document.getElementById('research-add-qa');
    const qaForm = document.getElementById('research-qa-form');
    if (qaAddBtn && qaForm) {
      qaAddBtn.addEventListener('click', ()=>{ qaForm.style.display = qaForm.style.display==='none' ? 'flex' : 'none'; });
      document.getElementById('qa-cancel')?.addEventListener('click', ()=>{ qaForm.style.display='none'; });
      document.getElementById('qa-save')?.addEventListener('click', ()=>{
        const q=(document.getElementById('qa-q')).value.trim();
        const a=(document.getElementById('qa-a')).value.trim();
        const speaker=(document.getElementById('qa-speaker')).value.trim();
        if(!q||!a) return;
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        if(!proj.research) proj.research={qa:[],websites:[],forms:[]};
        proj.research.qa.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), question:q, answer:a, speaker: speaker||undefined, createdAt: Date.now() });
        (document.getElementById('qa-q')).value=''; (document.getElementById('qa-a')).value=''; (document.getElementById('qa-speaker')).value='';
        qaForm.style.display='none'; scheduleSync(); render();
      });
    }
    document.querySelectorAll('[data-delete-qa]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id=btn.getAttribute('data-delete-qa');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.research) return;
        proj.research.qa=proj.research.qa.filter(x=>x.id!==id); scheduleSync(); render();
      });
    });
    const webAddBtn=document.getElementById('research-add-web');
    const webForm=document.getElementById('research-web-form');
    if(webAddBtn && webForm){
      webAddBtn.addEventListener('click', ()=>{ webForm.style.display = webForm.style.display==='none' ? 'flex' : 'none'; });
      document.getElementById('web-cancel')?.addEventListener('click', ()=>{ webForm.style.display='none'; });
      document.getElementById('web-save')?.addEventListener('click', ()=>{
        const url=(document.getElementById('web-url')).value.trim();
        const title=(document.getElementById('web-title')).value.trim();
        const notes=(document.getElementById('web-notes')).value.trim();
        if(!url) return;
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        if(!proj.research) proj.research={qa:[],websites:[],forms:[]};
        proj.research.websites.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), url, title: title||url, notes, capturedAt: Date.now() });
        (document.getElementById('web-url')).value=''; (document.getElementById('web-title')).value=''; (document.getElementById('web-notes')).value='';
        webForm.style.display='none'; scheduleSync(); render();
      });
    }
    document.querySelectorAll('[data-delete-web]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id=btn.getAttribute('data-delete-web');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.research) return;
        proj.research.websites=proj.research.websites.filter(x=>x.id!==id); scheduleSync(); render();
      });
    });
    // Form handlers
    let formResponses = [];
    const formAddBtn=document.getElementById('research-add-form');
    const formForm=document.getElementById('research-form-form');
    if(formAddBtn && formForm){
      formAddBtn.addEventListener('click', ()=>{ formForm.style.display = formForm.style.display==='none' ? 'flex' : 'none'; });
      document.getElementById('form-cancel')?.addEventListener('click', ()=>{ formForm.style.display='none'; formResponses=[]; const list=document.getElementById('form-qa-list'); if(list) list.innerHTML=''; });
      document.getElementById('form-add-qa')?.addEventListener('click', ()=>{
        const q=(document.getElementById('form-q')).value.trim();
        const a=(document.getElementById('form-a')).value.trim();
        if(!q||!a) return;
        formResponses.push({question:q, answer:a});
        (document.getElementById('form-q')).value=''; (document.getElementById('form-a')).value='';
        const list=document.getElementById('form-qa-list');
        if(list) list.innerHTML = formResponses.map((r,i)=> '<div style="display:flex; justify-content:space-between; gap:4px; font-size:11px; background:var(--bg-well); padding:4px 6px; border-radius:4px;"><span><b>Q:</b> '+escapeHtml(r.question)+' <b>A:</b> '+escapeHtml(r.answer)+'</span><button data-remove-form-qa="'+i+'" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary);">✕</button></div>').join('') + (formResponses.length? formResponses.map((_,i)=>'').join('') : '');
        // Need to re-attach remove handlers? We'll handle via delegated or re-render not needed
      });
      document.getElementById('form-save')?.addEventListener('click', ()=>{
        const title=(document.getElementById('form-title')).value.trim();
        if(!title || formResponses.length===0) return;
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        if(!proj.research) proj.research={qa:[],websites:[],forms:[]};
        proj.research.forms.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), formTitle: title, responses: [...formResponses], submittedAt: Date.now() });
        (document.getElementById('form-title')).value=''; formResponses=[]; const list=document.getElementById('form-qa-list'); if(list) list.innerHTML=''; formForm.style.display='none'; scheduleSync(); render();
      });
    }
    document.querySelectorAll('[data-delete-form]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id=btn.getAttribute('data-delete-form');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.research) return;
        proj.research.forms=proj.research.forms.filter(x=>x.id!==id); scheduleSync(); render();
      });
    });
    // CAD handlers
    const cadUpload = document.getElementById('cad-upload');
    const cadFileInput = document.getElementById('cad-file-input');
    if(cadUpload && cadFileInput){
      cadUpload.addEventListener('click', ()=> cadFileInput.click());
      cadFileInput.addEventListener('change', (e)=>{
        const file=(e.target).files?.[0]; if(!file) return;
        const reader=new FileReader();
        reader.onload=(ev)=>{
          const src=ev.target?.result;
          const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
          if(!proj.cadDrawings) proj.cadDrawings=[];
          proj.cadDrawings.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), name: file.name, src, type: file.type||'cad', createdAt: Date.now() });
          scheduleSync(); render();
        };
        reader.readAsDataURL(file);
        (e.target).value='';
      });
    }
    document.querySelectorAll('[data-delete-cad]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id=btn.getAttribute('data-delete-cad');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.cadDrawings) return;
        proj.cadDrawings=proj.cadDrawings.filter(x=>x.id!==id); scheduleSync(); render();
      });
    });
    document.querySelectorAll('[data-select-cad]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const id=el.getAttribute('data-select-cad');
        const proj=state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.cadDrawings) return;
        const cad=proj.cadDrawings.find(x=>x.id===id); if(!cad) return;
        // Simple: move to front
        proj.cadDrawings = [cad, ...proj.cadDrawings.filter(x=>x.id!==id)];
        scheduleSync(); render();
      });
    });
    // CAD zoom
    const cadViewer=document.getElementById('cad-viewer');
    const cadZoom=document.getElementById('cad-zoom');
    let cadScale=1;
    document.querySelectorAll('[data-cad-zoom]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const dir=btn.getAttribute('data-cad-zoom');
        if(dir==='in') cadScale=Math.min(3, cadScale*1.2);
        else if(dir==='out') cadScale=Math.max(0.5, cadScale/1.2);
        if(cadZoom) cadZoom.style.transform='scale('+cadScale+')';
        const label=document.getElementById('cad-zoom-label');
        if(label) label.textContent=Math.round(cadScale*100)+'%';
      });
    });
    const cadReset=document.querySelector('[data-cad-reset]');
    if(cadReset) cadReset.addEventListener('click', ()=>{
      cadScale=1;
      if(cadZoom) cadZoom.style.transform='scale(1)';
      const label=document.getElementById('cad-zoom-label');
      if(label) label.textContent='100%';
    });
    if(cadViewer && cadZoom){
      cadViewer.addEventListener('wheel', (e)=>{
        e.preventDefault();
        const delta=e.deltaY>0?0.9:1.1;
        cadScale=Math.min(3, Math.max(0.5, cadScale*delta));
        cadZoom.style.transform='scale('+cadScale+')';
        const label2=document.getElementById('cad-zoom-label');
        if(label2) label2.textContent=Math.round(cadScale*100)+'%';
      });
    }
  })();
  // ── Document handlers ──
  (function(){
    const docAdd = document.getElementById('doc-add');
    if (docAdd) docAdd.addEventListener('click', () => {
      const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
      const id = Date.now().toString(36)+Math.random().toString(36).slice(2,7);
      if (!proj.documents) proj.documents = [];
      proj.documents.push({id, title: 'Untitled Document', content: null, updatedAt: Date.now()});
      proj.activeDocumentId = id;
      scheduleSync(); render();
    });
    document.querySelectorAll('[data-rename-doc]').forEach(el => {
      const handler = () => {
        const id = el.getAttribute('data-rename-doc');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        const doc = (proj.documents||[]).find(d=>d.id===id); if(!doc) return;
        const v = el.value.trim() || 'Untitled';
        if (doc.title !== v) { doc.title = v; doc.updatedAt = Date.now(); scheduleSync(); }
      };
      el.addEventListener('change', handler);
      el.addEventListener('blur', handler);
    });
    document.querySelectorAll('[data-delete-doc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-doc');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        proj.documents = (proj.documents||[]).filter(d=>d.id!==id);
        if (proj.activeDocumentId===id) proj.activeDocumentId = (proj.documents[0]&&proj.documents[0].id) || null;
        scheduleSync(); render();
      });
    });
    document.querySelectorAll('[data-activate-doc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-activate-doc');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        proj.activeDocumentId = id;
        scheduleSync(); render();
      });
    });
    const docAddEmpty = document.getElementById('doc-add-empty');
    if (docAddEmpty) docAddEmpty.addEventListener('click', () => {
      const btn = document.getElementById('doc-add');
      if (btn) btn.click();
    });
    document.querySelectorAll('[data-edit-doc]').forEach(ta => {
      let tmr=null;
      const save = () => {
        const id = ta.getAttribute('data-edit-doc');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        const doc = (proj.documents||[]).find(d=>d.id===id); if(!doc) return;
        const text = ta.value;
        if (text) {
          doc.content = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] };
        } else {
          doc.content = null;
        }
        doc.updatedAt = Date.now();
        scheduleSync();
      };
      ta.addEventListener('input', () => { if(tmr) clearTimeout(tmr); tmr=setTimeout(save, 500); });
      ta.addEventListener('blur', save);
    });
    // Doc context menu (right-click on lateral list)
    document.querySelectorAll('[data-activate-doc]').forEach(el => {
      // Avoid duplicate listeners on the main doc items (which are also data-activate-doc)
      // The lateral list items are the ones in the 220px sidebar, but the main doc items also have data-activate-doc
      // We will handle both, but ensure we don't double-attach
      if (el.closest('[data-doc-menu]')) return;
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const id = el.getAttribute('data-activate-doc');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
        const doc = (proj.documents||[]).find(d=>d.id===id); if(!doc) return;
        const menu = document.getElementById('web-doc-menu');
        if(!menu) return;
        menu.innerHTML = '<div style="padding:6px 10px; border-bottom:1px solid var(--border-separator);"><div style="font-size:12px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(doc.title) + '</div><div style="font-size:10px; color:var(--text-tertiary);">' + new Date(doc.updatedAt).toLocaleDateString() + '</div></div>'
          + '<button data-action="rename" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>✎</span> Rename</button>'
          + '<button data-action="duplicate" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>⧉</span> Duplicate</button>'
          + '<div style="height:1px; background:var(--border-separator); margin:4px 0;"></div>'
          + '<div style="padding:4px 10px; font-size:10px; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">Share</div>'
          + '<button data-action="copy_link" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>↗</span> Copy Link</button>'
          + '<button data-action="copy_content" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>⎘</span> Copy Content</button>'
          + '<button data-action="export" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; display:flex; gap:6px; align-items:center;"><span>⬇</span> Export File…</button>'
          + '<div style="height:1px; background:var(--border-separator); margin:4px 0;"></div>'
          + '<button data-action="delete" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:12px; color:#b12424; display:flex; gap:6px; align-items:center;"><span>✕</span> Delete</button>';
        menu.style.display='block';
        menu.style.left = Math.min(e.clientX, window.innerWidth - 210) + 'px';
        menu.style.top = Math.min(e.clientY, window.innerHeight - 300) + 'px';
        const handleDocAction = async (action) => {
          menu.style.display='none';
          if(action==='rename'){
            const name=prompt('Rename text file:', doc.title);
            console.log('doc rename', name, doc.title);
            if(name&&name.trim()){
              const newName=name.trim();
              doc.title=newName; doc.updatedAt=Date.now();
              console.log('doc renamed to', newName);
              fetch('/api/state', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(state) }).catch(e=>console.error(e));
              scheduleSync(); render();
            }
          } else if(action==='duplicate'){
            const newId = Date.now().toString(36)+Math.random().toString(36).slice(2,7);
            const copy = JSON.parse(JSON.stringify(doc));
            copy.id=newId; copy.title=doc.title+' Copy'; copy.updatedAt=Date.now();
            proj.documents.push(copy); proj.activeDocumentId=newId; scheduleSync(); render();
          } else if(action==='copy_link'){
            const link = location.origin + location.pathname + '?project=' + proj.id + '&doc=' + doc.id;
            try{ await navigator.clipboard.writeText(link); alert('Link copied: '+link); }catch{ prompt('Copy link:', link); }
          } else if(action==='copy_content'){
            const text = doc.content ? (typeof doc.content==='string' ? doc.content : JSON.stringify(doc.content,null,2)) : '';
            try{ await navigator.clipboard.writeText(text||doc.title); alert('Content copied'); }catch{ prompt('Copy content:', text.slice(0,4000)); }
          } else if(action==='export'){
            const data=JSON.stringify(doc,null,2);
            const blob=new Blob([data],{type:'application/json'});
            const url=URL.createObjectURL(blob);
            const a=document.createElement('a'); a.href=url; a.download=(doc.title.replace(/[^a-z0-9]/gi,'_')+'.json'); document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
          } else if(action==='delete'){
            if(confirm('Delete "'+doc.title+'"?')){ proj.documents=proj.documents.filter(d=>d.id!==doc.id); if(proj.activeDocumentId===doc.id) proj.activeDocumentId=(proj.documents[0]&&proj.documents[0].id)||null; scheduleSync(); render(); }
          }
        };
        menu.querySelectorAll('button[data-action]').forEach(btn=>{
          btn.addEventListener('click', ()=> handleDocAction(btn.getAttribute('data-action')));
          btn.addEventListener('mouseenter', ()=> btn.style.background='var(--bg-well)');
          btn.addEventListener('mouseleave', ()=> btn.style.background='none');
        });
        const closeDoc = (ev)=>{ if(!menu.contains(ev.target)){ menu.style.display='none'; window.removeEventListener('click', closeDoc); } };
        setTimeout(()=> window.addEventListener('click', closeDoc), 0);
      });
    });
  })();
  // ── Methodology handlers ──
  (function(){
    document.querySelectorAll('[data-set-phase]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ph = btn.getAttribute('data-set-phase');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.methodology) return;
        proj.methodology.currentPhase = ph;
        scheduleSync(); render();
      });
    });
    const addTaskBtn = document.getElementById('method-add-task');
    const newTaskInput = document.getElementById('method-new-task');
    const addTask = () => {
      const text = newTaskInput ? newTaskInput.value.trim() : '';
      if (!text) return;
      const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.methodology) return;
      const ph = proj.methodology.currentPhase||'discover';
      if (!proj.methodology.phases[ph]) return;
      proj.methodology.phases[ph].tasks.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), text, done:false });
      if (newTaskInput) newTaskInput.value='';
      scheduleSync(); render();
    };
    if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);
    if (newTaskInput) newTaskInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') addTask(); });
    document.querySelectorAll('[data-delete-task]').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.getAttribute('data-delete-task');
        const ph = btn.getAttribute('data-phase');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.methodology) return;
        const phase = proj.methodology.phases[ph]; if(!phase) return;
        phase.tasks = phase.tasks.filter(t=>t.id!==taskId);
        scheduleSync(); render();
      });
    });
    const notes = document.getElementById('method-notes');
    if (notes) {
      let tmr=null;
      const saveNotes = () => {
        const ph = notes.getAttribute('data-phase');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.methodology) return;
        const phase = proj.methodology.phases[ph]; if(!phase) return;
        phase.notes = notes.value;
        scheduleSync();
      };
      notes.addEventListener('input', ()=>{ if(tmr) clearTimeout(tmr); tmr=setTimeout(saveNotes,500); });
      notes.addEventListener('blur', saveNotes);
    }
  })();
  // ── Prototype handlers (website / 3d / image) ──
  (function(){
    const fileInput = document.getElementById('viewer-file-input');
    let pendingProtoKind = 'image';
    function addProto(kind, name, src, type){
      const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj) return;
      if(!proj.prototypes) proj.prototypes=[];
      // migrate legacy viewerModel if exists
      if (proj.viewerModel && !proj.prototypes.length) {
        const vm = proj.viewerModel;
        const k = (vm.type||'').startsWith('image/') ? 'image' : '3d';
        proj.prototypes.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), kind: k, name: vm.name, src: vm.src, type: vm.type, createdAt: vm.uploadedAt||Date.now() });
        delete proj.viewerModel;
      }
      proj.prototypes.push({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), kind, name, src, type: type|| (kind==='website'?'text/website': kind==='image'?'image/png':'model/gltf'), createdAt: Date.now() });
      scheduleSync(); render();
    }
    const addWebsiteBtn = document.getElementById('proto-add-website');
    const add3dBtn = document.getElementById('proto-add-3d');
    const addImageBtn = document.getElementById('proto-add-image');
    if (addWebsiteBtn) addWebsiteBtn.addEventListener('click', ()=>{
      const url = prompt('Website prototype URL:', 'https://');
      if(!url) return;
      const name = prompt('Name:', url) || url;
      addProto('website', name, url, 'text/website');
    });
    const triggerProtoFile = (kind)=>{
      pendingProtoKind = kind;
      if(fileInput){
        fileInput.accept = kind==='image' ? 'image/*' : '.obj,.gltf,.glb,image/*';
        fileInput.click();
      }
    };
    if (add3dBtn) add3dBtn.addEventListener('click', ()=> triggerProtoFile('3d'));
    if (addImageBtn) addImageBtn.addEventListener('click', ()=> triggerProtoFile('image'));
    if (fileInput) fileInput.addEventListener('change', (e)=>{
      const file = e.target.files[0]; if(!file) return;
      const reader = new FileReader();
      reader.onload = (ev)=>{
        const src = ev.target.result;
        let kind = pendingProtoKind;
        if(file.type.startsWith('image/')) kind='image';
        else if(file.name.match(/\.(gltf|glb|obj)$/i)) kind='3d';
        addProto(kind, file.name, src, file.type);
      };
      reader.readAsDataURL(file);
      e.target.value='';
    });
    document.querySelectorAll('[data-delete-proto]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-delete-proto');
        const proj = state.projects.find(x=>x.id===currentProjectId); if(!proj||!proj.prototypes) return;
        proj.prototypes = proj.prototypes.filter(p=>p.id!==id);
        scheduleSync(); render();
      });
    });
    const dropEl = document.getElementById('viewer-drop');
    if (dropEl) {
      dropEl.addEventListener('click', ()=> triggerProtoFile('image'));
      dropEl.addEventListener('dragover', (e)=>{ e.preventDefault(); dropEl.style.borderColor='var(--accent)'; });
      dropEl.addEventListener('dragleave', ()=>{ dropEl.style.borderColor='var(--border-separator)'; });
      dropEl.addEventListener('drop', (e)=>{
        e.preventDefault(); dropEl.style.borderColor='var(--border-separator)';
        const file = e.dataTransfer.files[0];
        if(file){
          const reader = new FileReader();
          reader.onload=(ev)=>{
            const src=ev.target.result;
            let kind='image';
            if(file.type.startsWith('image/')) kind='image';
            else if(file.name.match(/\.(gltf|glb|obj)$/i)) kind='3d';
            else kind='image';
            addProto(kind, file.name, src, file.type);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  })();
  document.getElementById('last-sync').textContent = 'Last synced: ' + new Date(state.lastSavedAt || Date.now()).toLocaleTimeString();
    const screenplayTa = document.getElementById('screenplay-textarea');
    if (screenplayTa) {
      screenplayTa.addEventListener('input', () => {
        const val = screenplayTa.value;
        if (p.documents && p.documents[0]) {
          p.documents[0].content = val;
          p.documents[0].updatedAt = Date.now();
        } else {
          if (!p.documents) p.documents = [];
          p.documents.push({ id: 'screenplay-doc', title: 'Screenplay', content: val, updatedAt: Date.now() });
        }
        scheduleSync();
        const prev = document.getElementById('screenplay-preview');
        if (prev) {
          const lines = val.split('\n');
          let html = '';
          lines.forEach(l => {
            const trimmed = l.trim();
            if (!trimmed) { html += '<div style="height:12px;"></div>'; return; }
            if (/^(INT|EXT|EST|INT\/EXT)\b/i.test(trimmed) || (/^[A-Z0-9\s\-\.\,\/\(\)]+$/.test(trimmed) && trimmed === trimmed.toUpperCase() && !trimmed.endsWith(':') && trimmed.length < 60)) {
              html += '<div style="font-weight:700; text-transform:uppercase; margin:16px 0 8px 0; letter-spacing:0.05em; color:var(--text-primary);">' + escapeHtml(trimmed) + '</div>';
            } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
              html += '<div style="color:var(--text-tertiary); font-style:italic; text-align:center; margin:2px 0; padding-left:40px;">' + escapeHtml(trimmed) + '</div>';
            } else if (trimmed === trimmed.toUpperCase() && trimmed.length < 35 && !/[.?!]$/.test(trimmed)) {
              html += '<div style="font-weight:700; color:var(--accent); text-transform:uppercase; text-align:center; margin:14px 0 2px 0; letter-spacing:0.05em;">' + escapeHtml(trimmed) + '</div>';
            } else {
              html += '<div style="color:var(--text-primary); margin-bottom:8px; line-height:1.5;">' + escapeHtml(trimmed) + '</div>';
            }
          });
          prev.innerHTML = html;
        }
      });
    }
    const screenplayExp = document.getElementById('screenplay-export');
    if (screenplayExp) {
      screenplayExp.addEventListener('click', () => {
        const val = screenplayTa ? screenplayTa.value : '';
        const blob = new Blob([val], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (p.name || 'Screenplay') + '.fountain';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }
}
function selectProject(id) { currentProjectId = id; render(); }
function extractText(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (content.text) return content.text;
  if (Array.isArray(content.content)) {
    return content.content.map(n => extractText(n)).join(' ');
  }
  if (content.content && Array.isArray(content.content)) {
    return content.content.map(n => {
      if (n.text) return n.text;
      if (n.content) return extractText(n);
      return '';
    }).join(' ').trim();
  }
  return '';
}
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
async function toggleTask(phase, taskId) {
  if (!state) return;
  const p = state.projects.find(x => x.id === currentProjectId);
  if (!p || !p.methodology) return;
  const pd = p.methodology.phases[phase];
  if (!pd) return;
  const task = pd.tasks.find(t => t.id === taskId);
  if (task) task.done = !task.done;
  scheduleSync();
}
async function syncNow() {
  if (!state) return;
  setStatus('syncing');
  try {
    await fetch('/api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) });
    setStatus('online');
    document.getElementById('last-sync').textContent = 'Last synced: ' + new Date().toLocaleTimeString();
  } catch (e) {
    setStatus('offline');
  }
}
function refresh() { fetchState(); }
ensureUsername();
updateUserDisplay();
heartbeatPresence();
fetchState();
fetchPresence();
updateModeSeg();
showWebSetupIfNeeded();
setInterval(fetchState, 2000);
setInterval(fetchPresence, 3000);
setInterval(heartbeatPresence, 10000);
setInterval(updateUserDisplay, 2000);

// heartbeat on visibility change and after any change
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) heartbeatPresence(); });
</script>
</body>
</html>
`;

// ── Presence (online users) ──────────────────────────────────────────
const presence = new Map<string, { id: string; user: string; isAdmin: boolean; lastSeen: number; projectId?: string }>();
const PRESENCE_TIMEOUT = 30000;
function cleanupPresence(){
  const now = Date.now();
  for(const [id, e] of presence.entries()) if(now - e.lastSeen > PRESENCE_TIMEOUT) presence.delete(id);
}
setInterval(cleanupPresence, 10000);

// ── Network helpers ───────────────────────────────────────────────

function getLocalIPs(): string[] {
  const nets = os.networkInterfaces();
  const ips: string[] = [];
  for (const ifaces of Object.values(nets)) {
    if (!ifaces) continue;
    for (const iface of ifaces) {
      // Include IPv4, skip internal loopback; also include link-local excluded via 169.254
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

async function ensureCert(): Promise<void> {
  const certDir = path.join(app.getPath("userData"), "canvas-cert");
  const certPath = path.join(certDir, "cert.pem");
  const keyPath = path.join(certDir, "key.pem");
  try {
    await fs.access(certPath);
    await fs.access(keyPath);
    return;
  } catch {}
  try {
    await fs.mkdir(certDir, { recursive: true });
    const ips = getLocalIPs();
    const san = ["DNS:localhost", "IP:127.0.0.1", ...ips.map((ip) => `IP:${ip}`)].join(",");
    await new Promise<void>((resolve, reject) => {
      const proc = spawn("openssl", [
        "req",
        "-x509",
        "-newkey",
        "rsa:2048",
        "-keyout",
        keyPath,
        "-out",
        certPath,
        "-days",
        "365",
        "-nodes",
        "-subj",
        "/CN=localhost",
        "-addext",
        `subjectAltName=${san}`,
      ]);
      proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`openssl exit ${code}`))));
      proc.on("error", reject);
    });
    logger.info("sync-service", `Generated self-signed cert at ${certPath} SAN=${san}`);
  } catch (e) {
    logger.warn("sync-service", "Failed to generate cert", e);
  }
}

async function getHttpsOptions(): Promise<{ cert: string; key: string } | null> {
  await ensureCert();
  try {
    const certPath = path.join(app.getPath("userData"), "canvas-cert", "cert.pem");
    const keyPath = path.join(app.getPath("userData"), "canvas-cert", "key.pem");
    const [cert, key] = await Promise.all([fs.readFile(certPath, "utf-8"), fs.readFile(keyPath, "utf-8")]);
    if (cert && key) return { cert, key };
  } catch {}
  // Fallback to tmp cert for dev
  try {
    const [cert, key] = await Promise.all([fs.readFile("/tmp/canvas-cert/cert.pem", "utf-8"), fs.readFile("/tmp/canvas-cert/key.pem", "utf-8")]);
    if (cert && key) return { cert, key };
  } catch {}
  return null;
}

function getNetworkUrls(port: number): string[] {
  const ips = getLocalIPs();
  // Use http for Safari compatibility (self-signed https often blocked) + https as alternative
  const urls = ips.map((ip) => `http://${ip}:${port}`);
  urls.unshift(`http://localhost:${port}`);
  // Also add https alternative for those who want encryption
  const httpsUrls = ips.map((ip) => `https://${ip}:${port}`);
  httpsUrls.unshift(`https://localhost:${port}`);
  // Return http first (for Safari), https second is available but may need cert trust
  return [...urls, ...httpsUrls];
}

// ── SyncService ──────────────────────────────────────────────────────

class SyncService {
  private dataPath: string | null = null;
  private saveQueue: Promise<void> = Promise.resolve();
  private currentState: WorkspaceState | null = null;
  private server: http.Server | https.Server | null = null;
  private port = 7531;
  private publicUrl: string | null = null;
  private tunnelProcess: ChildProcess | null = null;
  private listeners: Set<StateChangeListener> = new Set();

  private async getDataPath(): Promise<string> {
    if (!this.dataPath) {
      const userDataPath = app.getPath("userData");
      await fs.mkdir(userDataPath, { recursive: true });
      this.dataPath = path.join(userDataPath, "workspace-state.json");
    }
    return this.dataPath;
  }

  /** Load state from disk. Returns null on first run. */
  async load(): Promise<WorkspaceState | null> {
    try {
      const filePath = await this.getDataPath();
      const raw = await fs.readFile(filePath, "utf-8");
      const parsed: unknown = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        "projects" in parsed
      ) {
        this.currentState = parsed as WorkspaceState;
        return this.currentState;
      }
      throw new Error("workspace-state.json: invalid shape");
    } catch (error) {
      if (!isFileNotFound(error)) {
        logger.error("sync-service", "Failed to load workspace state", error);
      }
      return null;
    }
  }

  /** Persist state to disk atomically. */
  async save(state: WorkspaceState): Promise<void> {
    this.currentState = state;
    const snapshot = { ...state };
    const save = this.saveQueue
      .catch(() => undefined)
      .then(async () => {
        const filePath = await this.getDataPath();
        const tempPath = `${filePath}.${process.pid}.tmp`;
        try {
          await fs.writeFile(
            tempPath,
            JSON.stringify(snapshot, null, 2),
            "utf-8",
          );
          await fs.rename(tempPath, filePath);
        } finally {
          await fs.rm(tempPath, { force: true });
        }
      });
    this.saveQueue = save;
    await save;
  }

  /** Get the current in-memory state (for web API). */
  getState(): WorkspaceState | null {
    return this.currentState;
  }

  /** Replace state from an external source (web client). */
  async setState(state: WorkspaceState): Promise<void> {
    await this.save(state);
    this.notifyListeners();
  }

  /** Subscribe to state changes pushed from external clients. */
  onStateChange(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    if (this.currentState) {
      for (const listener of this.listeners) {
        listener(this.currentState);
      }
    }
  }

  /** Start the HTTPS server that serves the web client + REST API. */
  async startServer(): Promise<number> {
    if (this.server) return this.port;

    // Use http for Safari compatibility; https available on next port if cert exists
    const httpsOpts = await getHttpsOptions();

    return new Promise((resolve, reject) => {
      const handler = async (req: http.IncomingMessage, res: http.ServerResponse) => {
        // CORS headers for local access
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
          res.writeHead(204);
          res.end();
          return;
        }

        // REST API
        if (req.url === "/api/state" && req.method === "GET") {
          let state = this.getState();
          // If in-memory is empty but disk has data (e.g. after restart before first save), load it
          if (!state) {
            state = await this.load();
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(state ?? { projects: [], globalStickies: [] }));
          return;
        }

        if (req.url === "/api/info" && req.method === "GET") {
          const urls = getNetworkUrls(this.port);
          const hostname = os.hostname();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ port: this.port, urls, hostname, ips: getLocalIPs(), publicUrl: this.publicUrl }));
          return;
        }

        if (req.url === "/api/presence" && req.method === "GET") {
          cleanupPresence();
          const list = Array.from(presence.values()).map(v=>({ id: v.id, user: v.user, isAdmin: v.isAdmin, lastSeen: v.lastSeen, projectId: v.projectId }));
          // deduplicate by user (show unique usernames)
          const byUser = new Map<string, typeof list[0]>();
          for(const e of list) if(!byUser.has(e.user) || e.lastSeen > (byUser.get(e.user)?.lastSeen||0)) byUser.set(e.user, e);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ users: Array.from(byUser.values()), count: byUser.size, total: list.length }));
          return;
        }

        if (req.url === "/api/presence" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk)=>{ body+=chunk; if(body.length> 4096) req.destroy(); });
          req.on("end", ()=>{
            try{
              const data = JSON.parse(body);
              const id = String(data.id||"").slice(0,64) || "anon-" + Math.random().toString(36).slice(2,7);
              const user = String(data.user||"Anonymous").slice(0,24) || "Anonymous";
              const isAdmin = !!data.isAdmin;
              const projectId = data.projectId ? String(data.projectId).slice(0,64) : undefined;
              presence.set(id, { id, user, isAdmin, lastSeen: Date.now(), projectId });
              cleanupPresence();
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ ok: true, id }));
            }catch{
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
          });
          return;
        }

        if (req.url === "/api/state" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
            // Prevent large payloads
            if (body.length > 10 * 1024 * 1024) {
              req.destroy();
            }
          });
          req.on("end", async () => {
            try {
              const parsed: unknown = JSON.parse(body);
              if (
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed) &&
                "projects" in parsed
              ) {
                const state = parsed as WorkspaceState;
                state.lastSavedAt = Date.now();
                await this.setState(state);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ ok: true }));
              } else {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid state shape" }));
              }
            } catch {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
          });
          return;
        }

        // Serve web client
        if (req.url === "/" || req.url === "/index.html") {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(WEB_CLIENT_HTML);
          return;
        }

        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
      };
      const server = http.createServer(handler);
      // Also start https on next port if cert available (for those who want https)
      if (httpsOpts) {
        try {
          const httpsServer = https.createServer({ cert: httpsOpts.cert, key: httpsOpts.key }, handler);
          httpsServer.listen(port + 1, "0.0.0.0", () => {
            logger.info("sync-service", `HTTPS also available at https://localhost:${port + 1} (self-signed, Safari may block - use http)`);
          });
          httpsServer.on("error", (e) => logger.warn("sync-service", "HTTPS server error", e));
        } catch (e) {
          logger.warn("sync-service", "Failed to start https server", e);
        }
      }

      const onListening = async () => {
        const addr = server.address();
        const actualPort = addr && typeof addr === "object" ? addr.port : this.port;
        this.port = actualPort;
        this.server = server;
        // Pre-load persisted state so GET /api/state returns disk content immediately after restart
        try {
          const loaded = await this.load();
          if (loaded) {
            logger.info("sync-service", `Loaded workspace-state.json with ${loaded.projects.length} projects`);
          }
        } catch {
          // ignore
        }
        const urls = getNetworkUrls(actualPort);
        logger.info("sync-service", `Web client available at ${urls.join(", ")}`);
        logger.info("sync-service", `For access from other networks: allow port ${actualPort} in firewall, or use tunnel: 'npx localtunnel --port ${actualPort}' or Tailscale`);
        // Auto-start public tunnel for internet access (so friends on other networks can join without manual setup)
        this.startTunnel(actualPort).catch((e) => logger.warn("sync-service", "Tunnel failed to start", e));
        resolve(actualPort);
      };

      server.on("error", (err: unknown) => {
        const code = (err as { code?: string })?.code;
        if (code === "EADDRINUSE" || code === "EACCES") {
          logger.warn("sync-service", `Port ${this.port} unavailable (${code}), retrying on random port`);
          // Retry on random port on 0.0.0.0
          server.listen(0, "0.0.0.0", onListening);
        } else {
          logger.error("sync-service", "HTTP server error", err as Error);
          reject(err as Error);
        }
      });

      // Bind to 0.0.0.0 for LAN/WAN access (was 127.0.0.1 local-only)
      server.listen(this.port, "0.0.0.0", onListening);
    });
  }

  /** Stop the HTTP server. */
  async stopServer(): Promise<void> {
    await this.stopTunnel();
    if (!this.server) return;
    return new Promise((resolve) => {
      this.server?.close(() => {
        this.server = null;
        resolve();
      });
    });
  }

  getServerPort(): number {
    return this.port;
  }

  getPublicUrl(): string | null {
    return this.publicUrl;
  }

  getNetworkInfo(): { port: number; urls: string[]; hostname: string; ips: string[]; publicUrl: string | null } {
    return {
      port: this.port,
      urls: getNetworkUrls(this.port),
      hostname: os.hostname(),
      ips: getLocalIPs(),
      publicUrl: this.publicUrl,
    };
  }

  private async startTunnel(port: number): Promise<string | null> {
    if (this.tunnelProcess) return this.publicUrl;
    // Try cloudflared first (no interstitial, more reliable), fallback to localtunnel
    try {
      const { spawn } = require("node:child_process");
      // Check if cloudflared is available
      try {
        const { execSync } = require("node:child_process");
        execSync("which cloudflared", { stdio: "ignore" });
        // Use cloudflared tunnel --url
        return await new Promise<string | null>((resolve) => {
          const proc = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${port}`], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
          this.tunnelProcess = proc as unknown as import("node:child_process").ChildProcess;
          let url: string | null = null;
          let output = "";
          const onData = (d: Buffer) => {
            const text = d.toString();
            output += text;
            const m = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com[^\s|]*/i);
            if (m && !url) {
              url = m[0];
              this.publicUrl = url;
              logger.info("sync-service", `Public tunnel (cloudflared) available at ${url} — share this, no IP prompt`);
              resolve(url);
            }
            text.split("\n").forEach(l=>{ if(l.trim()) logger.info("sync-service", `[cloudflared] ${l.trim()}`); });
          };
          proc.stdout?.on("data", onData);
          proc.stderr?.on("data", onData);
          proc.on("error", (err: unknown) => { logger.warn("sync-service", "cloudflared spawn error", err); this.tunnelProcess=null; resolve(null); });
          proc.on("exit", (code: unknown) => {
            logger.warn("sync-service", `cloudflared tunnel exited code=${code} url=${url}`);
            this.tunnelProcess=null;
            if (!url) resolve(null);
            else { this.publicUrl=null; if(this.server) setTimeout(()=>this.startTunnel(port).catch(()=>{}), 5000); }
          });
          setTimeout(()=>{ if(!url){ logger.warn("sync-service", "cloudflared no URL in 20s, output: "+output.slice(0,1000)); resolve(null); } }, 20000);
        });
      } catch {}
      // Fallback to localtunnel random
      let lt: any;
      try { lt = require("/Users/rodrigoklayn/.nvm/versions/node/v20.20.2/lib/node_modules/localtunnel"); } catch { try { lt = require("localtunnel"); } catch { lt = null; } }
      if (lt) {
        const fallbackSub = "canvas-" + Math.random().toString(36).slice(2,8);
        const tunnel: any = await lt({ port, subdomain: fallbackSub });
        const url = tunnel.url as string;
        this.publicUrl = url;
        this.tunnelProcess = tunnel as unknown as import("node:child_process").ChildProcess;
        const handleClose = () => {
          logger.warn("sync-service", `Tunnel closed for ${url}, will restart in 5s`);
          this.tunnelProcess = null;
          this.publicUrl = null;
          if (this.server) setTimeout(() => this.startTunnel(port).catch(()=>{}), 5000);
        };
        tunnel.on("close", handleClose);
        tunnel.on("error", (e: unknown) => { logger.warn("sync-service", "Tunnel error", e); handleClose(); });
        setTimeout(async () => {
          try {
            const res = await fetch(url + "/api/info").then(r=>r.text()).catch(()=>null);
            if (!res || res.includes("Bad Gateway") || res.includes("Tunnel not found") || res.includes("503")) {
              logger.warn("sync-service", `Tunnel ${url} health check failed, restarting`);
              try { tunnel.close(); } catch {}
              handleClose();
            } else {
              logger.info("sync-service", `Tunnel health ok for ${url}`);
            }
          } catch {}
        }, 12000);
        logger.info("sync-service", `Public tunnel (fallback) available at ${url}`);
        return url;
      }
    } catch (e) {
      logger.warn("sync-service", "Tunnel failed", e);
    }
    return null;
  }

  private async stopTunnel(): Promise<void> {
    if (this.tunnelProcess) {
      try {
        this.tunnelProcess.kill();
      } catch {}
      this.tunnelProcess = null;
      this.publicUrl = null;
    }
  }
}

export const syncService = new SyncService();
