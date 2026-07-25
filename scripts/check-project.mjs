import fs from 'node:fs';
import vm from 'node:vm';

const fail = message => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

const htmlPath = new URL('../index.html', import.meta.url);
const html = fs.readFileSync(htmlPath, 'utf8');

if (!html.includes('<!DOCTYPE html>')) fail('Missing HTML doctype');
if (!html.includes('id="view"')) fail('Missing main view container');
if (!html.includes('id="modalRoot"')) fail('Missing modal root');
if (html.includes('�')) fail('Unicode replacement character found');
if (!html.includes('showGoalFirstPrompt')) fail('Missing blank-state goal guard');
if (!html.includes('reviewPoppedWeek')) fail('Missing weekly review key');
if (!html.includes('goalsModeNav')) fail('Missing Goals/Roadmap primary navigation');
if (!html.includes('openChooseToday')) fail('Missing choose-today flow');
if (!html.includes('今天，先走這三步')) fail('Missing Phase 2 priority card');
if (!html.includes('toggleLater')) fail('Missing collapsible later section');
if (!html.includes('tag goalctx')) fail('Missing goal context on Today cards');
if (!html.includes('.dashgarden{height:188px')) fail('Garden Hero was not compacted');
if (!html.includes('setupModalA11y')) fail('Missing dialog accessibility setup');
if (!html.includes('trapModalKey')) fail('Missing modal keyboard handling');
if (!html.includes('enhanceInteractiveSemantics')) fail('Missing keyboard semantics enhancement');
if (!html.includes('safe-area-inset-bottom')) fail('Missing iPhone safe-area support');
if (!html.includes('prefers-reduced-motion')) fail('Missing reduced-motion support');
if (!html.includes('validateImportData')) fail('Missing import validation');
if (!html.includes('ensureDailyPlans')) fail('Missing date-scoped daily plans');
if (!html.includes('completionDates')) fail('Missing dated habit completions');
if (!html.includes('cleanupRefs')) fail('Missing relation cleanup');
if (!html.includes('ensureGardenWeek')) fail('Missing weekly Garden lifecycle');
if (!html.includes('viewport-fit=cover')) fail('Missing full iPhone safe-area viewport');
if (!html.includes("['timeline','▤','日程']")) fail('Schedule navigation label is missing');
if (html.includes("['gantt','Roadmap']")) fail('Roadmap remains in Schedule tabs');
if (html.includes("onclick=\"startAdd('project',af.gid)\"><div class=\"ci\">📁")) fail('Project remains in global chooser');
if (html.includes('星座')) fail('Unimplemented constellation setting remains');
if (html.includes('介面語言')) fail('Unimplemented language setting remains');
if (fs.existsSync(new URL('../src/index.html', import.meta.url))) fail('Duplicate src/index.html exists');

