import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Check, Pin, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, GripVertical, X, Bell, BellOff } from 'lucide-react';

// ── Persistence shim ──────────────────────────────────────────────────────────
// Standalone deployments don't have the Claude-artifact `window.storage` API,
// so we back the same get/set interface with localStorage.
const storage = {
  async get(key: string, _shared = false) {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? { key, value: v, shared: _shared } : null;
    } catch {
      return null;
    }
  },
  async set(key: string, value: string, _shared = false) {
    try {
      localStorage.setItem(key, value);
      return { key, value, shared: _shared };
    } catch {
      return null;
    }
  },
};

// ── Autumn Boho Palette ───────────────────────────────────────────────────────
const C = {
  bg: '#F4EDE0', surface: '#FEFCF8', border: '#E0D3C2',
  textPrimary: '#3A3028', textSecondary: '#7A6E60', textMuted: '#AFA090',
  terracotta: '#BA7B55', ochre: '#B9955D', sage: '#798C72',
  canyonRose: '#C4927C', deepOlive: '#6C6642', sandDune: '#EADECE',
};
const GOAL_DEFS: Record<string, { accent: string }> = {
  freelance: { accent: C.terracotta },
  japanese:  { accent: C.sage },
  flower:    { accent: C.canyonRose },
  personal:  { accent: C.ochre },
};
const WEDDING_ACCENT = C.deepOlive;
const STORAGE_KEY = 'goal-habit-tracker-v3';
const ALARM_KEY   = 'goal-habit-alarm-v1';
const WEEKDAY_LABELS = ['一','二','三','四','五','六','日'];
const PRIORITY_ORDER: Record<string, number> = { '高': 0, '中': 1, '低': 2 };

