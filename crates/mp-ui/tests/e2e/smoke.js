// End-to-end smoke test of the web UI in headless Chromium, driven over the
// DevTools protocol (no npm packages; needs `node --experimental-websocket`
// on Node 20). It plays the classic session: duplicate the demo master,
// make the copy bold with Weight ×2, put both masters in the design space,
// move a slider, export, and checks the page at every step.
//
//   crates/mp-ui/tests/e2e/run.sh   (builds the UI, serves it, runs this)
//   node --experimental-websocket smoke.js URL OUTDIR
//
// OUTDIR receives screenshots and the downloaded export bundle.
"use strict";
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const URL_ = process.argv[2], OUT = path.resolve(process.argv[3]);
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    const chrome = spawn('chromium', ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=9333',
        '--user-data-dir=' + path.join(OUT, 'profile'), '--window-size=1600,1000', 'about:blank'], { stdio: 'ignore' });
    let ws;
    try {
        let target;
        for (let i = 0; i < 50 && !target; i++) {
            await sleep(200);
            try { target = (await (await fetch('http://127.0.0.1:9333/json')).json()).find(t => t.type === 'page'); } catch (e) { }
        }
        ws = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise(r => ws.onopen = r);
        let id = 0; const pending = new Map(); const errors = [];
        ws.onmessage = m => {
            const d = JSON.parse(m.data);
            if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
            if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
            if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errors.push(d.params.args.map(a => a.value || a.description).join(' '));
        };
        const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
        const js = async (expr) => {
            const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
            if (r.result.exceptionDetails) throw new Error(expr + ': ' + JSON.stringify(r.result.exceptionDetails));
            return r.result.result.value;
        };
        const shot = async (name) => {
            const r = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.result.data, 'base64'));
        };
        const until = async (what, expr, ms = 30000) => {
            for (let t = 0; t < ms; t += 100) { if (await js(expr)) return; await sleep(100); }
            throw new Error('timeout: ' + what);
        };
        const check = (what, ok) => { console.log((ok ? 'ok   ' : 'FAIL ') + what); if (!ok) failed++; };
        let failed = 0;
        // DOM helpers inside the page
        const helpers = `
            window.$$ = s => Array.from(document.querySelectorAll(s));
            window.btn = (scope, text) => $$(scope + ' button').find(b => b.textContent.trim() === text);
            window.press = (scope, text) => { const b = btn(scope, text); if (!b) throw new Error('no button ' + text); b.click(); };
            true`;

        await send('Runtime.enable');
        await send('Page.enable');
        await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: OUT, eventsEnabled: true });
        await send('Page.navigate', { url: URL_ });
        await until('the app starts', `document.querySelectorAll('.specimen-field .glyph svg path').length > 5`);
        await js(helpers);
        check('demo master rendered: ' + await js(`$$('.panel.specimen .glyph').length`) + ' glyphs', await js(`$$('.panel.specimen .glyph').length === 11`));
        await shot('1-start');

        // duplicate; the copy becomes the selection
        await js(`press('.panel.masters', 'Duplicate'), true`);
        await until('two masters', `$$('.masters-list li').length === 2`);
        check('duplicate: the copy is selected', await js(`$$('.masters-list li.selected .name')[0]?.textContent === 'master-regular copy'`));

        // Weight × 2 on the copy
        await js(`$$('.selection-level .add')[0].click(), true`);
        await js(`press('.chooser', 'Weight'), press('.chooser', '×'), true`);
        await until('the operator field', `$$('.operator input').length === 1`);
        const before = await js(`$$('.panel.specimen .glyph svg path')[1].getAttribute('d')`);
        await js(`(() => { const i = $$('.operator input')[0]; i.value = '1+1'; i.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})); return true })()`);
        await until('the glyphs change', `$$('.panel.specimen .glyph svg path')[1].getAttribute('d') !== ${JSON.stringify(before)}`);
        check('Weight × (1+1) applied, field shows ' + await js(`$$('.operator input')[0].value`), await js(`$$('.operator input')[0].value === '2'`));

        // a glyph selection shows the glyph level with its effective width
        await js(`$$('.panel.specimen .glyph.selectable')[3].click(), true`);
        await until('glyph level', `$$('.selection-level').length === 2`);
        check('glyph level shows effective Width', await js(`$$('.selection-level')[1].textContent.includes('Width')`));

        // rubberband over the first four glyphs (M e t a): 4 glyphs selected
        await js(`(() => {
            const g = $$('.panel.specimen .glyph.selectable'), f = document.querySelector('.panel.specimen .specimen-field');
            const r0 = g[0].getBoundingClientRect(), r3 = g[3].getBoundingClientRect();
            const ev = (type, x, y) => f.dispatchEvent(new MouseEvent(type, {bubbles: true, clientX: x, clientY: y, button: 0}));
            ev('mousedown', r0.left + 2, r0.top + 2); ev('mousemove', r3.right - 2, r3.bottom - 2); ev('mouseup', r3.right - 2, r3.bottom - 2);
            return true })()`);
        await until('rubberband selection', `$$('.selection-level')[1]?.querySelector('.title small')?.textContent === '(4)'`, 5000).catch(() => {});
        check('rubberband selects 4 glyphs: ' + await js(`$$('.selection-level')[1]?.querySelector('.title small')?.textContent`),
              await js(`$$('.selection-level')[1]?.querySelector('.title small')?.textContent === '(4)'`));
        await shot('2-bold-copy');

        // both masters into the design space
        await js(`$$('.masters-list .to-space')[0].click(), true`);
        await until('an instance', `$$('.instances-list li').length === 1`);
        await js(`$$('.masters-list .to-space')[1].click(), true`);
        await until('two axes', `$$('.axis').length === 2`);
        check('instance specimen rendered', await js(`$$('.instance-specimen .glyph svg path').length > 5`));
        const inst0 = await js(`$$('.instance-specimen .glyph svg path')[1].getAttribute('d')`);
        await js(`(() => { const r = $$('.axis input[type=range]')[1]; r.value = '90'; r.dispatchEvent(new Event('change', {bubbles: true})); return true })()`);
        await until('the slider moves the instance', `$$('.instance-specimen .glyph svg path')[1].getAttribute('d') !== ${JSON.stringify(inst0)}`);
        const vals = await js(`$$('.axis .value').map(e => e.textContent)`);
        check('axes ' + JSON.stringify(vals), JSON.stringify(vals) === JSON.stringify(['10.0 · 10%', '90.0 · 90%']));
        await shot('3-design-space');

        // Glyph Range: every glyph of the master
        await js(`(() => { const sel = $$('.panel.specimen select')[0]; sel.value = sel.options[sel.options.length - 1].value; sel.dispatchEvent(new Event('change', {bubbles: true})); return true })()`);
        await until('glyph range', `$$('.panel.specimen .glyph').length > 100`);
        check('Glyph Range shows ' + await js(`$$('.panel.specimen .glyph').length`) + ' glyphs', await js(`$$('.panel.specimen .glyph').length === 173`));
        await shot('4-glyph-range');

        // uncheck all / check all
        await js(`press('.panel.instances', 'Uncheck all'), true`);
        await until('unchecked', `!$$('.instances-list input[type=checkbox]')[1].checked`);
        await js(`press('.panel.instances', 'Check all'), true`);
        await until('checked', `$$('.instances-list input[type=checkbox]')[1].checked`);
        check('uncheck all / check all', true);

        // export
        await js(`press('.panel.instances', 'Export fonts'), true`);
        let zip;
        for (let t = 0; t < 100 && !zip; t++) { await sleep(100); zip = fs.readdirSync(OUT).find(f => /^metapolator-export-.*\.zip$/.test(f)); }
        check('export bundle downloaded: ' + zip, !!zip && fs.statSync(path.join(OUT, zip)).size > 10000);
        check('status: ' + await js(`document.querySelector('.status').textContent`), await js(`document.querySelector('.status').textContent.startsWith('Exported')`));

        check('no errors in the console' + (errors.length ? ': ' + errors.join(' | ') : ''), errors.length === 0);
        console.log(failed ? `${failed} check(s) failed` : 'OK: all checks passed');
        process.exitCode = failed ? 1 : 0;
    } finally {
        if (ws) ws.close();
        chrome.kill();
    }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