if (!html.includes('function doAction(')) fail('Missing unified doAction handler');
if (!html.includes('function bumpTask(')) fail('Missing count-task progress handler');
if (!html.includes('countHTML')) fail('Missing task count field');
if (!html.includes("'task_progress'")) fail('Missing task progress event');
if (!html.includes('schemaVersion<5')) fail('Missing v5 migration');
if (!html.includes('schemaVersion:8')) fail('Default schema is not v8');
if (!html.includes('CURRENT_SCHEMA=8')) fail('Current schema constant is not v8');
if (!html.includes('schemaVersion||0)<7')) fail('Missing v7 migration');
if (!html.includes('schemaVersion||0)<8')) fail('Missing v8 migration');
if (!html.includes('repairTaskRelations')) fail('Missing task relation repair');
if (!html.includes('rewardTransactions')) fail('Missing reward transaction ledger');
if (!html.includes('structuredTimeline')) fail('Missing single Structured timeline');
if (!html.includes('openNewSlotDetail')) fail('Missing unified slot entry');
if (!html.includes('confirmRecurringTimelineMove')) fail('Missing recurring move choice');
if (!html.includes('beginTaskSort')) fail('Missing task long-press sorting');
if (!html.includes('reorderContainerTask')) fail('Missing due-date constrained sorting');
if (!html.includes('beginWeekDrag')) fail('Missing week cross-day drag');
if (!html.includes('weekdropbar')) fail('Missing week drop targets');
if (!html.includes('goalstatequiet')) fail('Missing quiet goal status summary');
if (!html.includes('function taskBrief(')) fail('Missing compact effort priority');
if (!html.includes('花園</button>') || !html.includes('圖鑑</button>') || !html.includes('造景</button>')) fail('Garden segmented control is incomplete');
if (!html.includes('settingspanel')) fail('Missing flat settings panel');
if (!html.includes('visualDurationHeight')) fail('Missing semi-proportional timeline height');
if (!html.includes('visualGapHeight')) fail('Missing graded compact gap heights');
if (!html.includes('timelineBacklogHTML')) fail('Missing collapsible unscheduled shelf');
if (!html.includes('thirdOverlapInfo')) fail('Missing manual third-overlap limit');
if (!html.includes('timelineConflictGroups')) fail('Missing imported overlap grouping');
if (!html.includes('scrollTimelineNow')) fail('Missing now auto-scroll');
if (!html.includes('compactAgendaComponents')) fail('Missing compact agenda layout');
if (!html.includes('早安，今天由這裡開始')) fail('Missing day start greeting');
if (!html.includes('pageSwipeStart')) fail('Missing page-level swipe');
if (!html.includes('dy/8*5')) fail('Missing relative five-minute drag');
if (!html.includes('elasticagenda')) fail('Missing persistent elastic timeline');
if (!html.includes('createTimelineDragProxy')) fail('Missing floating drag proxy');
if (!html.includes('updateProxyTime')) fail('Missing direct card drop preview');
if (!html.includes('timelineSnapTarget')) fail('Missing magnetic boundary snapping');
if (!html.includes('timelineDragGuide')) fail('Missing external drag time guide');
if (!html.includes('resolveTimelineDrop')) fail('Missing stable timeline drop resolver');
if (!html.includes('dragtimeguide.snapped{display:none!important}')) fail('Missing quiet snap drag hint');
if (!html.includes('proxy-drop')) fail('Missing drop settle state');
if (!html.includes('goalbullet')) fail('Missing goal bullet schedule picker');
if (!html.includes('sheetwarnactions')) fail('Missing discard warning sheet');
if (html.includes('＋ 階段 / 階段')) fail('Duplicated Stage wording remains');
if (!html.includes('openSchedulePicker')) fail('Missing manual scheduling picker');
if (!html.includes('beginTimelineDrag')) fail('Missing long-press timeline drag');
if (!html.includes('habitScheduleFor')) fail('Missing habit timeline occurrences');
if (html.includes("['cal','月曆']")) fail('Calendar remains in Schedule tabs');
if (!html.includes("const items=[['today','☀','今日'],['goals','◎','目標'],['timeline','▤','日程']]")) fail('Bottom navigation is not converged');
if (!html.includes('openGoalStatusSheet')) fail('Missing goal status sheet');
if (!html.includes('.modal,.filtersheet,.buysheet')) fail('Missing unified panel shell');
if (!html.includes('.pickerrow em{display:none}')) fail('Picker helper hints were not removed');
if (!html.includes('requestAnimationFrame(()=>{if(!el.isConnected)return;el.scrollTop=last*itemH;')) fail('Wheel init guard missing');
if (!html.includes('function directSheetMount(scope,body)')) fail('Direct planner sheet shell missing');
if (!html.includes('function directCalendarHTML(scope)')) fail('Custom inline calendar missing');
if (!html.includes('function directTimeEditorHTML(scope)')) fail('Start/end time editor missing');
if (!html.includes('function directEffortHTML(scope)')) fail('Task effort summary missing');
if (!html.includes('function directDurationHTML(scope)')) fail('Current session duration missing');
if (!html.includes('function directSetDuration(scope,minutes)')) fail('Editable duration wheel missing');
if (!html.includes('todayAllTasksView')) fail('Missing unified Today all-tasks section');
if (!html.includes("af=baseAf('task')")) fail('FAB does not open Add Action directly');
if (!html.includes('function viewGoals(){const areaList=state.goals;')) fail('Goal page still depends on Area or Roadmap view');
if (html.includes("key:'waiting'")) fail('Goal waiting status not removed');
if (html.includes("['waiting','等待']")) fail('Waiting goal filter not removed');

const matches = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
if (!matches.length) fail('No inline JavaScript found');
for (const [index, match] of matches.entries()) {
  try {
    new vm.Script(match[1], { filename: `index-inline-${index + 1}.js` });
  } catch (error) {
    fail(`Inline JavaScript syntax error: ${error.message}`);
  }
}

if (!process.exitCode) console.log('PASS: project checks completed');
