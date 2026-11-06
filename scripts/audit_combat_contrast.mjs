import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';

const css=readFileSync('src/components/combat/BattleArena.css','utf8');
const icons=readFileSync('src/components/ui/StatusIcon.tsx','utf8');
function rule(selector){
    const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(m=>m[1].trim()===selector);
    assert.equal(rules.length,1,`Expected one audited rule: ${selector}`);
    return rules[0][2];
}
function color(body,property){
    const match=body.match(new RegExp(`(?:^|;)\\s*${property}:\\s*(#[a-fA-F0-9]+)(?:;|\\s)`));
    assert.ok(match,`Missing ${property} in ${body}`);return match[1];
}
function rgba(hex){
    let value=hex.slice(1);if(value.length===3)value=[...value].map(c=>c+c).join('');
    assert.ok([6,8].includes(value.length));
    return [0,2,4].map(i=>parseInt(value.slice(i,i+2),16)).concat(value.length===8?parseInt(value.slice(6),16)/255:1);
}
const linear=n=>{const s=n/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4;};
const luminance=rgb=>rgb.slice(0,3).map(linear).reduce((n,c,i)=>n+c*[.2126,.7152,.0722][i],0);
const composite=(fg,bg)=>fg.slice(0,3).map((c,i)=>c*fg[3]+bg[i]*(1-fg[3]));
const ratio=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
const results=[];
function audit(name,foreground,backing,minimum){
    const fg=rgba(foreground),bg=rgba(backing),brightest=composite(bg,[255,255,255]);
    // All audited foreground channels exceed the brightest possible backing.
    // Thus white is the conservative worst case across any SDR scene RGB.
    assert.ok(fg[3]===1 && fg.slice(0,3).every((c,i)=>c>brightest[i]),name);
    const contrast=ratio(fg,brightest);
    assert.ok(contrast>=minimum,`${name}: ${contrast.toFixed(2)} < ${minimum}`);
    results.push({name,foreground,backing,minimum,worstCaseRatio:Number(contrast.toFixed(2))});
}
const shared=rule('.actor-target,.actor-hero-hud');
const white=color(shared,'color');
const hero=color(rule('.actor-hero-hud'),'background');
const enemy=color(rule('.actor-hud'),'background');
audit('Hero HP, Block, name and overflow',white,hero,4.5);
audit('Enemy HP, Block, name and overflow',white,enemy,4.5);
audit('Current intent',color(rule('.actor-hud b'),'color'),enemy,4.5);
for(const hex of new Set([...icons.matchAll(/color:'(#[a-fA-F0-9]+)'/g)].map(m=>m[1]))){
    audit(`Hero status icon ${hex}`,hex,hero,3);
    audit(`Enemy status icon ${hex}`,hex,enemy,3);
}
const selected=rule('.actor-target.is-selectable');
const focus=rule('.actor-target:focus-visible,.actor-hero-hud:focus-visible,.actor-target.is-selectable:hover');
assert.match(selected,/box-shadow:inset 0 0 0 2px #091525/);
assert.match(focus,/outline:2px solid #f7d29e; outline-offset:-2px; box-shadow:inset 0 0 0 4px #091525/);
audit('Selectable target against inner dark edge',color(selected,'border-color'),'#091525',3);
audit('Focused target against inner dark edge','#f7d29e','#091525',3);
audit('Actor slot marker border','#d5b88d',color(rule('.actor-slot-marker'),'background'),3);
writeFileSync('docs/combat-contrast-audit.json',JSON.stringify({
    method:'WCAG relative luminance; sRGB alpha composition over white bounds every SDR district RGB backing. Opaque foreground channels must exceed the brightest backing. Target edges are measured against their adjacent inset dark stroke.',
    limits:'CSS color audit only: excludes antialiasing, disabled/dead opacity, ancestor filters, device display conditions, other screens, and comprehension. Browser verification is still needed for actual placement and computed styles.',
    results
},null,2)+'\n');
console.log(`PASS: ${results.length} combat text/icon/edge contrast checks; minimum ${Math.min(...results.map(r=>r.worstCaseRatio))}:1`);
