import { chromium } from 'playwright';

const base = process.env.GHT_URL || 'http://127.0.0.1:4173';
const executablePath = process.env.CHROMIUM_PATH || '/usr/local/bin/chromium';
const browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
const ok = (condition, message) => { if (!condition) throw new Error(message); };
const today = new Date().toISOString().slice(0, 10);
const yd = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const legacy = {
  schemaVersion: 6,
  areas: ['個人'], filter: '全部', tab: 'goals', activeGoal: 'g1', tlView: 'today',
  settings: { todayLimit: 10, reward: 'garden', upcomingDays: 7, reviewPopup: false, weekStart: 'mon', availability: null, scheduling: { maxFocus: 240, maxSession: 120, breakMinutes: 15 } },
  goals: [{ id: 'g1', title: '作品集', area: '個人', kind: 'achievement', color: '--blue', status: 'active', focus: true,
    projects: [{ id: 'p1', title: '第一版', milestones: [{ id: 'm1', title: '內容', due: today, done: false }] }], routines: [],
    tasks: [{ id: 't1', title: '整理案例', due: today, time: '10:00', estimate: null, done: false, target: 1, count: 0, pid: 'p1', mid: 'm1' }] }],
  events: [], sessions: [], timeBlocks: [], blockExceptions: [], externalEvents: [],
  dailyPlans: { [yd]: { itemIds: ['t1'], order: ['t1'] }, [today]: { itemIds: ['t1'], order: ['t1'] } },
  garden: { owned: ['rabbit'], placed: {}, collection: [], preview: '' }, gardenTab: 'garden', gardenNight: false
};
await page.goto(base);
await page.evaluate(data => { localStorage.clear(); localStorage.setItem('ght_state_blank', JSON.stringify(data)); }, legacy);
await page.reload();
await page.waitForTimeout(100);
const migrated = await page.evaluate(() => ({
  schemaVersion: state.schemaVersion,
  task: state.goals[0].tasks[0],
  session: state.sessions[0],
  balance: dropsAvail(),
  projectPct: (() => { const g=state.goals[0],p=g.projects[0]; return Math.round(p.milestones.reduce((n,m)=>n+milestoneFraction(g,m),0)/p.milestones.length*100); })(),
  goalPct: goalPct(state.goals[0])
}));
ok(migrated.schemaVersion === 7, 'schema did not migrate to 7');
ok(!('time' in migrated.task), 'legacy Task.time was not removed');
ok(migrated.task.estimateMinutes === null, 'unknown estimate was not preserved');
ok(migrated.session?.start === '10:00' && migrated.session.minutes === 60 && migrated.session.needsReview, 'legacy schedule was not migrated for review');
ok(migrated.balance >= 0, 'reward balance became negative');
ok(migrated.projectPct === migrated.goalPct, 'goal and project progress disagree');

await page.evaluate(() => doAction('t1'));
let stageDone = await page.evaluate(() => state.goals[0].projects[0].milestones[0].done);
ok(stageDone, 'stage did not derive completion from child task');
let history = await page.evaluate(y => state.dailyPlans[y].itemIds.slice(), yd);
ok(history.includes('t1'), 'completion erased historical DailyPlan');
await page.evaluate(() => doAction('t1'));
stageDone = await page.evaluate(() => state.goals[0].projects[0].milestones[0].done);
ok(!stageDone, 'stage did not reopen when child task reopened');
await page.evaluate(() => doAction('t1'));
const idempotent = await page.evaluate(() => ({
  events: state.events.filter(e => e.sourceKey === 'task:t1:done').length,
  rewards: state.rewardTransactions.filter(e => e.sourceKey === 'task:t1:done' && e.type === 'earn').length
}));
ok(idempotent.events === 1 && idempotent.rewards === 1, 'reopen/recomplete duplicated progress or reward');

await page.evaluate(() => { const g=state.goals[0]; g.projects=[]; repairTaskRelations(); });
const refs = await page.evaluate(() => ({ pid: state.goals[0].tasks[0].pid, mid: state.goals[0].tasks[0].mid }));
ok(refs.pid === null && refs.mid === null, 'invalid task relation was not repaired');

const garden = await page.evaluate(() => { const d=new Date();d.setDate(d.getDate()-7);const old=isoWeekKey(d);state.garden.collection=[];state.garden.weekKey=old;state.garden.weekStage=2;state.garden.weekSpecies='steady';state.garden.weekGoalTitle='舊目標';state.garden.weekColor='--blue';ensureGardenWeek();ensureGardenWeek();return state.garden.collection.filter(x=>x.weekKey===old); });
ok(garden.length===1 && garden[0].finalizedAt, 'GardenWeek did not finalize exactly once');
const habitBounds = await page.evaluate(t => { const r={rec:{freq:'day',interval:1,startsOn:t,maxOccurrences:1},completionDates:[]};return [habitDueOn(r,dueDate(t)),habitDueOn(r,dueDate(dateAdd(t,1)))]; }, today);
ok(habitBounds[0]===true && habitBounds[1]===false, 'habit maxOccurrences was not enforced');
await page.evaluate(() => { state.garden.collection=[]; state.events=[]; });
const dex = await page.evaluate(() => Number((speciesDexHTML().match(/花種圖鑑 · (\d+)\/6/)||[])[1]));
ok(dex === 0, 'provisional current species was counted as collected');
ok(errors.length === 0, `browser errors: ${errors.join(' | ')}`);
console.log('PASS: schema v7 browser smoke');
await browser.close();