// ── Utilities ─────────────────────────────────────────────────────────────────
const uid  = () => Math.random().toString(36).slice(2, 9);
const clone = (o: any) => JSON.parse(JSON.stringify(o));
const pad  = (n: number) => String(n).padStart(2, '0');
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const startOfWeek = (d: Date) => {
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  mon.setHours(0,0,0,0); return mon;
};
const weekKey  = (d: Date) => dateKey(startOfWeek(d));
const monthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}`;
const todayMidnight = () => { const t = new Date(); t.setHours(0,0,0,0); return t; };

function sortByDueThenPriority(items: any[]) {
  return [...items].sort((a,b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1; if (b.dueDate) return 1;
    return (PRIORITY_ORDER[a.priority]??1) - (PRIORITY_ORDER[b.priority]??1);
  });
}
function isRecurringDue(task: any, today: Date) {
  if (task.recurrence === 'daily') return !task.completions.includes(dateKey(today));
  if (task.recurrence === 'weekly') {
    const wkStart = startOfWeek(today);
    const scheduled = new Date(wkStart);
    scheduled.setDate(wkStart.getDate() + (task.weekday ?? 0));
    if (today.getTime() < scheduled.getTime()) return false;
    return !task.completions.includes(weekKey(today));
  }
  if (task.recurrence === 'monthly') {
    const scheduled = new Date(today.getFullYear(), today.getMonth(), task.dayOfMonth || 1);
    scheduled.setHours(0,0,0,0);
    if (today.getTime() < scheduled.getTime()) return false;
    return !task.completions.includes(monthKey(today));
  }
  return false;
}
function currentPeriodKey(task: any, today: Date) {
  if (task.recurrence === 'daily')   return dateKey(today);
  if (task.recurrence === 'weekly')  return weekKey(today);
  if (task.recurrence === 'monthly') return monthKey(today);
  return null;
}
function freqLabel(task: any) {
  if (task.recurrence === 'daily')   return '每日';
  if (task.recurrence === 'weekly')  return `每週${WEEKDAY_LABELS[task.weekday??0]}`;
  if (task.recurrence === 'monthly') return `每月 ${task.dayOfMonth||1} 日`;
  return '';
}
function getItemsForDay(data: any, labels: any, dayDate: Date) {
  const dKey  = dateKey(dayDate);
  const wdIdx = dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1;
  const dom   = dayDate.getDate();
  const items: any[] = [];
  data.wedding.tasks.forEach((t: any) => {
    if (t.dueDate === dKey) items.push({ id: t.id, text: t.text, accent: WEDDING_ACCENT, source: labels.wedding?.title||'Wedding', badge: t.status, subtasks: t.subtasks||[], ref: { scope:'wedding-once', taskId: t.id } });
  });
  data.wedding.recurring.forEach((t: any) => {
    if ((t.recurrence==='weekly'&&t.weekday===wdIdx)||(t.recurrence==='monthly'&&t.dayOfMonth===dom))
      items.push({ id: t.id, text: t.text, accent: WEDDING_ACCENT, source: labels.wedding?.title||'Wedding', badge: freqLabel(t), subtasks: t.subtasks||[], ref: { scope:'wedding-recurring', taskId: t.id } });
  });
  Object.entries(GOAL_DEFS).forEach(([key, def]) => {
    const src = labels[key]?.title || key;
    data.goals[key].tasks.forEach((t: any) => {
      if (t.recurrence === 'once') {
        if (t.dueDate === dKey) items.push({ id: t.id, text: t.text, accent: def.accent, source: src, badge: t.status, subtasks: t.subtasks||[], ref: { scope:'goal-once', goalKey: key, taskId: t.id } });
      } else if ((t.recurrence==='weekly'&&t.weekday===wdIdx)||(t.recurrence==='monthly'&&t.dayOfMonth===dom)) {
        items.push({ id: t.id, text: t.text, accent: def.accent, source: src, badge: freqLabel(t), subtasks: t.subtasks||[], ref: { scope:'goal-recurring', goalKey: key, taskId: t.id } });
      }
    });
  });
  return items;
}
function pinnedFirst(arr: any[], fn: (t: any) => boolean) { return [...arr.filter(fn), ...arr.filter(t => !fn(t))]; }
function moveWithinGroup(arr: any[], id: string, dir: 'up'|'down', groupFn: (t: any) => string) {
  const target = groupFn(arr.find(i => i.id === id));
  const indices = arr.reduce((acc: number[], item, idx) => { if (groupFn(item)===target) acc.push(idx); return acc; }, []);
  const cur = arr.findIndex(i => i.id === id);
  const pos = indices.indexOf(cur);
  const next = dir==='up' ? pos-1 : pos+1;
  if (next < 0 || next >= indices.length) return arr;
  const out = arr.slice();
  [out[cur], out[indices[next]]] = [out[indices[next]], out[cur]];
  return out;
}

// ── Data ──────────────────────────────────────────────────────────────────────
function defaultData() {
  const goals: Record<string, any> = {};
  Object.keys(GOAL_DEFS).forEach(k => { goals[k] = { tasks: [] }; });
  return {
    goals, wedding: { tasks: [], recurring: [] },
    todayOrder: [], inProgressOrder: [],
    goalLabels: {
      freelance: { title: 'Freelance', subtitle: '拓展接案業務' },
      japanese:  { title: '日文',      subtitle: '八月前修完 N3' },
      flower:    { title: '花藝',      subtitle: '成為花藝品牌主理人' },
      personal:  { title: '個人',      subtitle: '其他待辦事宜' },
      wedding:   { title: 'Wedding',   subtitle: '婚慶工作事項' },
    }
  };
}
function taskListFor(dataObj: any, ref: any) {
  if (ref.scope==='wedding-once')      return dataObj.wedding.tasks;
  if (ref.scope==='wedding-recurring') return dataObj.wedding.recurring;
  return dataObj.goals[ref.goalKey].tasks;
}

// ── Alarm helpers ─────────────────────────────────────────────────────────────
function loadAlarmSettings() {
  try {
    const raw = localStorage.getItem(ALARM_KEY);
    if (raw) return JSON.parse(raw);
  } catch(_) {}
  return { enabled: true, hour: 9, minute: 0 };
}
function saveAlarmSettings(s: any) {
  try { localStorage.setItem(ALARM_KEY, JSON.stringify(s)); } catch(_) {}
}

// ── EditableText ──────────────────────────────────────────────────────────────
function EditableText({ value, onSave, className, style, as: Tag = 'span' }: any) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const timer  = useRef<any>(null);
  const commit = (v: string) => { onSave(v || value); setEditing(false); };
  if (editing) return (
    <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={() => commit(draft)}
      onKeyDown={e => { if (e.key==='Enter') commit(draft); if (e.key==='Escape') { setDraft(value); setEditing(false); } }}
      className={className} style={{ ...style, background: 'transparent', outline: 'none', borderBottom: `1px solid ${C.border}`, minWidth: 80 }} />
  );
  return (
    <Tag className={className} style={{ ...style, cursor: 'text', userSelect: 'none' }}
      onPointerDown={() => { timer.current = setTimeout(() => setEditing(true), 500); }}
      onPointerUp={() => clearTimeout(timer.current)}
      onPointerLeave={() => clearTimeout(timer.current)}>
      {value}
    </Tag>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
function ProgressBar({ subtasks, accent }: any) {
  if (!subtasks || subtasks.length === 0) return null;
  const done = subtasks.filter((s: any) => s.done).length;
  const pct  = Math.round((done / subtasks.length) * 100);
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div style={{ flex: 1, height: 3, background: C.sandDune, borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 10, fontFamily: 'Space Mono, monospace', color: C.textMuted }}>{done}/{subtasks.length}</span>
    </div>
  );
}

// ── DraggableList ─────────────────────────────────────────────────────────────
function DraggableList({ items, itemKey, renderItem, onReorder }: any) {
  const containerRef = useRef<HTMLUListElement>(null);
  const [drag, setDrag] = useState<any>(null);
  const startDrag = (e: any, key: string) => {
    e.preventDefault();
    const children = Array.from(containerRef.current?.children || []);
    const positions = children.map(el => { const r = el.getBoundingClientRect(); return r.top + r.height/2; });
    setDrag({ key, startY: e.clientY, currentY: e.clientY, positions });
  };
  useEffect(() => {
    if (!drag) return;
    const move = (e: any) => setDrag((d: any) => d ? { ...d, currentY: e.clientY } : d);
    const up = () => setDrag((d: any) => {
      if (!d) return null;
      const fromIdx = items.findIndex((it: any) => itemKey(it) === d.key);
      let tIdx = 0, minDist = Infinity;
      d.positions.forEach((pos: number, idx: number) => { const dist = Math.abs(pos - d.currentY); if (dist < minDist) { minDist = dist; tIdx = idx; } });
      if (fromIdx !== -1 && tIdx !== fromIdx) {
        const next = items.slice(); const [moved] = next.splice(fromIdx, 1); next.splice(tIdx, 0, moved); onReorder(next);
      }
      return null;
    });
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  }, [drag, items, itemKey, onReorder]);
  return (
    <ul ref={containerRef} className="space-y-2">
      {items.map((item: any, idx: number) => {
        const key = itemKey(item);
        const isDragging = drag && drag.key === key;
        return (
          <li key={key} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, position: 'relative',
            transform: isDragging ? `translateY(${drag.currentY - drag.startY}px)` : undefined,
            zIndex: isDragging ? 20 : undefined, boxShadow: isDragging ? '0 8px 24px rgba(58,48,40,0.14)' : undefined }}>
            {renderItem(item, idx, { onPointerDown: (e: any) => startDrag(e, key) })}
          </li>
        );
      })}
    </ul>
  );
}

// ── TaskDetailCard ────────────────────────────────────────────────────────────
function TaskDetailCard({ task, accent, onClose, onAddSubtask, onToggleSubtask, onDeleteSubtask, onUpdateSubtaskDueDate }: any) {
  const [text, setText]     = useState('');
  const [newDue, setNewDue] = useState('');
  const subtasks = task.subtasks || [];
  const total = subtasks.length, completed = subtasks.filter((s: any) => s.done).length;
  const pct = total ? Math.round((completed/total)*100) : 0;
  const submit = () => { if (!text.trim()) return; onAddSubtask(text.trim(), newDue || null); setText(''); setNewDue(''); };
  const today = dateKey(todayMidnight());
  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', background:'rgba(58,48,40,0.38)' }} onClick={onClose}>
      <div style={{ background: C.surface, borderRadius: 12, width:'100%', maxWidth: 440, maxHeight:'82vh', overflowY:'auto', padding: 24, boxShadow:'0 24px 48px rgba(58,48,40,0.22)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily:'"Noto Serif TC",serif', fontWeight:700, fontSize:17, color: C.textPrimary, lineHeight:1.4, flex:1, paddingRight:12 }}>{task.text}</h3>
          <button onClick={onClose} style={{ flexShrink:0, padding:4, color: C.textMuted, background:'none', border:'none', cursor:'pointer' }} aria-label="關閉"><X size={18}/></button>
        </div>
        {total > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color: C.textMuted, marginBottom:6 }}>
              <span>完成進度</span><span style={{ fontFamily:'Space Mono,monospace', color: accent }}>{completed}/{total} · {pct}%</span>
            </div>
            <div style={{ height:4, background: C.sandDune, borderRadius:99, overflow:'hidden' }}>
              <div style={{ width:`${pct}%`, height:'100%', background: accent, borderRadius:99, transition:'width 0.45s ease' }}/>
            </div>
          </div>
        )}
        <ul style={{ listStyle:'none', padding:0, margin:'0 0 16px 0' }}>
          {subtasks.length === 0 && <li style={{ fontSize:13, color: C.textMuted, fontStyle:'italic' }}>尚無細項步驟。</li>}
          {subtasks.map((s: any) => {
            const overdue = s.dueDate && s.dueDate < today && !s.done;
            return (
              <li key={s.id} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'7px 0', borderBottom:`1px solid ${C.border}` }}>
                <button onClick={() => onToggleSubtask(s.id)} style={{ flexShrink:0, width:18, height:18, borderRadius:3, border:`1.5px solid ${accent}`, background: s.done ? accent : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', marginTop:2 }}>
                  {s.done && <Check size={11} color="#fff"/>}
                </button>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:13, color: s.done ? C.textMuted : C.textPrimary, textDecoration: s.done ? 'line-through' : 'none' }}>{s.text}</span>
                  <div style={{ marginTop:4 }}>
                    <input type="date" value={s.dueDate||''} onChange={e => onUpdateSubtaskDueDate(s.id, e.target.value || null)}
                      style={{ fontSize:11, color: overdue ? '#C0392B' : C.textMuted, background:'none', border:'none', cursor:'pointer', fontFamily:'Space Mono,monospace', outline:'none' }}/>
                  </div>
                </div>
                <button onClick={() => onDeleteSubtask(s.id)} style={{ flexShrink:0, padding:4, color: C.textMuted, background:'none', border:'none', cursor:'pointer' }} aria-label="移除"><Trash2 size={13}/></button>
              </li>
            );
          })}
        </ul>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key==='Enter') submit(); }}
            placeholder="添寫細項…" style={{ flex:1, minWidth:120, fontSize:13, padding:'8px 10px', background: C.bg, border:`1px solid ${C.border}`, borderRadius:6, color: C.textPrimary, outline:'none' }}/>
          <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
            style={{ fontSize:12, padding:'8px 8px', background: C.bg, border:`1px solid ${C.border}`, borderRadius:6, color: C.textSecondary, outline:'none' }}/>
          <button onClick={submit} style={{ flexShrink:0, padding:'8px 14px', background: accent, color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:4 }}><Plus size={14}/>加入</button>
        </div>
      </div>
    </div>
  );
}

// ── AlarmSettingsModal ────────────────────────────────────────────────────────
function AlarmSettingsModal({ alarm, onSave, onClose, todayItems }: any) {
  const [enabled, setEnabled] = useState(alarm.enabled);
  const [hour,    setHour]    = useState(alarm.hour);
  const [minute,  setMinute]  = useState(alarm.minute);
  const [permStatus, setPermStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const requestPerm = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermStatus(result);
  };

  const testNotification = () => {
    if (permStatus !== 'granted') return;
    const count = todayItems.length;
    new Notification('目標與習慣 · 今日提示', {
      body: count > 0
        ? `今日共有 ${count} 項事項待處理，加油！`
        : '今日暫無排定事項，輕鬆一下。',
      icon: '/favicon.ico',
    });
  };

  const save = () => {
    onSave({ enabled, hour, minute });
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(58,48,40,0.38)' }} onClick={onClose}>
      <div style={{ background: C.surface, borderRadius:12, width:'100%', maxWidth:380, padding:24, boxShadow:'0 24px 48px rgba(58,48,40,0.22)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Bell size={16} color={C.terracotta}/>
            <h3 style={{ fontFamily:'"Noto Serif TC",serif', fontWeight:700, fontSize:16, color:C.textPrimary, margin:0 }}>每日提醒設定</h3>
          </div>
          <button onClick={onClose} style={{ padding:4, color:C.textMuted, background:'none', border:'none', cursor:'pointer' }}><X size={18}/></button>
        </div>

        {permStatus !== 'granted' && (
          <div style={{ marginBottom:16, padding:12, background:'#FDF6EE', border:`1px solid ${C.border}`, borderRadius:8 }}>
            <p style={{ fontSize:12, color:C.textSecondary, margin:'0 0 8px 0', lineHeight:1.6 }}>
              {permStatus === 'denied'
                ? '瀏覽器已封鎖通知權限，請在瀏覽器設定中手動開啟。'
                : '需要授權才能顯示桌面通知。'}
            </p>
            {permStatus !== 'denied' && (
              <button onClick={requestPerm} style={{ fontSize:12, padding:'6px 14px', background:C.terracotta, color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>
                授權通知
              </button>
            )}
          </div>
        )}

        {permStatus === 'granted' && (
          <div style={{ marginBottom:16, padding:'8px 12px', background:'#F2F8F2', border:`1px solid #C8DFC8`, borderRadius:8, display:'flex', alignItems:'center', gap:6 }}>
            <Check size={13} color='#5A8C5A'/>
            <span style={{ fontSize:12, color:'#4A7A4A' }}>已取得通知授權</span>
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <span style={{ fontSize:13, color:C.textPrimary }}>啟用每日提醒</span>
          <button onClick={()=>setEnabled(!enabled)} style={{
            width:44, height:24, borderRadius:12, background: enabled ? C.terracotta : C.sandDune,
            border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s'
          }}>
            <span style={{ position:'absolute', top:3, left: enabled?22:3, width:18, height:18, borderRadius:99, background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
          </button>
        </div>

        <div style={{ marginBottom:20, opacity: enabled ? 1 : 0.4, pointerEvents: enabled ? 'auto' : 'none' }}>
          <p style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:C.textMuted, marginBottom:8 }}>提醒時間</p>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <input type="number" min="0" max="23" value={hour}
              onChange={e => setHour(Math.max(0, Math.min(23, Number(e.target.value))))}
              style={{ width:56, fontSize:20, fontFamily:'Space Mono,monospace', textAlign:'center', padding:'8px 6px', background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, color:C.textPrimary, outline:'none' }}/>
            <span style={{ fontSize:20, color:C.textMuted, fontFamily:'Space Mono,monospace' }}>:</span>
            <input type="number" min="0" max="59" value={minute}
              onChange={e => setMinute(Math.max(0, Math.min(59, Number(e.target.value))))}
              style={{ width:56, fontSize:20, fontFamily:'Space Mono,monospace', textAlign:'center', padding:'8px 6px', background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, color:C.textPrimary, outline:'none' }}/>
            <span style={{ fontSize:13, color:C.textMuted, marginLeft:4 }}> 每天</span>
          </div>
          <p style={{ fontSize:11, color:C.textMuted, marginTop:8, lineHeight:1.5 }}>
            ＊ 通知於 {pad(hour)}:{pad(minute)} 自動發送。頁面需保持開啟才能觸發。
          </p>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          {permStatus === 'granted' && (
            <button onClick={testNotification} style={{ flex:1, padding:'9px 0', background:'transparent', color:C.textSecondary, border:`1px solid ${C.border}`, borderRadius:6, cursor:'pointer', fontSize:12 }}>
              測試通知
            </button>
          )}
          <button onClick={save} style={{ flex:2, padding:'9px 0', background:C.terracotta, color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:13 }}>
            儲存設定
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form Components ───────────────────────────────────────────────────────────
const inputStyle = { width:'100%', fontSize:13, padding:'9px 11px', background: C.bg, border:`1px solid ${C.border}`, borderRadius:6, color: C.textPrimary, outline:'none', boxSizing:'border-box' as const };
const selectStyle = { fontSize:12, padding:'7px 9px', background: C.bg, border:`1px solid ${C.border}`, borderRadius:6, color: C.textSecondary, outline:'none' };
const pillBtnStyle = (active: boolean, accent: string) => ({ fontSize:11, padding:'5px 10px', borderRadius:20, border: `1px solid ${active ? accent : C.border}`, background: active ? accent : 'transparent', color: active ? '#fff' : C.textSecondary, cursor:'pointer', letterSpacing:'0.03em' });

function WeekdayPicker({ value, onChange, accent }: any) {
  return (
    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
      {WEEKDAY_LABELS.map((l,i) => (
        <button key={i} onClick={() => onChange(i)} style={{ ...pillBtnStyle(value===i, accent), width:30, padding:'5px 0', textAlign:'center' }}>{l}</button>
      ))}
    </div>
  );
}

function AddTaskForm({ accent, onAdd, isWeddingRecurring = false }: any) {
  const [text, setText]     = useState('');
  const [rec, setRec]       = useState(isWeddingRecurring ? 'weekly' : 'once');
  const [weekday, setWday]  = useState(0);
  const [dom, setDom]       = useState(1);
  const [status, setStatus] = useState('未開始');
  const [priority, setPrio] = useState('中');
  const [dueDate, setDue]   = useState('');
  const recOptions = isWeddingRecurring ? [['weekly','每週'],['monthly','每月']] : [['once','單次'],['daily','每日'],['weekly','每週'],['monthly','每月']];
  const submit = () => {
    if (!text.trim()) return;
    const task: any = { text: text.trim(), recurrence: rec };
    if (rec==='weekly') task.weekday = weekday;
    if (rec==='monthly') task.dayOfMonth = dom;
    if (rec==='once') { task.status = status; task.priority = priority; task.dueDate = dueDate || null; }
    onAdd(task); setText(''); setRec(isWeddingRecurring ? 'weekly' : 'once'); setDue('');
  };
  return (
    <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:14 }}>
      <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key==='Enter'&&rec==='once') submit(); }}
        placeholder={isWeddingRecurring ? '添寫定期事項…' : '添寫待辦事項…'} style={inputStyle}/>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:9 }}>
        {recOptions.map(([v,l]) => <button key={v} onClick={() => setRec(v)} style={pillBtnStyle(rec===v, accent)}>{l}</button>)}
      </div>
      {rec==='once' && (
        <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:9 }}>
          <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle}>
            {['未開始','進行中','完成'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={priority} onChange={e => setPrio(e.target.value)} style={selectStyle}>
            {['高','中','低'].map(p => <option key={p}>{p}優先</option>)}
          </select>
          <input type="date" value={dueDate} onChange={e => setDue(e.target.value)} style={{ ...selectStyle, cursor:'pointer' }}/>
        </div>
      )}
      {rec==='weekly' && <div style={{ marginTop:9 }}><WeekdayPicker value={weekday} onChange={setWday} accent={accent}/></div>}
      {rec==='monthly' && (
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:9 }}>
          <span style={{ fontSize:12, color: C.textSecondary }}>每月</span>
          <input type="number" min="1" max="31" value={dom} onChange={e => setDom(Number(e.target.value))} style={{ ...selectStyle, width:56 }}/>
          <span style={{ fontSize:12, color: C.textSecondary }}>日</span>
        </div>
      )}
      <button onClick={submit} style={{ marginTop:10, width:'100%', padding:'9px 0', background: accent, color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
        <Plus size={13}/>加入
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const cardStyle = { background: C.surface, border:`1px solid ${C.border}`, borderRadius:8 };
const sectionLabel = { fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase' as const, color: C.textMuted, fontFamily:'"Noto Sans TC",sans-serif' };
const serifBold = { fontFamily:'"Noto Serif TC",serif', fontWeight:700, color: C.textPrimary };

export default function GoalHabitTracker() {
  const [data, setData]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [tab, setTab]             = useState('today');
  const [detailRef, setDetailRef] = useState<any>(null);
  const [calMonth, setCalMonth]   = useState(() => { const d=new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; });
  const [selDate, setSelDate]     = useState<Date | null>(null);
  const [showAlarm, setShowAlarm] = useState(false);
  const [alarm, setAlarm]         = useState<any>(() => loadAlarmSettings());
  const alarmTimerRef             = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(STORAGE_KEY, false);
        const loaded = res?.value ? JSON.parse(res.value) : defaultData();
        if (!loaded.goalLabels) loaded.goalLabels = defaultData().goalLabels;
        if (!loaded.inProgressOrder) loaded.inProgressOrder = [];
        if (!loaded.todayOrder) loaded.todayOrder = [];
        setData(loaded);
      } catch(e: any) { setData(defaultData()); setDebugInfo('讀取時發生錯誤: '+(e?.message||String(e))); }
      finally { setLoading(false); }
    })();
  }, []);

  // ── Alarm scheduler ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!data) return;
    if (alarmTimerRef.current) clearTimeout(alarmTimerRef.current);
    if (!alarm.enabled) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const scheduleNext = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(alarm.hour, alarm.minute, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const delay = target.getTime() - now.getTime();

      alarmTimerRef.current = setTimeout(() => {
        const fireToday = todayMidnight();
        const labels = data.goalLabels || defaultData().goalLabels;
        const items: string[] = [];
        data.wedding.recurring.forEach((t: any) => { if(isRecurringDue(t,fireToday)) items.push(t.text); });
        const todayStr2 = dateKey(fireToday);
        data.wedding.tasks.forEach((t: any) => { if(t.status!=='完成'&&((t.dueDate&&t.dueDate<=todayStr2)||(!t.dueDate&&t.priority==='高'))) items.push(t.text); });
        Object.entries(GOAL_DEFS).forEach(([key]) => {
          data.goals[key].tasks.forEach((t: any) => {
            if(t.recurrence!=='once'&&isRecurringDue(t,fireToday)) items.push(t.text);
            if(t.recurrence==='once'&&t.status!=='完成'&&((t.dueDate&&t.dueDate<=todayStr2)||(!t.dueDate&&t.priority==='高'))) items.push(t.text);
          });
        });
        const count = items.length;
        new Notification('目標與習慣 · 今日提示', {
          body: count > 0
            ? `今日共有 ${count} 項事項，首項：${items[0]}`
            : '今日暫無排定事項，輕鬆一下。',
          icon: '/favicon.ico',
        });
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => { if (alarmTimerRef.current) clearTimeout(alarmTimerRef.current); };
  }, [alarm, data]);

  const persist = useCallback(async (next: any) => {
    setData(next);
    try {
      const res = await storage.set(STORAGE_KEY, JSON.stringify(next), false);
      if (!res) { setSaveError(true); setDebugInfo('storage.set 回傳空值'); }
      else { setSaveError(false); setDebugInfo(''); }
    } catch(e: any) { setSaveError(true); setDebugInfo('儲存錯誤: '+(e?.message||String(e))); }
  }, []);

  // ── Mutators ─────────────────────────────────────────────────────────────────
  const updateGoalLabel = (key: string, field: string, value: string) => { const n=clone(data); if (!n.goalLabels) n.goalLabels=defaultData().goalLabels; n.goalLabels[key][field]=value; persist(n); };
  const addGoalTask = (goalKey: string, task: any) => {
    const n=clone(data); const base = task.recurrence==='once' ? {id:uid(),subtasks:[]} : {id:uid(),pinned:false,completions:[],subtasks:[]};
    n.goals[goalKey].tasks.push({...base,...task}); persist(n);
  };
  const updateGoalOnce = (gk: string,tid: string,field: string,val: any) => { const n=clone(data); taskListFor(n,{scope:'goal-once',goalKey:gk,taskId:tid}).find((t: any)=>t.id===tid)[field]=val; persist(n); };
  const toggleGoalRecurring = (gk: string,tid: string) => {
    const n=clone(data); const t=n.goals[gk].tasks.find((t: any)=>t.id===tid);
    const k=currentPeriodKey(t,todayMidnight()); const i=t.completions.indexOf(k);
    if(i===-1) t.completions.push(k); else t.completions.splice(i,1); persist(n);
  };
  const deleteGoalTask   = (gk: string,tid: string) => { const n=clone(data); n.goals[gk].tasks=n.goals[gk].tasks.filter((t: any)=>t.id!==tid); persist(n); };
  const toggleGoalPinned = (gk: string,tid: string) => { const n=clone(data); const t=n.goals[gk].tasks.find((t: any)=>t.id===tid); t.pinned=!t.pinned; persist(n); };
  const moveGoalTask     = (gk: string,tid: string,dir: 'up'|'down') => { const n=clone(data); n.goals[gk].tasks=moveWithinGroup(n.goals[gk].tasks,tid,dir,(item: any)=>item.recurrence==='once'?`once-${item.priority==='高'?'p':'n'}`:`rec-${item.pinned?'p':'n'}`); persist(n); };

  const addWeddingOnce    = (task: any) => { const n=clone(data); n.wedding.tasks.push({id:uid(),subtasks:[],...task}); persist(n); };
  const updateWeddingOnce = (tid: string,field: string,val: any) => { const n=clone(data); n.wedding.tasks.find((t: any)=>t.id===tid)[field]=val; persist(n); };
  const deleteWeddingOnce = (tid: string) => { const n=clone(data); n.wedding.tasks=n.wedding.tasks.filter((t: any)=>t.id!==tid); persist(n); };
  const moveWeddingOnce   = (tid: string,dir: 'up'|'down') => { const n=clone(data); n.wedding.tasks=moveWithinGroup(n.wedding.tasks,tid,dir,(t: any)=>t.priority==='高'?'p':'n'); persist(n); };

  const addWeddingRecurring    = (task: any) => { const n=clone(data); n.wedding.recurring.push({id:uid(),completions:[],pinned:false,subtasks:[],...task}); persist(n); };
  const toggleWeddingRecurring = (tid: string) => {
    const n=clone(data); const t=n.wedding.recurring.find((t: any)=>t.id===tid);
    const k=currentPeriodKey(t,todayMidnight()); const i=t.completions.indexOf(k);
    if(i===-1) t.completions.push(k); else t.completions.splice(i,1); persist(n);
  };
  const deleteWeddingRecurring    = (tid: string) => { const n=clone(data); n.wedding.recurring=n.wedding.recurring.filter((t: any)=>t.id!==tid); persist(n); };
  const toggleWeddingRecurringPin = (tid: string) => { const n=clone(data); const t=n.wedding.recurring.find((t: any)=>t.id===tid); t.pinned=!t.pinned; persist(n); };
  const moveWeddingRecurring      = (tid: string,dir: 'up'|'down') => { const n=clone(data); n.wedding.recurring=moveWithinGroup(n.wedding.recurring,tid,dir,(t: any)=>t.pinned?'p':'n'); persist(n); };

  const addSubtask = (ref: any,text: string,dueDate: string|null) => {
    const n=clone(data); const t=taskListFor(n,ref).find((t: any)=>t.id===ref.taskId);
    if(!t.subtasks) t.subtasks=[]; t.subtasks.push({id:uid(),text,done:false,dueDate:dueDate||null}); persist(n);
  };
  const toggleSubtask = (ref: any,sid: string) => { const n=clone(data); const s=taskListFor(n,ref).find((t: any)=>t.id===ref.taskId).subtasks.find((s: any)=>s.id===sid); s.done=!s.done; persist(n); };
  const deleteSubtask = (ref: any,sid: string) => { const n=clone(data); const t=taskListFor(n,ref).find((t: any)=>t.id===ref.taskId); t.subtasks=t.subtasks.filter((s: any)=>s.id!==sid); persist(n); };
  const updateSubtaskDue = (ref: any,sid: string,val: string|null) => { const n=clone(data); const s=taskListFor(n,ref).find((t: any)=>t.id===ref.taskId).subtasks.find((s: any)=>s.id===sid); s.dueDate=val; persist(n); };

  const reorderToday       = (items: any[]) => { const n=clone(data); n.todayOrder=items.map(it=>`${it.ref.scope}-${it.id}`); persist(n); };
  const reorderInProgress  = (items: any[]) => { const n=clone(data); n.inProgressOrder=items.map(it=>`${it.ref.scope}-${it.id}`); persist(n); };

  const handleReset = () => { if(window.confirm('確認清除所有資料？此操作不可還原。')) persist(defaultData()); };

  const handleSaveAlarm = (newAlarm: any) => {
    setAlarm(newAlarm);
    saveAlarmSettings(newAlarm);
    setShowAlarm(false);
  };

  if (loading || !data) return (
    <div style={{ background: C.bg, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color: C.textSecondary, fontFamily:'"Noto Sans TC",sans-serif' }}>
      正在載入…
    </div>
  );

  // ── Derived data ─────────────────────────────────────────────────────────────
  const today   = todayMidnight();
  const labels  = data.goalLabels || defaultData().goalLabels;
  const todayStr = dateKey(today);

  const isOnceDue = (t: any) => t.status!=='完成' && ((t.dueDate&&t.dueDate<=todayStr)||(!t.dueDate&&t.priority==='高'));
  const onceBadge = (t: any) => {
    if (t.dueDate) return t.dueDate < todayStr ? '已逾期' : t.dueDate===todayStr ? '今日截止' : t.dueDate;
    return `${t.priority}優先`;
  };

  const todayItems: any[] = [];
  pinnedFirst(data.wedding.tasks,(t: any)=>t.priority==='高').forEach((t: any) => {
    if(isOnceDue(t)) todayItems.push({id:t.id,text:t.text,accent:WEDDING_ACCENT,source:labels.wedding?.title||'Wedding',badge:onceBadge(t),subtasks:t.subtasks||[],ref:{scope:'wedding-once',taskId:t.id}});
  });
  pinnedFirst(data.wedding.recurring,(t: any)=>t.pinned).forEach((t: any) => {
    if(isRecurringDue(t,today)) todayItems.push({id:t.id,text:t.text,accent:WEDDING_ACCENT,source:labels.wedding?.title||'Wedding',badge:freqLabel(t),subtasks:t.subtasks||[],ref:{scope:'wedding-recurring',taskId:t.id}});
  });
  Object.entries(GOAL_DEFS).forEach(([key,def]) => {
    const src = labels[key]?.title || key;
    const tasks = data.goals[key].tasks;
    pinnedFirst(tasks.filter((t: any)=>t.recurrence!=='once'),(t: any)=>t.pinned).forEach((t: any) => {
      if(isRecurringDue(t,today)) todayItems.push({id:t.id,text:t.text,accent:def.accent,source:src,badge:freqLabel(t),subtasks:t.subtasks||[],ref:{scope:'goal-recurring',goalKey:key,taskId:t.id}});
    });
    pinnedFirst(tasks.filter((t: any)=>t.recurrence==='once'),(t: any)=>t.priority==='高').forEach((t: any) => {
      if(isOnceDue(t)) todayItems.push({id:t.id,text:t.text,accent:def.accent,source:src,badge:onceBadge(t),subtasks:t.subtasks||[],ref:{scope:'goal-once',goalKey:key,taskId:t.id}});
    });
  });
  if (data.todayOrder?.length) {
    const pos = (it: any) => { const i=data.todayOrder.indexOf(`${it.ref.scope}-${it.id}`); return i===-1 ? Infinity : i; };
    todayItems.sort((a,b) => pos(a)-pos(b));
  }

  const rawInProgress: any[] = [];
  sortByDueThenPriority(pinnedFirst(data.wedding.tasks,(t: any)=>t.priority==='高').filter((t: any)=>t.status!=='完成')).forEach((t: any) => {
    rawInProgress.push({id:t.id,text:t.text,accent:WEDDING_ACCENT,source:labels.wedding?.title||'Wedding',badge:`${t.status}  ·  ${t.priority}優先${t.dueDate?' · '+t.dueDate:''}`,subtasks:t.subtasks||[],ref:{scope:'wedding-once',taskId:t.id}});
  });
  Object.entries(GOAL_DEFS).forEach(([key,def]) => {
    const src = labels[key]?.title || key;
    sortByDueThenPriority(pinnedFirst(data.goals[key].tasks.filter((t: any)=>t.recurrence==='once'),(t: any)=>t.priority==='高').filter((t: any)=>t.status!=='完成')).forEach((t: any) => {
      rawInProgress.push({id:t.id,text:t.text,accent:def.accent,source:src,badge:`${t.status}  ·  ${t.priority}優先${t.dueDate?' · '+t.dueDate:''}`,subtasks:t.subtasks||[],ref:{scope:'goal-once',goalKey:key,taskId:t.id}});
    });
  });
  let allInProgress = rawInProgress;
  if (data.inProgressOrder?.length) {
    const pos = (it: any) => { const i=data.inProgressOrder.indexOf(`${it.ref.scope}-${it.id}`); return i===-1 ? Infinity : i; };
    allInProgress = [...rawInProgress].sort((a,b) => pos(a)-pos(b));
  }

  const handleTodayToggle = (entry: any) => {
    const {scope,goalKey,taskId} = entry.ref;
    if(scope==='goal-once') updateGoalOnce(goalKey,taskId,'status','完成');
    else if(scope==='goal-recurring') toggleGoalRecurring(goalKey,taskId);
    else if(scope==='wedding-once') updateWeddingOnce(taskId,'status','完成');
    else if(scope==='wedding-recurring') toggleWeddingRecurring(taskId);
  };
  const getTaskByRef  = (ref: any) => ref ? (taskListFor(data,ref).find((t: any)=>t.id===ref.taskId)||null) : null;
  const getAccentByRef= (ref: any) => { if(!ref) return C.textPrimary; if(ref.scope.startsWith('wedding')) return WEDDING_ACCENT; return GOAL_DEFS[ref.goalKey]?.accent||C.textPrimary; };

  // ── Shared row renderer ───────────────────────────────────────────────────────
  const RowContent = ({ it, dragHandle }: any) => (
    <div style={{ padding:'10px 12px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {dragHandle && (
          <button {...dragHandle} style={{ flexShrink:0, color: C.textMuted, background:'none', border:'none', cursor:'grab', touchAction:'none', padding:2 }} aria-label="拖曳排序">
            <GripVertical size={13}/>
          </button>
        )}
        <button onClick={() => handleTodayToggle(it)} style={{ flexShrink:0, width:18, height:18, borderRadius:3, border:`1.5px solid ${it.accent}`, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }} aria-label="標記完成"/>
        <span style={{ width:6, height:6, borderRadius:99, background: it.accent, flexShrink:0 }}/>
        <button onClick={() => setDetailRef(it.ref)} style={{ flex:1, textAlign:'left', background:'none', border:'none', cursor:'pointer', fontSize:13, color: C.textPrimary, padding:0 }}>{it.text}</button>
        <span style={{ fontSize:10, color: C.textMuted, whiteSpace:'nowrap' }}>{it.source} · {it.badge}</span>
      </div>
      {it.subtasks?.length > 0 && <div style={{ paddingLeft:30 }}><ProgressBar subtasks={it.subtasks} accent={it.accent}/></div>}
    </div>
  );

  // ── Tab renders ───────────────────────────────────────────────────────────────
  const renderToday = () => (
    <div>
      <div style={{ marginBottom:24 }}>
        <p style={{ ...sectionLabel, marginBottom:10 }}>今日事項</p>
        {todayItems.length === 0 ? (
          <p style={{ fontSize:12, color: C.textMuted, fontStyle:'italic' }}>今日尚無排定事項。前往各分類設定習慣或截止日期，此處將自動彙整。</p>
        ) : (
          <DraggableList items={todayItems} itemKey={(it: any)=>`${it.ref.scope}-${it.id}`} onReorder={reorderToday}
            renderItem={(it: any,idx: number,dh: any) => <RowContent it={it} dragHandle={dh}/>}/>
        )}
      </div>
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:20 }}>
        <p style={{ ...sectionLabel, marginBottom:10 }}>全部進行事項 {allInProgress.length>0&&<span style={{ fontFamily:'Space Mono,monospace' }}>({allInProgress.length})</span>}</p>
        {allInProgress.length === 0 ? (
          <p style={{ fontSize:12, color: C.textMuted, fontStyle:'italic' }}>目前所有分類皆無進行中的待辦事項。</p>
        ) : (
          <DraggableList items={allInProgress} itemKey={(it: any)=>`${it.ref.scope}-${it.id}`} onReorder={reorderInProgress}
            renderItem={(it: any,idx: number,dh: any) => <RowContent it={it} dragHandle={dh}/>}/>
        )}
      </div>
      <button onClick={handleReset} style={{ marginTop:32, fontSize:11, color: C.textMuted, background:'none', border:'none', cursor:'pointer', textDecoration:'underline', letterSpacing:'0.04em' }}>清除所有資料</button>
    </div>
  );

  const renderGoalTab = (goalKey: string) => {
    const def    = GOAL_DEFS[goalKey];
    const tasks  = data.goals[goalKey].tasks;
    const habits  = pinnedFirst(tasks.filter((t: any)=>t.recurrence!=='once'), (t: any)=>t.pinned);
    const projects = pinnedFirst(tasks.filter((t: any)=>t.recurrence==='once'), (t: any)=>t.priority==='高');
    const doneCount = projects.filter((t: any)=>t.status==='完成').length;
    const lbl = labels[goalKey] || { title: goalKey, subtitle:'' };
    return (
      <div>
        <div style={{ borderLeft:`3px solid ${def.accent}`, paddingLeft:14, marginBottom:24 }}>
          <EditableText value={lbl.title} onSave={(v: string) => updateGoalLabel(goalKey,'title',v)} as="div" style={{ ...serifBold, fontSize:18 }}/>
          <EditableText value={lbl.subtitle} onSave={(v: string) => updateGoalLabel(goalKey,'subtitle',v)} as="div" style={{ fontSize:12, color: C.textSecondary, marginTop:3, fontStyle:'italic' }}/>
          <p style={{ fontSize:10, color: C.textMuted, marginTop:4 }}>長按文字以編輯</p>
        </div>
        <div style={{ marginBottom:24 }}>
          <p style={{ ...sectionLabel, marginBottom:10 }}>日常習慣</p>
          {habits.length === 0 && <p style={{ fontSize:12, color: C.textMuted, fontStyle:'italic', marginBottom:8 }}>尚未設定任何日常習慣。</p>}
          <ul style={{ listStyle:'none', padding:0, margin:'0 0 10px 0', display:'flex', flexDirection:'column', gap:8 }}>
            {habits.map((t: any,idx: number) => {
              const done = t.completions.includes(currentPeriodKey(t,today));
              const ref  = { scope:'goal-recurring', goalKey, taskId: t.id };
              return (
                <li key={t.id} style={cardStyle}>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <button onClick={()=>toggleGoalRecurring(goalKey,t.id)}
                        style={{ flexShrink:0, width:18, height:18, borderRadius:3, border:`1.5px solid ${def.accent}`, background: done?def.accent:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                        {done && <Check size={11} color="#fff"/>}
                      </button>
                      <button onClick={()=>setDetailRef(ref)} style={{ flex:1, textAlign:'left', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                        <div style={{ fontSize:13, color: C.textPrimary }}>{t.text}</div>
                        <div style={{ fontSize:11, color: C.textMuted, marginTop:2 }}>{freqLabel(t)} · 已完成 {t.completions.length} 次</div>
                        <ProgressBar subtasks={t.subtasks} accent={def.accent}/>
                      </button>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:2, padding:'0 8px 8px 8px' }}>
                    <button onClick={()=>toggleGoalPinned(goalKey,t.id)} style={{ padding:4, background:'none', border:'none', cursor:'pointer' }} aria-label="置頂">
                      <Pin size={12} fill={t.pinned?def.accent:'none'} color={t.pinned?def.accent:C.textMuted}/>
                    </button>
                    <button onClick={()=>moveGoalTask(goalKey,t.id,'up')} disabled={idx===0} style={{ padding:4, background:'none', border:'none', cursor:'pointer', opacity: idx===0?0.3:1 }}><ChevronUp size={13} color={C.textMuted}/></button>
                    <button onClick={()=>moveGoalTask(goalKey,t.id,'down')} disabled={idx===habits.length-1} style={{ padding:4, background:'none', border:'none', cursor:'pointer', opacity: idx===habits.length-1?0.3:1 }}><ChevronDown size={13} color={C.textMuted}/></button>
                    <button onClick={()=>deleteGoalTask(goalKey,t.id)} style={{ padding:4, background:'none', border:'none', cursor:'pointer' }} aria-label="移除"><Trash2 size={13} color={C.textMuted}/></button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div style={{ marginBottom:24 }}>
          <p style={{ ...sectionLabel, marginBottom:10 }}>
            待辦事項&nbsp;
            {projects.length>0 && <span style={{ fontFamily:'Space Mono,monospace', textTransform:'none', letterSpacing:0 }}>({doneCount}/{projects.length})</span>}
          </p>
          {projects.length === 0 && <p style={{ fontSize:12, color: C.textMuted, fontStyle:'italic', marginBottom:8 }}>尚無待辦事項。</p>}
          <ul style={{ listStyle:'none', padding:0, margin:'0 0 10px 0', display:'flex', flexDirection:'column', gap:8 }}>
            {projects.map((t: any,idx: number) => {
              const overdue = t.dueDate && t.dueDate < todayStr && t.status!=='完成';
              const ref = { scope:'goal-once', goalKey, taskId: t.id };
              return (
                <li key={t.id} style={cardStyle}>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                      <button onClick={()=>setDetailRef(ref)} style={{ flex:1, textAlign:'left', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                        <span style={{ fontSize:13, color: t.status==='完成'?C.textMuted:C.textPrimary, textDecoration: t.status==='完成'?'line-through':'none' }}>{t.text}</span>
                        <ProgressBar subtasks={t.subtasks} accent={def.accent}/>
                      </button>
                      <div style={{ display:'flex', gap:2, flexShrink:0 }}>
                        <button onClick={()=>moveGoalTask(goalKey,t.id,'up')} disabled={idx===0} style={{ padding:4, background:'none', border:'none', cursor:'pointer', opacity:idx===0?0.3:1 }}><ChevronUp size={13} color={C.textMuted}/></button>
                        <button onClick={()=>moveGoalTask(goalKey,t.id,'down')} disabled={idx===projects.length-1} style={{ padding:4, background:'none', border:'none', cursor:'pointer', opacity:idx===projects.length-1?0.3:1 }}><ChevronDown size={13} color={C.textMuted}/></button>
                        <button onClick={()=>deleteGoalTask(goalKey,t.id)} style={{ padding:4, background:'none', border:'none', cursor:'pointer' }} aria-label="移除"><Trash2 size={13} color={C.textMuted}/></button>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
                      <select value={t.status} onChange={e=>updateGoalOnce(goalKey,t.id,'status',e.target.value)} style={selectStyle}>
                        {['未開始','進行中','完成'].map(s=><option key={s}>{s}</option>)}
                      </select>
                      <select value={t.priority} onChange={e=>updateGoalOnce(goalKey,t.id,'priority',e.target.value)} style={selectStyle}>
                        {['高','中','低'].map(p=><option key={p}>{p}優先</option>)}
                      </select>
                      <input type="date" value={t.dueDate||''} onChange={e=>updateGoalOnce(goalKey,t.id,'dueDate',e.target.value||null)}
                        style={{ ...selectStyle, cursor:'pointer', color: overdue?'#C0392B':C.textSecondary, border: `1px solid ${overdue?'#E8A090':C.border}` }}/>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <AddTaskForm accent={def.accent} onAdd={(task: any) => addGoalTask(goalKey, task)}/>
      </div>
    );
  };

  const renderWeddingTab = () => {
    const recurring = pinnedFirst(data.wedding.recurring, (t: any)=>t.pinned);
    const onceTasks = pinnedFirst(data.wedding.tasks, (t: any)=>t.priority==='高');
    const lbl = labels.wedding || { title:'Wedding', subtitle:'' };
    return (
      <div>
        <div style={{ borderLeft:`3px solid ${WEDDING_ACCENT}`, paddingLeft:14, marginBottom:24 }}>
          <EditableText value={lbl.title} onSave={(v: string)=>updateGoalLabel('wedding','title',v)} as="div" style={{ ...serifBold, fontSize:18 }}/>
          <EditableText value={lbl.subtitle} onSave={(v: string)=>updateGoalLabel('wedding','subtitle',v)} as="div" style={{ fontSize:12, color: C.textSecondary, marginTop:3, fontStyle:'italic' }}/>
          <p style={{ fontSize:10, color: C.textMuted, marginTop:4 }}>長按文字以編輯</p>
        </div>
        <div style={{ marginBottom:24 }}>
          <p style={{ ...sectionLabel, marginBottom:10 }}>定期事項</p>
          {recurring.length===0 && <p style={{ fontSize:12, color: C.textMuted, fontStyle:'italic', marginBottom:8 }}>尚無定期事項。</p>}
          <ul style={{ listStyle:'none', padding:0, margin:'0 0 10px 0', display:'flex', flexDirection:'column', gap:8 }}>
            {recurring.map((t: any,idx: number) => {
              const done = t.completions.includes(currentPeriodKey(t,today));
              const ref  = { scope:'wedding-recurring', taskId: t.id };
              return (
                <li key={t.id} style={cardStyle}>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <button onClick={()=>toggleWeddingRecurring(t.id)} style={{ flexShrink:0, width:18, height:18, borderRadius:3, border:`1.5px solid ${WEDDING_ACCENT}`, background:done?WEDDING_ACCENT:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                        {done && <Check size={11} color="#fff"/>}
                      </button>
                      <button onClick={()=>setDetailRef(ref)} style={{ flex:1, textAlign:'left', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                        <div style={{ fontSize:13, color: C.textPrimary }}>{t.text}</div>
                        <div style={{ fontSize:11, color: C.textMuted, marginTop:2 }}>{freqLabel(t)} · 已完成 {t.completions.length} 次</div>
                        <ProgressBar subtasks={t.subtasks} accent={WEDDING_ACCENT}/>
                      </button>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:2, padding:'0 8px 8px 8px' }}>
                    <button onClick={()=>toggleWeddingRecurringPin(t.id)} style={{ padding:4, background:'none', border:'none', cursor:'pointer' }}>
                      <Pin size={12} fill={t.pinned?WEDDING_ACCENT:'none'} color={t.pinned?WEDDING_ACCENT:C.textMuted}/>
                    </button>
                    <button onClick={()=>moveWeddingRecurring(t.id,'up')} disabled={idx===0} style={{ padding:4, background:'none', border:'none', cursor:'pointer', opacity:idx===0?0.3:1 }}><ChevronUp size={13} color={C.textMuted}/></button>
                    <button onClick={()=>moveWeddingRecurring(t.id,'down')} disabled={idx===recurring.length-1} style={{ padding:4, background:'none', border:'none', cursor:'pointer', opacity:idx===recurring.length-1?0.3:1 }}><ChevronDown size={13} color={C.textMuted}/></button>
                    <button onClick={()=>deleteWeddingRecurring(t.id)} style={{ padding:4, background:'none', border:'none', cursor:'pointer' }}><Trash2 size={13} color={C.textMuted}/></button>
                  </div>
                </li>
              );
            })}
          </ul>
          <AddTaskForm accent={WEDDING_ACCENT} onAdd={addWeddingRecurring} isWeddingRecurring/>
        </div>
        <div>
          <p style={{ ...sectionLabel, marginBottom:10 }}>待辦事項</p>
          {onceTasks.length===0 && <p style={{ fontSize:12, color: C.textMuted, fontStyle:'italic', marginBottom:8 }}>尚無待辦事項。</p>}
          <ul style={{ listStyle:'none', padding:0, margin:'0 0 10px 0', display:'flex', flexDirection:'column', gap:8 }}>
            {onceTasks.map((t: any,idx: number) => {
              const overdue = t.dueDate && t.dueDate < todayStr && t.status!=='完成';
              const ref = { scope:'wedding-once', taskId: t.id };
              return (
                <li key={t.id} style={cardStyle}>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                      <button onClick={()=>setDetailRef(ref)} style={{ flex:1, textAlign:'left', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                        <span style={{ fontSize:13, color: t.status==='完成'?C.textMuted:C.textPrimary, textDecoration: t.status==='完成'?'line-through':'none' }}>{t.text}</span>
                        <ProgressBar subtasks={t.subtasks} accent={WEDDING_ACCENT}/>
                      </button>
                      <div style={{ display:'flex', gap:2, flexShrink:0 }}>
                        <button onClick={()=>moveWeddingOnce(t.id,'up')} disabled={idx===0} style={{ padding:4, background:'none', border:'none', cursor:'pointer', opacity:idx===0?0.3:1 }}><ChevronUp size={13} color={C.textMuted}/></button>
                        <button onClick={()=>moveWeddingOnce(t.id,'down')} disabled={idx===onceTasks.length-1} style={{ padding:4, background:'none', border:'none', cursor:'pointer', opacity:idx===onceTasks.length-1?0.3:1 }}><ChevronDown size={13} color={C.textMuted}/></button>
                        <button onClick={()=>deleteWeddingOnce(t.id)} style={{ padding:4, background:'none', border:'none', cursor:'pointer' }}><Trash2 size={13} color={C.textMuted}/></button>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
                      <select value={t.status} onChange={e=>updateWeddingOnce(t.id,'status',e.target.value)} style={selectStyle}>
                        {['未開始','進行中','完成'].map(s=><option key={s}>{s}</option>)}
                      </select>
                      <select value={t.priority} onChange={e=>updateWeddingOnce(t.id,'priority',e.target.value)} style={selectStyle}>
                        {['高','中','低'].map(p=><option key={p}>{p}優先</option>)}
                      </select>
                      <input type="date" value={t.dueDate||''} onChange={e=>updateWeddingOnce(t.id,'dueDate',e.target.value||null)}
                        style={{ ...selectStyle, cursor:'pointer', color: overdue?'#C0392B':C.textSecondary, border:`1px solid ${overdue?'#E8A090':C.border}` }}/>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <AddTaskForm accent={WEDDING_ACCENT} onAdd={addWeddingOnce}/>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const year = calMonth.getFullYear(), month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay===0 ? 6 : firstDay-1;
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const cells: (Date|null)[] = [];
    for(let i=0;i<startOffset;i++) cells.push(null);
    for(let d=1;d<=daysInMonth;d++) cells.push(new Date(year, month, d));
    const selItems = selDate ? getItemsForDay(data, labels, selDate) : [];
    return (
      <div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <button onClick={()=>setCalMonth(new Date(year,month-1,1))} style={{ padding:6, background:'none', border:'none', cursor:'pointer', color: C.textSecondary }}><ChevronLeft size={18}/></button>
          <span style={{ ...serifBold, fontSize:15 }}>{year}年{month+1}月</span>
          <button onClick={()=>setCalMonth(new Date(year,month+1,1))} style={{ padding:6, background:'none', border:'none', cursor:'pointer', color: C.textSecondary }}><ChevronRight size={18}/></button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:8 }}>
          {WEEKDAY_LABELS.map(d => <div key={d} style={{ textAlign:'center', fontSize:10, color: C.textMuted, padding:'4px 0', letterSpacing:'0.06em' }}>{d}</div>)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
          {cells.map((day,idx) => {
            if (!day) return <div key={`e${idx}`}/>;
            const dKey = dateKey(day);
            const isToday = dKey===todayStr;
            const isSel   = selDate && dateKey(selDate)===dKey;
            const items   = getItemsForDay(data, labels, day);
            return (
              <button key={dKey} onClick={()=>setSelDate(isSel?null:day)}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'5px 2px', borderRadius:6, background: isSel?C.textPrimary:isToday?C.sandDune:'transparent', border:'none', cursor:'pointer' }}>
                <span style={{ fontSize:12, color: isSel?'#FFF8F2':C.textPrimary }}>{day.getDate()}</span>
                {items.length>0 && (
                  <div style={{ display:'flex', gap:2, marginTop:2, flexWrap:'wrap', justifyContent:'center' }}>
                    {items.slice(0,4).map((it: any)=><span key={it.id} style={{ width:4, height:4, borderRadius:99, background: it.accent, display:'inline-block' }}/>)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {selDate && (
          <div style={{ marginTop:20 }}>
            <p style={{ ...sectionLabel, marginBottom:10 }}>
              {selDate.getMonth()+1}月{selDate.getDate()}日
              {selItems.length===0 && <span style={{ fontStyle:'italic', fontWeight:400, textTransform:'none', letterSpacing:0, color: C.textMuted }}> — 尚無事項</span>}
            </p>
            <ul style={{ listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:8 }}>
              {selItems.map((it: any) => (
                <li key={`cal-${it.ref.scope}-${it.id}`} style={{ ...cardStyle, padding:'10px 12px', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:6, height:6, borderRadius:99, background:it.accent, flexShrink:0 }}/>
                  <button onClick={()=>setDetailRef(it.ref)} style={{ flex:1, textAlign:'left', background:'none', border:'none', cursor:'pointer', fontSize:13, color: C.textPrimary, padding:0 }}>{it.text}</button>
                  <span style={{ fontSize:10, color: C.textMuted }}>{it.source} · {it.badge}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // ── Tab definitions ────────────────────────────────────────────────────────
  const detailTask   = getTaskByRef(detailRef);
  const detailAccent = getAccentByRef(detailRef);

  const ROW1_TABS = [
    { key:'today',    label:'今日' },
    { key:'calendar', label:'月曆' },
  ];
  const ROW2_TABS = [
    { key:'wedding',   label: labels.wedding?.title||'Wedding',   accent: WEDDING_ACCENT },
    { key:'freelance', label: labels.freelance?.title||'Freelance', accent: C.terracotta },
    { key:'japanese',  label: labels.japanese?.title||'日文',       accent: C.sage },
    { key:'flower',    label: labels.flower?.title||'花藝',         accent: C.canyonRose },
    { key:'personal',  label: labels.personal?.title||'個人',       accent: C.ochre },
  ];

  const alarmActive = alarm.enabled && typeof Notification !== 'undefined' && Notification.permission === 'granted';

  return (
    <div style={{ background: C.bg, minHeight:'100vh', color: C.textPrimary, fontFamily:'"Noto Sans TC",sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;700&family=Noto+Sans+TC:wght@400;500&family=Space+Mono&display=swap');*{box-sizing:border-box}button:focus-visible{outline:2px solid ${C.terracotta};outline-offset:2px}`}</style>

      {detailTask && (
        <TaskDetailCard task={detailTask} accent={detailAccent} onClose={()=>setDetailRef(null)}
          onAddSubtask={(text: string,due: string|null)=>addSubtask(detailRef,text,due)}
          onToggleSubtask={(sid: string)=>toggleSubtask(detailRef,sid)}
          onDeleteSubtask={(sid: string)=>deleteSubtask(detailRef,sid)}
          onUpdateSubtaskDueDate={(sid: string,val: string|null)=>updateSubtaskDue(detailRef,sid,val)}/>
      )}

      {showAlarm && (
        <AlarmSettingsModal alarm={alarm} onSave={handleSaveAlarm} onClose={()=>setShowAlarm(false)} todayItems={todayItems}/>
      )}

      <div style={{ maxWidth:480, margin:'0 auto', padding:'24px 16px 64px 16px' }}>
        <div style={{ marginBottom:20, borderBottom:`1px solid ${C.border}`, paddingBottom:16, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
              <h1 style={{ ...serifBold, fontSize:22, margin:0 }}>目標與習慣</h1>
              <span style={{ fontSize:11, color: C.textMuted, letterSpacing:'0.1em', textTransform:'uppercase' }}>Life Planner</span>
            </div>
            <p style={{ fontSize:12, color: C.textSecondary, marginTop:5, margin:'5px 0 0 0' }}>記錄每一分用心，成就你想成為的樣子。</p>
          </div>
          <button onClick={()=>setShowAlarm(true)}
            style={{ flexShrink:0, display:'flex', alignItems:'center', gap:5, padding:'6px 11px', borderRadius:20,
              border:`1px solid ${alarmActive ? C.terracotta : C.border}`,
              background: alarmActive ? `${C.terracotta}18` : 'transparent',
              color: alarmActive ? C.terracotta : C.textMuted,
              cursor:'pointer', fontSize:11, letterSpacing:'0.04em' }}
            aria-label="鬧鐘設定">
            {alarmActive ? <Bell size={13}/> : <BellOff size={13}/>}
            {alarmActive ? `${pad(alarm.hour)}:${pad(alarm.minute)}` : '提醒'}
          </button>
        </div>

        <div style={{ display:'flex', gap:4, marginBottom:6 }}>
          {ROW1_TABS.map(t => (
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{ flexShrink:0, padding:'6px 16px', fontSize:11, borderRadius:20,
                border:`1px solid ${tab===t.key ? C.textPrimary : C.border}`,
                background: tab===t.key ? C.textPrimary : 'transparent',
                color: tab===t.key ? '#FEFCF8' : C.textSecondary,
                cursor:'pointer', letterSpacing:'0.04em', fontFamily:'"Noto Sans TC",sans-serif' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:24 }}>
          {ROW2_TABS.map(t => (
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{ flexShrink:0, padding:'6px 12px', fontSize:11, borderRadius:20,
                border:`1px solid ${tab===t.key ? t.accent : C.border}`,
                background: tab===t.key ? t.accent : 'transparent',
                color: tab===t.key ? '#FEFCF8' : C.textSecondary,
                cursor:'pointer', letterSpacing:'0.04em', fontFamily:'"Noto Sans TC",sans-serif' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab==='today'     && renderToday()}
        {tab==='wedding'   && renderWeddingTab()}
        {tab==='freelance' && renderGoalTab('freelance')}
        {tab==='japanese'  && renderGoalTab('japanese')}
        {tab==='flower'    && renderGoalTab('flower')}
        {tab==='personal'  && renderGoalTab('personal')}
        {tab==='calendar'  && renderCalendar()}

        {saveError && (
          <div style={{ marginTop:24, padding:12, background:'#FDF0EE', border:`1px solid #E8BDBD`, borderRadius:8, fontSize:12, color:'#8B3A3A' }}>
            <div>資料暫未能儲存，近期變動可能在重新整理後消失。</div>
            {debugInfo && <div style={{ marginTop:4, fontFamily:'Space Mono,monospace', fontSize:10, color: C.textSecondary, wordBreak:'break-all' }}>{debugInfo}</div>}
            <button onClick={()=>persist(data)} style={{ marginTop:6, fontSize:11, color:'#8B3A3A', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>重新嘗試儲存</button>
          </div>
        )}
      </div>
    </div>
  );
}
