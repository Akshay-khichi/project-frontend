import { useEffect, useRef } from "react";

export default function CyberpunkArcade() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new GameEngine(canvas);
    gameRef.current = game;
    game.init();
    return () => game.destroy();
  }, []);
  return (
<div
  style={{
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    background: "#000",
  }}
>
      <canvas ref={canvasRef} style={{ display:"block",width:"100%",height:"100%" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS — single source of truth used by BOTH
// the live GameEngine and the PlayabilityValidator / bot.
// Changing any value here automatically updates both systems.
// ═══════════════════════════════════════════════════════════════════
const GRAVITY     = 2200;   // px / s²
const JUMP_VEL    = -700;   // px / s  (negative = up)
const JUMP_PAD_V  = -1050;  // px / s  (jump pad boost)
const PLAYER_W    = 36;     // px
const PLAYER_H    = 36;     // px
const GND_RATIO   = 0.78;   // groundY = H * GND_RATIO
const COYOTE      = 0.10;   // seconds of coyote time
const J_BUF       = 0.12;   // seconds of jump buffer
const BASE_SPEED  = 380;    // px / s at speed-mult 1.0
const TILE        = 64;     // layout grid unit  (px)
const HIT_M       = 8;      // hitbox inset margin (px) — fairness buffer

const C = {
  neon1:"#00f0ff", neon2:"#ff00aa", neon3:"#aaff00",
  neon4:"#ff6600", warn:"#ff2266",  gold:"#ffd700",
};

// ═══════════════════════════════════════════════════════════════════
//  PHYSICS HELPERS — derived limits, shared by builder + validator
// ═══════════════════════════════════════════════════════════════════
const PhysicsLib = {
  // How far can a player jump horizontally at a given speed?
  maxJumpDist(speedMult) {
    const spd = BASE_SPEED * speedMult;
    const airTime = (2 * Math.abs(JUMP_VEL)) / GRAVITY; // ~0.636 s
    return spd * airTime;
  },
  // Max jump height (px above ground)
  maxJumpHeight() {
    return (JUMP_VEL * JUMP_VEL) / (2 * GRAVITY); // ~111 px
  },
  // Jump-pad max height
  maxPadHeight() {
    return (JUMP_PAD_V * JUMP_PAD_V) / (2 * GRAVITY); // ~250 px
  },
  // Safe max consecutive spike tiles at a speed
  maxSpikeCluster(speedMult) {
    const dist = PhysicsLib.maxJumpDist(speedMult);
    const landingPad = TILE * 1.6; // guaranteed safe landing zone
    return Math.max(1, Math.floor((dist - landingPad) / (TILE * 0.85)));
  },
  // Min flat tiles needed AFTER an obstacle for reaction time
  minFlatAfter(speedMult) {
    const spd = BASE_SPEED * speedMult;
    const react = 0.28; // seconds
    return Math.max(2, Math.ceil((spd * react) / TILE));
  },
};

// ═══════════════════════════════════════════════════════════════════
//  PLAYABILITY VALIDATOR
//  Runs a headless perfect-bot simulation using EXACT same physics.
//  Returns { ok, failX, reason, botPath }.
// ═══════════════════════════════════════════════════════════════════
class PlayabilityValidator {
  constructor(groundY, viewW) {
    this.groundY = groundY;
    this.viewW   = viewW;
    this.SIM_DT  = 1 / 240;     // high-res step
    this.TIMEOUT = 90;           // seconds
  }

  validate(obstacles, platforms, portals, speedMult) {
    const gY    = this.groundY;
    const ceilY = gY * 0.15;
    const baseSpd = BASE_SPEED * speedMult;

    // Deep copies so we don't mutate originals
    const obs  = obstacles.map(o => ({ ...o }));
    const plat = platforms.map(p => ({ ...p }));
    const port = portals.map(p => ({ ...p, _hit: false }));

    const finishObj = obs.find(o => o.type === "finish");
    if (!finishObj) return { ok: true, reason: "no_finish", botPath: [] };

    // Bot state
    let px = this.viewW * 0.18;
    let py = gY - PLAYER_H;
    let vy = 0;
    let gravFlipped = false;
    let onGround = true;
    let coyoteT = 0;
    let spd = baseSpd;
    let t = 0;
    const botPath = [];
    let lastJumpX = -9999;
    let scroll = 0;
    const totalScrollNeeded = finishObj.x - px + PLAYER_W + TILE;

    const DT = this.SIM_DT;

    while (t < this.TIMEOUT) {
      t   += DT;
      spd  = Math.max(50, spd); // never stall
      scroll += spd * DT;

      // Scroll all objects
      for (const o of obs)  o.x -= spd * DT;
      for (const p of plat) p.x -= spd * DT;
      for (const p of port) p.x -= spd * DT;

      // ── Bot decision ──────────────────────────────────────────
      const lookAhead = spd * 0.38; // reaction window in px
      let doJump = false;

      for (const o of obs) {
        if (o.type === "finish") continue;
        const dist = o.x - (px + PLAYER_W);
        if (dist < -PLAYER_W || dist > lookAhead) continue;
        if (!o.ceiling) {
          // Floor spike: project position, jump if on collision course
          const tReach = dist / Math.max(spd, 1);
          const projY  = py + vy * tReach + 0.5 * GRAVITY * tReach * tReach;
          const spikeTop = o.y - o.h + HIT_M;
          if (projY + PLAYER_H > spikeTop && onGround) doJump = true;
        }
        // Ceiling spikes: bot does NOT jump (it crouches by not jumping)
      }
      // Platform above: jump to reach it
      for (const p of plat) {
        const dist = p.x - (px + PLAYER_W);
        if (dist >= 0 && dist < lookAhead * 0.6 && !gravFlipped) {
          if (p.y < gY - PLAYER_H - 10) doJump = true;
        }
      }

      if (doJump && onGround && (px - lastJumpX) > PLAYER_W * 0.8) {
        vy = gravFlipped ? Math.abs(JUMP_VEL) : JUMP_VEL;
        onGround = false; coyoteT = 0; lastJumpX = px;
      }

      // ── Physics ───────────────────────────────────────────────
      const grav = gravFlipped ? -GRAVITY : GRAVITY;
      vy += grav * DT;
      vy  = Math.max(-1500, Math.min(1500, vy));
      py += vy * DT;

      const groundSurf = gravFlipped ? ceilY + PLAYER_H : gY;

      if (!gravFlipped && py + PLAYER_H >= gY) {
        py = gY - PLAYER_H; vy = 0; onGround = true;
      } else if (gravFlipped && py <= ceilY) {
        py = ceilY; vy = 0; onGround = true;
      } else {
        onGround = false;
      }

      // Platform landing
      for (const p of plat) {
        if (this._ov(px+2, py, PLAYER_W-4, PLAYER_H, p.x, p.y, p.w, p.h)) {
          const fromTop = py + PLAYER_H - p.y;
          const fromBot = p.y + p.h - py;
          if (fromTop < fromBot && vy >= 0) {
            py = p.y - PLAYER_H; vy = 0; onGround = true;
          }
        }
      }

      // Portals
      for (const p of port) {
        if (this._ov(px+4, py+4, PLAYER_W-8, PLAYER_H-8, p.x, p.y, p.w, p.h)) {
          if (!p._hit) {
            p._hit = true;
            if (p.type === "jumpPad")    { vy = JUMP_PAD_V; onGround = false; lastJumpX = px; }
            if (p.type === "gravPortal") { gravFlipped = !gravFlipped; vy = 0; }
            if (p.type === "speedPortal"){ spd = BASE_SPEED * p.mult; }
          }
        } else { p._hit = false; }
      }

      // Coyote time
      if (onGround) coyoteT = COYOTE;
      else if (coyoteT > 0) coyoteT -= DT;

      // Record path (every ~10ms)
      if (Math.floor(t / 0.010) !== Math.floor((t - DT) / 0.010)) {
        botPath.push({ x: px, y: py });
      }

      // ── Collision check ───────────────────────────────────────
      for (const o of obs) {
        if (o.type === "finish") {
          if (px + PLAYER_W > o.x) return { ok: true, reason: "completed", botPath };
          continue;
        }
        const ox  = o.x + HIT_M;
        const oy  = o.ceiling ? o.y + HIT_M : o.y - o.h + HIT_M;
        const ow  = o.w - HIT_M * 2;
        const oh  = o.h - HIT_M * 2;
        if (this._ov(px+HIT_M, py+HIT_M, PLAYER_W-HIT_M*2, PLAYER_H-HIT_M*2, ox, oy, ow, oh)) {
          return { ok: false, failX: o.x, reason: `bot_hit_obstacle_x${Math.round(o.x)}`, botPath };
        }
      }

      if (py > this.groundY + 150 || py < -250) {
        return { ok: false, failX: px, reason: "bot_fell", botPath };
      }

      if (scroll >= totalScrollNeeded) {
        return { ok: true, reason: "scroll_done", botPath };
      }
    }

    return { ok: false, failX: px, reason: "timeout", botPath };
  }

  _ov(ax,ay,aw,ah, bx,by,bw,bh) {
    return ax<bx+bw && ax+aw>bx && ay<by+bh && ay+ah>by;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  SAFE LEVEL BUILDER
//  Converts segment definitions into world geometry while enforcing
//  every physics-based safety constraint before validation runs.
// ═══════════════════════════════════════════════════════════════════
class LevelBuilder {
  static build(def, groundY, viewW) {
    const { segments, speed: sm } = def;
    const gY    = groundY;
    const ceilY = gY * 0.15;
    const maxSpk = PhysicsLib.maxSpikeCluster(sm);
    const minF   = PhysicsLib.minFlatAfter(sm);
    const maxJH  = PhysicsLib.maxJumpHeight();

    const obstacles = [], platforms = [], portals = [];
    const log = [];
    let x = viewW * 1.1;

    for (const seg of segments) {
      switch (seg.type) {

        case "flat":
          x += TILE;
          break;

        case "spikes": {
          // ► RULE: clamp spike cluster to safe jump distance
          const raw = seg.count || 1;
          const cnt = Math.min(raw, maxSpk);
          if (cnt < raw) log.push(`⚠ Spikes clamped ${raw}→${cnt} at x≈${Math.round(x)}`);
          const ceil = !!seg.ceiling;
          for (let i = 0; i < cnt; i++) {
            obstacles.push({
              type:"spike", ceiling:ceil,
              x: x + i * TILE * 0.85,
              y: ceil ? ceilY : gY,
              w: TILE * 0.75, h: TILE * 0.75,
            });
          }
          // ► RULE: guaranteed minimum landing pad after spikes
          x += TILE * cnt * 0.85 + TILE * Math.max(minF * 0.7, 1);
          break;
        }

        case "jumpPad":
          portals.push({ type:"jumpPad", x, y:gY, w:TILE*0.8, h:TILE*0.35 });
          // ► RULE: 2-tile clearance after jump pad (player is airborne)
          x += TILE * 2.2;
          break;

        case "gravPortal": {
          // ► RULE: buffer before + after grav portals
          const buf = TILE * 1.2;
          portals.push({ type:"gravPortal", x:x+buf, y:ceilY, w:TILE*0.5, h:gY-ceilY });
          x += buf + TILE * 0.5 + TILE * 2.0;
          break;
        }

        case "speedPortal": {
          const mult = seg.mult;
          portals.push({ type:"speedPortal", x, y:ceilY, w:TILE*0.5, h:gY-ceilY, mult });
          // ► RULE: more buffer for speed-up portals (new reaction window)
          const afterBuf = mult > 1 ? minF * TILE * 1.2 : TILE * 1.0;
          x += TILE * 0.5 + afterBuf;
          break;
        }

        case "platform": {
          const ceil = !!seg.ceiling;
          const pw   = TILE * (seg.w || 2);
          const rawH = TILE * (seg.h || 1);
          // ► RULE: platform must be reachable — cap height at 85% of max jump
          const safeH = Math.min(rawH, maxJH * 0.85);
          if (safeH < rawH) log.push(`⚠ Platform height capped ${Math.round(rawH)}→${Math.round(safeH)}px at x≈${Math.round(x)}`);
          const py = ceil ? ceilY + safeH : gY - safeH - PLAYER_H;
          platforms.push({ x, y:py, w:pw, h:TILE*0.4 });
          x += pw + TILE;
          break;
        }

        case "finish":
          obstacles.push({ type:"finish", x, y:ceilY, w:TILE*0.5, h:gY-ceilY });
          x += TILE;
          break;

        default:
          x += TILE;
      }
    }

    return { obstacles, platforms, portals, log, totalWidth: x };
  }
}

// ═══════════════════════════════════════════════════════════════════
//  LEVEL DEFINITIONS  (safe segment primitives)
//  All spike counts are within safe bounds, but the validator will
//  catch and auto-repair anything that slips through anyway.
// ═══════════════════════════════════════════════════════════════════
const F = (n=1) => Array.from({length:n}, ()=>({type:"flat"}));
const SP = (n,c=false) => [{type:"spikes",count:n,ceiling:c}];
const PAD  = () => [{type:"jumpPad"}];
const GRAV = () => [{type:"gravPortal"}];
const SPD  = (m) => [{type:"speedPortal",mult:m}];
const PLT  = (w,h,c=false) => [{type:"platform",w,h,ceiling:c}];
const FIN  = () => [{type:"finish"}];

function buildLevelDefs() {
  return [
    // ── LEVEL 1: NEON DAWN  (tutorial — very forgiving) ──────────
    {
      id:1, name:"NEON DAWN", color:C.neon1, bgHue:180, speed:1.0,
      segments:[
        ...F(10),                              // long warm-up
        ...SP(1),   ...F(6),                   // single spike, big gap
        ...SP(2),   ...F(6),                   // two spikes, big gap
        ...PLT(3,1),...F(4),                   // low platform
        ...SP(1),   ...PAD(), ...F(5),         // spike then jump pad
        ...SP(2),   ...F(6),                   // two spikes
        ...PAD(),   ...F(3),  ...SP(1), ...F(5),
        ...FIN(),
      ],
    },
    // ── LEVEL 2: VELOCITY  (speed changes, still readable) ───────
    {
      id:2, name:"VELOCITY", color:C.neon3, bgHue:100, speed:1.2,
      segments:[
        ...F(6),
        ...SPD(1.4), ...F(4),
        ...SP(2),    ...F(5),
        ...PLT(2,1), ...F(4),
        ...SPD(0.8), ...F(5),
        ...SP(2),    ...F(5),
        ...PAD(),    ...F(3),  ...SP(1), ...F(5),
        ...SPD(1.5), ...SP(2), ...F(5),
        ...SP(1),    ...PAD(), ...F(3),  ...SP(1), ...F(4),
        ...FIN(),
      ],
    },
    // ── LEVEL 3: GRAVITY STORM  (gravity flips, balanced) ────────
    {
      id:3, name:"GRAVITY STORM", color:C.neon2, bgHue:300, speed:1.3,
      segments:[
        ...F(5),
        ...SP(1),     ...F(5),
        ...GRAV(),    ...F(3),
        ...SP(1,true),...F(5),          // ceil spike while flipped
        ...GRAV(),    ...F(4),          // flip back
        ...PAD(),     ...F(4),  ...SP(1), ...F(5),
        ...GRAV(),    ...SP(1,true), ...F(5), ...GRAV(),
        ...SP(2),     ...F(5),
        ...SPD(1.4),  ...SP(1), ...F(5),
        ...PAD(),     ...F(3),  ...GRAV(), ...F(5), ...GRAV(),
        ...SP(2),     ...F(5),
        ...FIN(),
      ],
    },
    // ── LEVEL 4: INFERNO  (tight but tested) ─────────────────────
    {
      id:4, name:"INFERNO", color:C.neon4, bgHue:20, speed:1.5,
      segments:[
        ...F(4),
        ...SP(2),    ...F(5),
        ...SPD(1.5), ...SP(2), ...F(5),
        ...PAD(),    ...SP(1), ...F(5),
        ...GRAV(),   ...SP(2,true), ...F(5), ...GRAV(),
        ...SP(3),    ...F(5),
        ...PLT(3,1), ...SP(1), ...F(4),
        ...SPD(1.8), ...SP(2), ...F(5),
        ...PAD(),    ...F(2),  ...SP(2), ...F(5),
        ...GRAV(),   ...SP(2,true), ...F(5), ...GRAV(),
        ...SP(3),    ...F(5),
        ...FIN(),
      ],
    },
    // ── LEVEL 5: APEX  (hardest — every pattern validated) ───────
    {
      id:5, name:"APEX", color:C.gold, bgHue:50, speed:1.7,
      segments:[
        ...F(4),
        ...SP(2),    ...F(4),  ...SP(1), ...F(4),
        ...SPD(1.7), ...SP(3), ...F(4),
        ...GRAV(),   ...SP(2,true), ...F(5), ...GRAV(),
        ...PAD(),    ...F(2),  ...SP(2), ...F(4),
        ...SPD(2.0), ...SP(2), ...F(4),
        ...GRAV(),   ...PLT(4,1,true), ...F(4), ...GRAV(),
        ...SP(3),    ...F(4),  ...PAD(), ...SP(2), ...F(4),
        ...SPD(2.3), ...SP(3), ...F(4),
        ...SP(2),    ...SP(2), ...F(5),
        ...FIN(),
      ],
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════
//  AUDIO ENGINE
// ═══════════════════════════════════════════════════════════════════
class AudioEngine {
  constructor() { this.ctx=null; this.master=null; this.nodes=[]; this.on=true; }
  init() {
    try {
      this.ctx = new (window.AudioContext||window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.32;
      this.master.connect(this.ctx.destination);
    } catch(e) { this.on=false; }
  }
  resume() { if(this.ctx?.state==="suspended") this.ctx.resume(); }
  _o(type,freq,gain,dur,del=0) {
    if(!this.on||!this.ctx) return;
    const t=this.ctx.currentTime+del;
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(gain,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t+dur+0.01);
  }
  jump()    { this._o("square",280,0.22,0.12); this._o("square",420,0.12,0.08,0.02); }
  land()    { this._o("sine",110,0.28,0.10); }
  death()   { this._o("sawtooth",200,0.35,0.05); this._o("sawtooth",140,0.28,0.10,0.05); this._o("square",80,0.3,0.3); }
  pad()     { this._o("sine",550,0.28,0.05); this._o("sine",880,0.18,0.12,0.03); this._o("sine",1100,0.12,0.10,0.08); }
  portal()  { this._o("sine",880,0.22,0.3); this._o("sine",660,0.18,0.3,0.05); }
  complete(){ [0,.1,.2,.35,.5].forEach((d,i)=>this._o("square",[330,440,550,660,880][i],0.28,0.25,d)); }
  startMusic(id) {
    this.stopMusic();
    if(!this.on||!this.ctx) return;
    const bpm=128+(id-1)*10, beat=60/bpm;
    this._drums(beat); this._bass(beat,id); this._lead(beat,id);
  }
  _drums(beat) {
    const go=()=>{
      if(!this.on) return;
      const t=this.ctx.currentTime;
      const k=this.ctx.createOscillator(),kg=this.ctx.createGain();
      k.type="sine"; k.frequency.setValueAtTime(160,t); k.frequency.exponentialRampToValueAtTime(40,t+0.08);
      kg.gain.setValueAtTime(0.65,t); kg.gain.exponentialRampToValueAtTime(0.001,t+0.2);
      k.connect(kg); kg.connect(this.master); k.start(t); k.stop(t+0.25);
      const buf=this.ctx.createBuffer(1,this.ctx.sampleRate*0.04,this.ctx.sampleRate);
      const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
      const src=this.ctx.createBufferSource(),hg=this.ctx.createGain(),hf=this.ctx.createBiquadFilter();
      hf.type="highpass"; hf.frequency.value=8000;
      hg.gain.setValueAtTime(0.12,t+beat/2); hg.gain.exponentialRampToValueAtTime(0.001,t+beat/2+0.04);
      src.buffer=buf; src.connect(hf); hf.connect(hg); hg.connect(this.master); src.start(t+beat/2);
      const id=setTimeout(go,beat*1000); this.nodes.push({stop:()=>clearTimeout(id)});
    }; go();
  }
  _bass(beat,lvl) {
    const notes=[[55,55,73,82],[65,65,87,98],[49,49,65,73]][lvl%3]; let s=0;
    const go=()=>{
      if(!this.on) return;
      const t=this.ctx.currentTime,f=notes[s%notes.length];
      const o=this.ctx.createOscillator(),g=this.ctx.createGain();
      o.type="sawtooth"; o.frequency.setValueAtTime(f,t);
      g.gain.setValueAtTime(0.16,t); g.gain.exponentialRampToValueAtTime(0.001,t+beat*0.9);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t+beat); s++;
      const id=setTimeout(go,beat*1000); this.nodes.push({stop:()=>clearTimeout(id)});
    }; go();
  }
  _lead(beat,lvl) {
    const scale=[0,3,5,7,10,12,15,17]; let s=0;
    const go=()=>{
      if(!this.on) return;
      if(Math.random()>0.35){
        const t=this.ctx.currentTime,base=220*Math.pow(2,(lvl-1)/12);
        const semi=scale[Math.floor(Math.random()*scale.length)];
        const o=this.ctx.createOscillator(),g=this.ctx.createGain();
        o.type="square"; o.frequency.setValueAtTime(base*Math.pow(2,semi/12),t);
        g.gain.setValueAtTime(0.07,t); g.gain.exponentialRampToValueAtTime(0.001,t+beat*0.4);
        o.connect(g); g.connect(this.master); o.start(t); o.stop(t+beat*0.45);
      }
      s++;
      const id=setTimeout(go,beat*500); this.nodes.push({stop:()=>clearTimeout(id)});
    }; go();
  }
  stopMusic() { this.nodes.forEach(n=>{try{n.stop();}catch(e){}}); this.nodes=[]; }
  destroy()   { this.stopMusic(); this.on=false; this.ctx?.close(); }
}

// ═══════════════════════════════════════════════════════════════════
//  PARTICLE ENGINE
// ═══════════════════════════════════════════════════════════════════
class ParticleEngine {
  constructor() { this.pool=[]; this.active=[]; for(let i=0;i<300;i++) this.pool.push(this._mk()); }
  _mk() { return {x:0,y:0,vx:0,vy:0,life:0,maxLife:1,size:2,color:"#fff",alpha:1,grav:0}; }
  _get() { return this.pool.pop()||this._mk(); }
  _ret(p) { this.pool.push(p); }
  emit(x,y,count,opts={}) {
    for(let i=0;i<count;i++){
      const p=this._get();
      const a=opts.angle!==undefined?opts.angle+(Math.random()-0.5)*(opts.spread||Math.PI*2):Math.random()*Math.PI*2;
      const spd=(opts.speed||150)*(0.5+Math.random()*0.8);
      p.x=x+(Math.random()-0.5)*(opts.scatter||0); p.y=y+(Math.random()-0.5)*(opts.scatter||0);
      p.vx=Math.cos(a)*spd; p.vy=Math.sin(a)*spd;
      p.life=0; p.maxLife=(opts.life||0.6)*(0.7+Math.random()*0.6);
      p.size=(opts.size||3)*(0.5+Math.random());
      p.color=Array.isArray(opts.color)?opts.color[Math.floor(Math.random()*opts.color.length)]:(opts.color||"#fff");
      p.alpha=1; p.grav=opts.gravity!==undefined?opts.gravity:400;
      this.active.push(p);
    }
  }
  update(dt) {
    for(let i=this.active.length-1;i>=0;i--){
      const p=this.active[i]; p.life+=dt;
      if(p.life>=p.maxLife){ this._ret(p); this.active.splice(i,1); continue; }
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=p.grav*dt; p.vx*=(1-2*dt); p.alpha=1-p.life/p.maxLife;
    }
  }
  draw(ctx) {
    for(const p of this.active){
      ctx.save(); ctx.globalAlpha=p.alpha; ctx.fillStyle=p.color;
      ctx.shadowColor=p.color; ctx.shadowBlur=p.size*2;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
//  GAME ENGINE
// ═══════════════════════════════════════════════════════════════════
class GameEngine {
  constructor(canvas) {
    this.canvas=canvas; this.ctx=canvas.getContext("2d");
    this.rafId=null; this.lastTime=0; this.dt=0;
    this.acc=0; this.STEP=1/120;
    this.fps=60; this.fpsT=0; this.fpsN=0;
    this.state="menu";
    this.defs=buildLevelDefs();
    this.idx=0;
    this.unlocked=this._loadP();
    // debug
    this.dbHitbox=false; this.dbBot=false; this.dbArc=false;
    this.valLog=[]; this.botPath=[]; this.lastVal=null;
    // camera
    this.shake=0; this.sX=0; this.sY=0;
    // subsystems
    this.audio=new AudioEngine(); this.fx=new ParticleEngine();
    // player
    this.P={x:0,y:0,vx:0,vy:0,w:PLAYER_W,h:PLAYER_H,onGround:false,alive:true,angle:0,flip:false};
    // world
    this.obs=[]; this.plat=[]; this.port=[];
    this.lvW=0; this.sm=1;
    // ui
    this.stars=[]; this.bgH=180;
    this.trans={on:false,a:0,dir:1};
    this.dTimer=0; this.cTimer=0; this.trail=[];
    this.mTick=0; this.prog=0; this.attempts=0;
    this.coyote=0; this.jBuf=0;
    this.lsRects=[]; this.lsBound=false;
  }

  // ── INIT ─────────────────────────────────────────────────────────
  init() {
    this._resize(); this._bind(); this.audio.init(); this._stars(); this._loop(0);
  }
  destroy() { cancelAnimationFrame(this.rafId); this._unbind(); this.audio.destroy(); }

  _resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = this.canvas.parentElement.getBoundingClientRect();
  const w = Math.floor(rect.width);
  const h = Math.floor(rect.height);

  this.canvas.width = w * dpr;
  this.canvas.height = h * dpr;

  this.canvas.style.width = "100%";
  this.canvas.style.height = "100%";

  this.ctx.setTransform(1, 0, 0, 1, 0, 0);   // IMPORTANT
  this.ctx.scale(dpr, dpr);

  this.W = w;
  this.H = h;
  this.gY = h * GND_RATIO;
}

  _bind() {
    this.keys={};
    this._rz=()=>this._resize();
    this._kd=(e)=>this._key(e);
    this._ku=(e)=>{this.keys[e.code]=false;};
    this._md=(e)=>{e.preventDefault();this._jump();};
    this._td=(e)=>{e.preventDefault();this._jump();};
    window.addEventListener("resize",this._rz);
    window.addEventListener("keydown",this._kd,{passive:false});
    window.addEventListener("keyup",this._ku);
    this.canvas.addEventListener("mousedown",this._md);
    this.canvas.addEventListener("touchstart",this._td,{passive:false});
  }
  _unbind() {
    window.removeEventListener("resize",this._rz);
    window.removeEventListener("keydown",this._kd);
    window.removeEventListener("keyup",this._ku);
    this.canvas.removeEventListener("mousedown",this._md);
    this.canvas.removeEventListener("touchstart",this._td);
  }
  _key(e) {
    this.keys[e.code]=true;
    if(e.code==="Space"||e.code==="Enter"){ e.preventDefault(); this._jump(); }
    if(e.code==="Escape") this._pause();
    if(e.code==="KeyH") this.dbHitbox=!this.dbHitbox;
    if(e.code==="KeyB") this.dbBot=!this.dbBot;
    if(e.code==="KeyJ") this.dbArc=!this.dbArc;
    if(e.code==="KeyR"&&(this.state==="playing"||this.state==="dead")) this._restart();
  }
  _jump() {
    this.audio.resume();
    if(this.state==="menu")          { this._goLS(); return; }
    if(this.state==="dead")          { this._restart(); return; }
    if(this.state==="levelComplete") { this._next(); return; }
    if(this.state==="paused")        { this._pause(); return; }
    if(this.state==="playing")       { this.jBuf=J_BUF; }
  }
  _pause() {
    if(this.state==="playing")  { this.state="paused"; this.audio.stopMusic(); }
    else if(this.state==="paused") { this.state="playing"; this.audio.startMusic(this.defs[this.idx].id); this.lastTime=performance.now(); }
  }

  _loadP() { try{ return JSON.parse(localStorage.getItem("nd2_p")||"{}").u||1; } catch{ return 1; } }
  _saveP(u) { try{ localStorage.setItem("nd2_p",JSON.stringify({u})); } catch{} }

  _stars() {
    this.stars=Array.from({length:120},()=>({
      x:Math.random(), y:Math.random()*0.75,
      sz:Math.random()*1.5+0.3, sp:Math.random()*0.3+0.1, a:Math.random()*0.7+0.3,
    }));
  }

  // ── LOAD LEVEL (build → validate → auto-repair) ───────────────
  _loadLevel(i) {
    this.idx=i;
    const def=this.defs[i];
    this.bgH=def.bgHue; this.sm=def.speed;

    // 1. Build with safety constraints
    const built=LevelBuilder.build(def, this.gY, this.W);
    this.obs=built.obstacles; this.plat=built.platforms; this.port=built.portals;
    this.lvW=built.totalWidth; this.valLog=[...built.log];

    // 2. Validate with physics bot
    const val=new PlayabilityValidator(this.gY, this.W);
    let res=val.validate(
      this.obs.map(o=>({...o})), this.plat.map(p=>({...p})), this.port.map(p=>({...p})), def.speed
    );
    this.botPath=res.botPath||[];
    this.lastVal=res;

    if(!res.ok) {
      // 3. Auto-repair: remove offending obstacle(s)
      console.warn("[VAL] FAIL:",res.reason,"failX=",res.failX);
      this.valLog.push(`⚠ Bot failed: ${res.reason}`);
      if(res.failX!=null) {
        const before=this.obs.length;
        this.obs=this.obs.filter(o=>o.type==="finish"||Math.abs(o.x-res.failX)>TILE*2.5);
        this.valLog.push(`  Removed ${before-this.obs.length} obstacle(s) near x=${Math.round(res.failX)}`);
      }
      // 4. Re-validate after repair
      const res2=val.validate(
        this.obs.map(o=>({...o})), this.plat.map(p=>({...p})), this.port.map(p=>({...p})), def.speed
      );
      this.botPath=res2.botPath||[];
      this.lastVal=res2;
      this.valLog.push(res2.ok ? `✓ Repaired & validated OK` : `✗ Repair incomplete — see console`);
      if(!res2.ok) console.warn("[VAL] Still failing after repair:",res2.reason);
    } else {
      this.valLog.push(`✓ Validated OK (${res.reason})`);
    }

    // Reset player
    const p=this.P;
    p.x=this.W*0.18; p.y=this.gY-PLAYER_H;
    p.vx=0; p.vy=0; p.onGround=true; p.alive=true; p.angle=0; p.flip=false;
    this.trail=[]; this.shake=0; this.sX=0; this.sY=0;
    this.prog=0; this.coyote=0; this.jBuf=0;
  }

  _goLS() { this.state="levelSelect"; this.lsBound=false; }

  _startLevel(i) {
    this.state="loading"; this.trans={on:true,a:0,dir:1};
    setTimeout(()=>{
      this._loadLevel(i); this.attempts=0;
      this.audio.startMusic(this.defs[i].id);
      this.state="playing"; this.lastTime=performance.now();
      this.trans={on:true,a:1,dir:-1};
    },360);
  }

  _restart() {
    this.attempts++; this.fx.active=[]; this.audio.stopMusic();
    this._loadLevel(this.idx);
    this.audio.startMusic(this.defs[this.idx].id);
    this.state="playing"; this.dTimer=0; this.lastTime=performance.now();
  }

  _next() {
    const n=this.idx+1;
    if(n<this.defs.length) this._startLevel(n);
    else this.state="menu";
  }

  // ── MAIN LOOP ─────────────────────────────────────────────────
  _loop(ts) {
    this.rafId=requestAnimationFrame(t=>this._loop(t));
    const raw=Math.min((ts-this.lastTime)/1000,0.05);
    this.lastTime=ts; this.dt=raw;
    this.fpsN++; this.fpsT+=raw;
    if(this.fpsT>=0.5){ this.fps=Math.round(this.fpsN/this.fpsT); this.fpsT=0; this.fpsN=0; }
    if(this.trans.on){
      this.trans.a+=this.trans.dir*raw*3.5;
      if(this.trans.dir===-1&&this.trans.a<=0){ this.trans.a=0; this.trans.on=false; }
    }
    if(this.state==="playing"){
      this.acc+=raw;
      while(this.acc>=this.STEP){ this._fixed(this.STEP); this.acc-=this.STEP; }
    }
    if(this.state==="menu"||this.state==="levelSelect") this.mTick+=raw;
    this._draw();
  }

  // ── FIXED UPDATE ─────────────────────────────────────────────
  _fixed(dt) {
    const p=this.P;
    const gY=this.gY, cY=gY*0.15;
    const spd=BASE_SPEED*this.sm;
    const grav=p.flip?-GRAVITY:GRAVITY;
    const gSurf=p.flip?cY+p.h:gY;

    if(this.jBuf>0) this.jBuf-=dt;
    if(p.onGround) this.coyote=COYOTE;
    else if(this.coyote>0) this.coyote-=dt;

    // Jump
    if(this.jBuf>0&&this.coyote>0){
      p.vy=p.flip?Math.abs(JUMP_VEL):JUMP_VEL;
      p.onGround=false; this.coyote=0; this.jBuf=0;
      this.audio.jump();
      this.fx.emit(p.x+p.w/2,p.y+p.h,8,{color:[C.neon1,C.neon2,"#fff"],speed:120,life:0.3,size:3,angle:Math.PI/2,spread:0.8,gravity:200});
    }

    p.vy+=grav*dt; p.vy=Math.max(-1500,Math.min(1500,p.vy)); p.y+=p.vy*dt;

    // Ground
    if(!p.flip&&p.y+p.h>=gY){
      if(!p.onGround){ this.audio.land(); this._landFx(p.x+p.w/2,gY); }
      p.y=gY-p.h; p.vy=0; p.onGround=true;
    } else if(p.flip&&p.y<=cY){
      if(!p.onGround){ this.audio.land(); this._landFx(p.x+p.w/2,cY); }
      p.y=cY; p.vy=0; p.onGround=true;
    } else { p.onGround=false; }

    // Scroll
    const sc=spd*dt;
    for(const o of this.obs)  o.x-=sc;
    for(const pl of this.plat) pl.x-=sc;
    for(const pt of this.port) pt.x-=sc;

    // Platforms
    for(const pl of this.plat){
      if(this._ov(p.x+2,p.y,p.w-4,p.h,pl.x,pl.y,pl.w,pl.h)){
        const fT=p.y+p.h-pl.y, fB=pl.y+pl.h-p.y;
        if(fT<fB&&p.vy>=0){ p.y=pl.y-p.h; p.vy=0; if(!p.onGround){this.audio.land();this._landFx(p.x+p.w/2,pl.y);} p.onGround=true; }
        else if(fB<fT&&p.vy<=0){ p.y=pl.y+pl.h; p.vy=0; }
      }
    }

    // Portals
    for(const pt of this.port){
      if(this._ov(p.x+4,p.y+4,p.w-8,p.h-8,pt.x,pt.y,pt.w,pt.h)){
        if(!pt._hit){
          pt._hit=true; this.audio.portal();
          if(pt.type==="jumpPad"){ p.vy=JUMP_PAD_V; p.onGround=false; this.audio.pad(); this.fx.emit(p.x+p.w/2,p.y+p.h,20,{color:[C.neon3,C.gold,"#fff"],speed:300,life:0.5,size:5,angle:-Math.PI/2,spread:0.6,gravity:300}); }
          if(pt.type==="gravPortal"){ p.flip=!p.flip; this.fx.emit(p.x+p.w/2,p.y+p.h/2,25,{color:[C.neon2,C.neon1,"#fff"],speed:200,life:0.5,size:4,gravity:0}); }
          if(pt.type==="speedPortal"){ this.sm=pt.mult; this.fx.emit(p.x+p.w/2,p.y+p.h/2,18,{color:[C.neon3,C.neon4],speed:220,life:0.3,size:3,angle:0,spread:0.4,gravity:0}); }
        }
      } else { pt._hit=false; }
    }

    // Obstacles
    for(const o of this.obs){
      if(o.type==="finish"){ if(p.x+p.w>o.x){ this._complete(); return; } continue; }
      const m=HIT_M;
      const ox=o.x+m, oy=o.ceiling?o.y+m:o.y-o.h+m, ow=o.w-m*2, oh=o.h-m*2;
      if(this._ov(p.x+m,p.y+m,p.w-m*2,p.h-m*2,ox,oy,ow,oh)){ this._kill(); return; }
    }

    if(p.y>this.H+100||p.y<-300){ this._kill(); return; }

    // Trail
    this.trail.unshift({x:p.x+p.w/2,y:p.y+p.h/2});
    if(this.trail.length>20) this.trail.pop();

    // Run particles
    const def=this.defs[this.idx];
    if(p.onGround&&Math.random()<0.4) this.fx.emit(p.x+2,p.y+p.h,1,{color:[def.color,C.neon1],speed:40,life:0.25,size:2.5,angle:Math.PI*0.6,spread:0.4,gravity:-50});

    if(p.onGround) p.angle+=(0-p.angle)*0.35;
    else p.angle+=(p.flip?-1:1)*Math.PI*2*dt*1.8;

    // Shake decay
    if(this.shake>0){ this.shake-=dt*7; if(this.shake<0)this.shake=0; this.sX=(Math.random()-0.5)*this.shake*14; this.sY=(Math.random()-0.5)*this.shake*8; }
    else { this.sX=0; this.sY=0; }

    // Progress
    const first=this.obs[0];
    const startX=this.W*1.1+TILE*4;
    const scrolled=first?Math.max(0,startX-first.x):0;
    this.prog=Math.min(1,Math.max(0,scrolled/Math.max(1,this.lvW-this.W)));

    this.fx.update(dt);
  }

  _ov(ax,ay,aw,ah,bx,by,bw,bh){ return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by; }

  _landFx(x,y){
    const def=this.defs[this.idx];
    this.fx.emit(x,y,12,{color:[def.color,"#fff",C.neon1],speed:80,life:0.2,size:3,angle:-Math.PI/2,spread:Math.PI*0.6,gravity:100});
    this.shake=Math.min(this.shake+0.15,0.5);
  }

  _kill(){
    if(!this.P.alive) return;
    this.P.alive=false; this.state="dead"; this.dTimer=0;
    this.audio.death(); this.audio.stopMusic(); this.shake=1.5;
    const p=this.P;
    this.fx.emit(p.x+p.w/2,p.y+p.h/2,70,{color:[C.neon2,C.warn,C.neon4,C.gold,"#fff"],speed:360,life:0.9,size:5,scatter:10,gravity:300});
    this.fx.emit(p.x+p.w/2,p.y+p.h/2,30,{color:[C.warn,C.neon4],speed:180,life:1.3,size:8,scatter:8,gravity:250});
  }

  _complete(){
    if(this.state==="levelComplete") return;
    this.state="levelComplete"; this.cTimer=0;
    this.audio.complete(); this.audio.stopMusic();
    const nu=Math.max(this.unlocked,this.idx+2);
    if(nu>this.unlocked){ this.unlocked=nu; this._saveP(nu); }
    const p=this.P;
    this.fx.emit(p.x+p.w/2,p.y+p.h/2,90,{color:[C.gold,C.neon3,C.neon1,"#fff"],speed:420,life:1.3,size:6,scatter:20,gravity:200});
  }

  // ═════════════════════════════════════════════════════════════
  //  DRAW
  // ═════════════════════════════════════════════════════════════
  _draw(){
    const ctx=this.ctx,W=this.W,H=this.H;
    ctx.save(); ctx.clearRect(0,0,W,H);
    if(this.state==="menu")          this._dMenu(ctx,W,H);
    else if(this.state==="levelSelect") this._dLS(ctx,W,H);
    else if(this.state==="loading")  this._dLoad(ctx,W,H);
    else                             this._dGame(ctx,W,H);
    if(this.trans.on&&this.trans.a>0){ ctx.globalAlpha=Math.min(1,this.trans.a); ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H); }
    ctx.restore();
  }

  _dBg(ctx,W,H,scroll=0){
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,`hsl(${this.bgH},100%,3%)`); g.addColorStop(0.6,`hsl(${this.bgH},80%,6%)`); g.addColorStop(1,`hsl(${this.bgH},60%,8%)`);
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    for(const s of this.stars){
      const sx=((s.x*W-scroll*s.sp*0.1)%W+W)%W;
      ctx.save(); ctx.globalAlpha=s.a; ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(sx,s.y*H,s.sz,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha=0.09; ctx.strokeStyle=`hsl(${this.bgH},100%,60%)`; ctx.lineWidth=1;
    const gs=80,ox=(-scroll*0.35)%gs,oy=(this.mTick*12)%gs;
    for(let x=ox;x<W+gs;x+=gs){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-H*0.3,H);ctx.stroke(); }
    for(let y=oy;y<H;y+=gs){    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }
    ctx.restore();
    const gY=this.gY;
    ctx.save();
    const gg=ctx.createLinearGradient(0,gY-30,0,gY+10);
    gg.addColorStop(0,`hsla(${this.bgH},100%,60%,0)`); gg.addColorStop(0.5,`hsla(${this.bgH},100%,60%,0.14)`); gg.addColorStop(1,`hsla(${this.bgH},100%,60%,0.28)`);
    ctx.fillStyle=gg; ctx.fillRect(0,gY-30,W,40);
    ctx.strokeStyle=`hsl(${this.bgH},100%,65%)`; ctx.lineWidth=2.5; ctx.shadowColor=`hsl(${this.bgH},100%,65%)`; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.moveTo(0,gY); ctx.lineTo(W,gY); ctx.stroke(); ctx.shadowBlur=0;
    ctx.fillStyle=`hsl(${this.bgH},60%,4%)`; ctx.fillRect(0,gY,W,H-gY);
    ctx.restore();
  }

  _dGame(ctx,W,H){
    this._dBg(ctx,W,H,0);
    ctx.save(); ctx.translate(this.sX,this.sY);

    // Platforms
    for(const pl of this.plat){
      if(pl.x+pl.w<-50||pl.x>W+50) continue;
      ctx.save(); ctx.fillStyle=`hsl(${this.bgH},80%,22%)`; ctx.shadowColor=`hsl(${this.bgH},100%,60%)`; ctx.shadowBlur=10;
      ctx.fillRect(pl.x,pl.y,pl.w,pl.h);
      ctx.strokeStyle=`hsl(${this.bgH},100%,70%)`; ctx.lineWidth=2; ctx.strokeRect(pl.x,pl.y,pl.w,pl.h);
      ctx.restore();
    }
    // Portals
    for(const pt of this.port){ if(pt.x+pt.w<-50||pt.x>W+50) continue; this._dPortal(ctx,pt); }
    // Obstacles
    for(const o of this.obs){ if(o.x+o.w<-50||o.x>W+50) continue; this._dObs(ctx,o); }

    // ── Debug: bot path ─────────────────────────────────────────
    if(this.dbBot&&this.botPath.length>1){
      ctx.save(); ctx.strokeStyle="#00ff88"; ctx.lineWidth=2; ctx.globalAlpha=0.5; ctx.setLineDash([4,5]);
      ctx.beginPath();
      for(let i=0;i<this.botPath.length;i++){
        const bp=this.botPath[i];
        if(i===0) ctx.moveTo(bp.x,bp.y); else ctx.lineTo(bp.x,bp.y);
      }
      ctx.stroke(); ctx.setLineDash([]);
      const last=this.botPath[this.botPath.length-1];
      ctx.globalAlpha=0.9; ctx.fillStyle="#00ff88"; ctx.shadowColor="#00ff88"; ctx.shadowBlur=14;
      ctx.beginPath(); ctx.arc(last.x,last.y,7,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }

    // ── Debug: jump arc ─────────────────────────────────────────
    if(this.dbArc&&this.P.onGround){
      const p=this.P, spd=BASE_SPEED*this.sm;
      ctx.save(); ctx.strokeStyle=C.neon3; ctx.lineWidth=1.5; ctx.globalAlpha=0.45; ctx.setLineDash([3,5]);
      ctx.beginPath(); ctx.moveTo(p.x+p.w/2,p.y);
      let ax=p.x+p.w/2,ay=p.y,avy=JUMP_VEL;
      for(let i=0;i<80;i++){ const adt=0.016; ax+=spd*adt; ay+=avy*adt; avy+=GRAVITY*adt; if(ay>this.gY)break; ctx.lineTo(ax,ay); }
      ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }

    // Trail
    if(this.trail.length>2&&this.P.alive){
      const def=this.defs[this.idx];
      ctx.save();
      for(let i=1;i<this.trail.length;i++){
        const a=this.trail[i-1],b=this.trail[i];
        ctx.beginPath(); ctx.globalAlpha=(1-i/this.trail.length)*0.5;
        ctx.strokeStyle=def.color; ctx.shadowColor=def.color; ctx.shadowBlur=8;
        ctx.lineWidth=(1-i/this.trail.length)*7; ctx.lineCap="round";
        ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
      ctx.restore();
    }

    if(this.P.alive) this._dPlayer(ctx);
    this.fx.draw(ctx);
    ctx.restore();

    this._dHUD(ctx,W,H);
    if(this.state==="paused")        this._dPause(ctx,W,H);
    if(this.state==="dead")          this._dDead(ctx,W,H);
    if(this.state==="levelComplete") this._dComplete(ctx,W,H);
    if(this.dbHitbox||this.dbBot||this.dbArc) this._dDebug(ctx,W,H);
  }

  _dPlayer(ctx){
    const p=this.P, def=this.defs[this.idx];
    ctx.save(); ctx.translate(p.x+p.w/2,p.y+p.h/2); ctx.rotate(p.angle);
    ctx.shadowColor=def.color; ctx.shadowBlur=22;
    const s=p.w;
    const g=ctx.createLinearGradient(-s/2,-s/2,s/2,s/2);
    g.addColorStop(0,def.color); g.addColorStop(1,C.neon2);
    ctx.fillStyle=g; ctx.fillRect(-s/2,-s/2,s,s);
    ctx.fillStyle="rgba(0,0,0,0.35)"; ctx.fillRect(-s/2+5,-s/2+5,s-10,s-10);
    ctx.strokeStyle="#fff"; ctx.globalAlpha=0.38; ctx.lineWidth=1.5; ctx.strokeRect(-s/2+5,-s/2+5,s-10,s-10);
    ctx.globalAlpha=0.22; ctx.beginPath(); ctx.moveTo(-s/2+5,0); ctx.lineTo(s/2-5,0); ctx.moveTo(0,-s/2+5); ctx.lineTo(0,s/2-5); ctx.stroke();
    ctx.globalAlpha=1; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.shadowBlur=0; ctx.strokeRect(-s/2,-s/2,s,s);
    if(this.dbHitbox){ const m=HIT_M; ctx.globalAlpha=0.6; ctx.strokeStyle=C.warn; ctx.lineWidth=1.5; ctx.strokeRect(-s/2+m,-s/2+m,s-m*2,s-m*2); }
    ctx.restore();
  }

  _dObs(ctx,o){
    if(o.type==="finish"){
      ctx.save();
      const g=ctx.createLinearGradient(o.x,o.y,o.x,o.y+o.h);
      g.addColorStop(0,C.gold+"00"); g.addColorStop(0.5,C.gold+"cc"); g.addColorStop(1,C.gold+"00");
      ctx.fillStyle=g; ctx.shadowColor=C.gold; ctx.shadowBlur=30; ctx.fillRect(o.x,o.y,o.w,o.h);
      ctx.fillStyle=C.gold; ctx.font=`bold ${this.gY*0.07}px monospace`; ctx.textAlign="center"; ctx.fillText("FINISH",o.x+o.w/2,o.y+o.h/2);
      ctx.restore(); return;
    }
    // Spike
    const g=ctx.createLinearGradient(o.x,o.ceiling?o.y:o.y-o.h,o.x,o.ceiling?o.y+o.h:o.y);
    g.addColorStop(0,C.warn+"aa"); g.addColorStop(1,C.warn);
    ctx.save(); ctx.fillStyle=g; ctx.shadowColor=C.warn; ctx.shadowBlur=14;
    ctx.beginPath();
    if(o.ceiling){ ctx.moveTo(o.x,o.y); ctx.lineTo(o.x+o.w/2,o.y+o.h); ctx.lineTo(o.x+o.w,o.y); }
    else         { ctx.moveTo(o.x,o.y); ctx.lineTo(o.x+o.w/2,o.y-o.h); ctx.lineTo(o.x+o.w,o.y); }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle="#fff"; ctx.lineWidth=1.5; ctx.globalAlpha=0.3; ctx.stroke();
    if(this.dbHitbox){
      const m=HIT_M, oy=o.ceiling?o.y+m:o.y-o.h+m;
      ctx.globalAlpha=0.5; ctx.strokeStyle=C.warn; ctx.lineWidth=1; ctx.strokeRect(o.x+m,oy,o.w-m*2,o.h-m*2);
    }
    ctx.restore();
  }

  _dPortal(ctx,pt){
    const t=this.mTick; ctx.save(); ctx.shadowBlur=25;
    if(pt.type==="jumpPad"){
      const pulse=0.85+Math.sin(t*8)*0.15; ctx.shadowColor=C.neon3;
      const g=ctx.createLinearGradient(pt.x,pt.y-pt.h,pt.x,pt.y);
      g.addColorStop(0,C.neon3+"cc"); g.addColorStop(1,C.neon3+"44");
      ctx.fillStyle=g; ctx.fillRect(pt.x,pt.y-pt.h*pulse,pt.w,pt.h*pulse);
      ctx.strokeStyle=C.neon3; ctx.lineWidth=2; ctx.strokeRect(pt.x,pt.y-pt.h*pulse,pt.w,pt.h*pulse);
      ctx.fillStyle="#fff"; ctx.globalAlpha=0.9; ctx.font="bold 18px monospace"; ctx.textAlign="center"; ctx.fillText("▲",pt.x+pt.w/2,pt.y-pt.h*0.4);
    } else if(pt.type==="gravPortal"){
      ctx.shadowColor=C.neon2;
      for(let i=0;i<6;i++){ const a=t*3+(i/6)*Math.PI*2; ctx.fillStyle=i%2===0?C.neon2:C.neon1; ctx.beginPath(); ctx.arc(pt.x+pt.w/2+Math.cos(a)*18,pt.y+pt.h/2+Math.sin(a)*18,4,0,Math.PI*2); ctx.fill(); }
      ctx.strokeStyle=C.neon2; ctx.lineWidth=2; ctx.strokeRect(pt.x,pt.y,pt.w,pt.h);
      ctx.fillStyle=C.neon2+"33"; ctx.fillRect(pt.x,pt.y,pt.w,pt.h);
      ctx.fillStyle="#fff"; ctx.globalAlpha=0.85; ctx.font="bold 14px monospace"; ctx.textAlign="center"; ctx.fillText("G",pt.x+pt.w/2,pt.y+pt.h/2+5);
    } else if(pt.type==="speedPortal"){
      const clr=pt.mult>1?C.neon4:C.neon1; ctx.shadowColor=clr; ctx.strokeStyle=clr; ctx.lineWidth=2; ctx.strokeRect(pt.x,pt.y,pt.w,pt.h);
      ctx.fillStyle=clr+"33"; ctx.fillRect(pt.x,pt.y,pt.w,pt.h);
      ctx.fillStyle="#fff"; ctx.globalAlpha=0.85; ctx.font="bold 13px monospace"; ctx.textAlign="center"; ctx.fillText(pt.mult>1?"»»":"«",pt.x+pt.w/2,pt.y+pt.h/2+5);
    }
    ctx.restore();
  }

  _dHUD(ctx,W,H){
    const def=this.defs[this.idx];
    ctx.save();
    const bW=W*0.55,bX=W/2-bW/2,bY=15,bH=6;
    ctx.fillStyle="rgba(0,0,0,0.5)"; ctx.fillRect(bX-2,bY-2,bW+4,bH+4);
    ctx.fillStyle=`hsl(${this.bgH},30%,18%)`; ctx.fillRect(bX,bY,bW,bH);
    const pg=ctx.createLinearGradient(bX,0,bX+bW,0); pg.addColorStop(0,def.color); pg.addColorStop(1,C.neon2);
    ctx.fillStyle=pg; ctx.shadowColor=def.color; ctx.shadowBlur=10; ctx.fillRect(bX,bY,bW*this.prog,bH);
    ctx.restore();
    ctx.save(); ctx.fillStyle=def.color; ctx.font=`bold ${H*0.02}px 'Courier New',monospace`; ctx.textAlign="left"; ctx.shadowColor=def.color; ctx.shadowBlur=12; ctx.fillText(`LVL ${def.id} · ${def.name}`,14,23); ctx.restore();
    ctx.save(); ctx.fillStyle="#fff"; ctx.globalAlpha=0.6; ctx.font=`bold ${H*0.017}px 'Courier New',monospace`; ctx.textAlign="right"; ctx.fillText(`${Math.round(this.prog*100)}%`,W-14,23); ctx.restore();
    ctx.save(); ctx.fillStyle=this.fps>=55?"#00ff88":this.fps>=30?C.neon4:C.warn; ctx.globalAlpha=0.55; ctx.font=`${H*0.013}px 'Courier New',monospace`; ctx.textAlign="right"; ctx.fillText(`${this.fps} FPS`,W-14,H-12); ctx.restore();
    ctx.save(); ctx.fillStyle="#fff"; ctx.globalAlpha=0.35; ctx.font=`${H*0.014}px 'Courier New',monospace`; ctx.textAlign="left"; ctx.fillText(`ATT: ${this.attempts}`,14,H-12); ctx.restore();
    if(this.prog<0.05){ ctx.save(); ctx.globalAlpha=0.45+Math.sin(this.mTick*4)*0.3; ctx.fillStyle="#fff"; ctx.font=`${H*0.018}px 'Courier New',monospace`; ctx.textAlign="center"; ctx.fillText("SPACE / TAP — JUMP",W/2,H-16); ctx.restore(); }
  }

  _panel(ctx,cx,cy,w,h){
    const x=cx-w/2,y=cy-h/2,r=10;
    ctx.save(); ctx.fillStyle="rgba(4,0,18,0.93)"; ctx.strokeStyle=C.neon1+"77"; ctx.lineWidth=1.5; ctx.shadowColor=C.neon1; ctx.shadowBlur=18;
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
    ctx.fill(); ctx.stroke(); ctx.restore();
  }

  _dPause(ctx,W,H){
    ctx.save(); ctx.fillStyle="rgba(0,0,0,0.7)"; ctx.fillRect(0,0,W,H);
    this._panel(ctx,W/2,H/2,320,210);
    ctx.textAlign="center"; ctx.shadowColor=C.neon1; ctx.shadowBlur=22; ctx.fillStyle=C.neon1; ctx.font=`bold ${H*0.052}px 'Courier New',monospace`; ctx.fillText("PAUSED",W/2,H/2-30); ctx.shadowBlur=0;
    ctx.fillStyle="#999"; ctx.font=`${H*0.02}px 'Courier New',monospace`; ctx.fillText("ESC / TAP — RESUME",W/2,H/2+16); ctx.fillText("R — RESTART",W/2,H/2+46);
    ctx.restore();
  }

  _dDead(ctx,W,H){
    this.dTimer=(this.dTimer||0)+this.dt;
    if(this.dTimer<0.15){ this.fx.update(this.dt); this.fx.draw(ctx); return; }
    ctx.save(); ctx.fillStyle=`rgba(0,0,0,${Math.min(0.72,(this.dTimer-0.15)*2)})`; ctx.fillRect(0,0,W,H);
    if(this.dTimer>0.35){
      this._panel(ctx,W/2,H/2,340,235);
      ctx.textAlign="center"; ctx.shadowColor=C.warn; ctx.shadowBlur=28; ctx.fillStyle=C.warn; ctx.font=`bold ${H*0.058}px 'Courier New',monospace`; ctx.fillText("YOU DIED",W/2,H/2-44); ctx.shadowBlur=0;
      ctx.fillStyle="#888"; ctx.font=`${H*0.018}px 'Courier New',monospace`; ctx.fillText(`ATTEMPT ${this.attempts+1}`,W/2,H/2); ctx.fillStyle="#aaa"; ctx.fillText(`REACHED ${Math.round(this.prog*100)}%`,W/2,H/2+30);
      const pulse=0.65+Math.sin(this.mTick*6)*0.35; ctx.globalAlpha=pulse; ctx.fillStyle=C.neon1; ctx.font=`bold ${H*0.022}px 'Courier New',monospace`; ctx.fillText("TAP / SPACE — RETRY",W/2,H/2+72);
    }
    this.fx.update(this.dt); this.fx.draw(ctx); ctx.restore();
  }

  _dComplete(ctx,W,H){
    this.cTimer=(this.cTimer||0)+this.dt;
    const def=this.defs[this.idx];
    ctx.save(); ctx.fillStyle=`rgba(0,0,0,${Math.min(0.72,this.cTimer*2)})`; ctx.fillRect(0,0,W,H);
    if(this.cTimer>0.4){
      this._panel(ctx,W/2,H/2,380,265);
      ctx.textAlign="center"; ctx.shadowColor=C.gold; ctx.shadowBlur=32; ctx.fillStyle=C.gold; ctx.font=`bold ${H*0.052}px 'Courier New',monospace`; ctx.fillText("COMPLETE!",W/2,H/2-56);
      ctx.shadowColor=def.color; ctx.fillStyle=def.color; ctx.font=`bold ${H*0.036}px 'Courier New',monospace`; ctx.fillText(def.name,W/2,H/2-14); ctx.shadowBlur=0;
      ctx.fillStyle="#888"; ctx.font=`${H*0.018}px 'Courier New',monospace`; ctx.fillText(`ATTEMPTS: ${this.attempts}`,W/2,H/2+28);
      const hasNext=this.idx+1<this.defs.length; const pulse=0.65+Math.sin(this.mTick*5)*0.35; ctx.globalAlpha=pulse; ctx.fillStyle=C.neon3; ctx.font=`bold ${H*0.022}px 'Courier New',monospace`; ctx.fillText(hasNext?"TAP — NEXT LEVEL":"TAP — MAIN MENU",W/2,H/2+72);
    }
    this.fx.update(this.dt); this.fx.draw(ctx); ctx.restore();
  }

  _dDebug(ctx,W,H){
    const lines=[
      `[H] Hitbox:  ${this.dbHitbox?"ON ✓":"off"}`,
      `[B] Bot path:${this.dbBot?"ON ✓":"off"}`,
      `[J] Jump arc:${this.dbArc?"ON ✓":"off"}`,
      `────────────────────────────`,
      `Validation: ${this.lastVal?.ok?"✓ PASS":"✗ FAIL (auto-repaired)"}`,
      `Reason: ${this.lastVal?.reason||"—"}`,
      ...this.valLog.map(l=>`  ${l}`),
      `────────────────────────────`,
      `Max spike cluster: ${PhysicsLib.maxSpikeCluster(this.sm)} tiles`,
      `Min flat after:    ${PhysicsLib.minFlatAfter(this.sm)} tiles`,
      `Max jump H:        ${Math.round(PhysicsLib.maxJumpHeight())} px`,
      `Max jump dist:     ${Math.round(PhysicsLib.maxJumpDist(this.sm))} px`,
    ];
    const lh=17, pad=10, pw=360, ph=lines.length*lh+pad*2;
    ctx.save();
    ctx.fillStyle="rgba(0,0,0,0.85)"; ctx.strokeStyle=C.neon3+"77"; ctx.lineWidth=1;
    ctx.fillRect(W-pw-10,H-ph-36,pw,ph); ctx.strokeRect(W-pw-10,H-ph-36,pw,ph);
    ctx.font=`12px 'Courier New',monospace`; ctx.textAlign="left";
    for(let i=0;i<lines.length;i++){
      const l=lines[i];
      ctx.fillStyle=l.includes("✓")&&!l.includes("FAIL")?C.neon3:l.includes("✗")||l.includes("⚠")?C.warn:"#99ccff";
      ctx.fillText(l,W-pw-10+pad,H-ph-36+pad+(i+1)*lh);
    }
    ctx.restore();
  }

  _dMenu(ctx,W,H){
    this._dBg(ctx,W,H,this.mTick*30);
    this.fx.update(this.dt); this.fx.draw(ctx);
    if(Math.random()<0.28) this.fx.emit(Math.random()*W,H*0.75+Math.random()*H*0.08,1,{color:[C.neon1,C.neon2,C.neon3],speed:38,life:2,size:2,gravity:-18});
    const t=this.mTick;
    ctx.save(); ctx.textAlign="center";
    ctx.fillStyle=`hsl(${(t*80)%360},100%,70%)`; ctx.globalAlpha=0.72; ctx.font=`${H*0.02}px 'Courier New',monospace`; ctx.fillText("◈ CYBERPUNK ARCADE ◈",W/2,H*0.3);
    ctx.globalAlpha=1; ctx.shadowColor=C.neon1; ctx.shadowBlur=40;
    const gl=Math.sin(t*13)>0.93?(Math.random()-0.5)*8:0;
    ctx.fillStyle=C.neon1; ctx.font=`bold ${H*0.11}px 'Courier New',monospace`; ctx.fillText("NEON",W/2+gl,H*0.47);
    ctx.fillStyle=C.neon2; ctx.shadowColor=C.neon2; ctx.fillText("DASH",W/2-gl,H*0.59);
    if(Math.abs(gl)>1){ ctx.globalAlpha=0.25; ctx.fillStyle=C.warn; ctx.fillText("NEON",W/2+gl*2,H*0.47); ctx.fillText("DASH",W/2-gl*2,H*0.59); }
    ctx.restore();
    ctx.save(); const pulse=0.6+Math.sin(t*3.5)*0.4; ctx.globalAlpha=pulse; ctx.fillStyle=C.neon3; ctx.font=`bold ${H*0.026}px 'Courier New',monospace`; ctx.textAlign="center"; ctx.shadowColor=C.neon3; ctx.shadowBlur=14; ctx.fillText("▶  TAP TO PLAY  ◀",W/2,H*0.77); ctx.restore();
    ctx.save(); ctx.globalAlpha=0.42; ctx.fillStyle="#aaa"; ctx.font=`${H*0.016}px 'Courier New',monospace`; ctx.textAlign="center";
    ctx.fillText("SPACE / ENTER / TAP — JUMP",W/2,H*0.87);
    ctx.fillText("H — HITBOX  ·  B — BOT PATH  ·  J — JUMP ARC  ·  R — RESTART",W/2,H*0.92);
    ctx.restore();
  }

  _dLS(ctx,W,H){
    this._dBg(ctx,W,H,this.mTick*10);
    ctx.save(); ctx.textAlign="center"; ctx.fillStyle=C.neon1; ctx.font=`bold ${H*0.046}px 'Courier New',monospace`; ctx.shadowColor=C.neon1; ctx.shadowBlur=22; ctx.fillText("SELECT LEVEL",W/2,H*0.13); ctx.restore();

    const cols=Math.min(this.defs.length,3), cW=Math.min(185,W*0.23), cH=cW*1.12, gap=18;
    const totW=cols*cW+(cols-1)*gap, sX=W/2-totW/2;
    const rows=Math.ceil(this.defs.length/cols), totH=rows*cH+(rows-1)*gap, sY=H/2-totH/2;
    this.lsRects=[];

    for(let i=0;i<this.defs.length;i++){
      const def=this.defs[i], col=i%cols, row=Math.floor(i/cols);
      const cx=sX+col*(cW+gap), cy=sY+row*(cH+gap);
      const ul=i+1<=this.unlocked;
      this.lsRects.push({x:cx,y:cy,w:cW,h:cH,idx:i,ul});
      ctx.save();
      if(ul){ ctx.shadowColor=def.color; ctx.shadowBlur=18; ctx.fillStyle="rgba(0,4,18,0.93)"; }
      else { ctx.fillStyle="rgba(0,0,0,0.7)"; }
      ctx.strokeStyle=ul?def.color:"#2a2a2a"; ctx.lineWidth=2;
      ctx.fillRect(cx,cy,cW,cH); ctx.strokeRect(cx,cy,cW,cH);
      ctx.textAlign="center";
      if(ul){
        ctx.fillStyle=def.color; ctx.font=`bold ${cH*0.17}px 'Courier New',monospace`; ctx.fillText(`0${def.id}`,cx+cW/2,cy+cH*0.36);
        ctx.fillStyle="#fff"; ctx.font=`bold ${cH*0.11}px 'Courier New',monospace`; ctx.fillText(def.name,cx+cW/2,cy+cH*0.56);
        ctx.font=`${cH*0.12}px monospace`; ctx.fillStyle=C.gold;
        const stars=def.id<=this.unlocked-1?3:0; ctx.fillText("★".repeat(stars)+"☆".repeat(3-stars),cx+cW/2,cy+cH*0.74);
        ctx.font=`${cH*0.086}px 'Courier New',monospace`; ctx.fillStyle="#666"; ctx.fillText(`×${def.speed.toFixed(1)} SPEED`,cx+cW/2,cy+cH*0.89);
      } else {
        ctx.fillStyle="#2a2a2a"; ctx.font=`bold ${cH*0.21}px monospace`; ctx.fillText("🔒",cx+cW/2,cy+cH*0.51);
        ctx.fillStyle="#3a3a3a"; ctx.font=`${cH*0.09}px 'Courier New',monospace`; ctx.fillText("LOCKED",cx+cW/2,cy+cH*0.72);
      }
      ctx.restore();
    }

    if(!this.lsBound){
      this.lsBound=true;
      const h=(e)=>{
        if(this.state!=="levelSelect") return;
        const r=this.canvas.getBoundingClientRect();
        const cx=e.touches?e.touches[0].clientX-r.left:e.clientX-r.left;
        const cy=e.touches?e.touches[0].clientY-r.top:e.clientY-r.top;
        for(const rc of this.lsRects){
          if(cx>=rc.x&&cx<=rc.x+rc.w&&cy>=rc.y&&cy<=rc.y+rc.h&&rc.ul){
            this.lsBound=false;
            this.canvas.removeEventListener("mousedown",h);
            this.canvas.removeEventListener("touchstart",h);
            this._startLevel(rc.idx);
          }
        }
      };
      this.canvas.addEventListener("mousedown",h);
      this.canvas.addEventListener("touchstart",h,{passive:false});
    }

    ctx.save(); ctx.globalAlpha=0.4; ctx.fillStyle="#888"; ctx.font=`${H*0.018}px 'Courier New',monospace`; ctx.textAlign="center"; ctx.fillText("TAP A LEVEL TO BEGIN",W/2,H*0.92); ctx.restore();
  }

  _dLoad(ctx,W,H){
    ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);
    ctx.save(); ctx.fillStyle=C.neon1; ctx.font=`bold ${H*0.036}px 'Courier New',monospace`; ctx.textAlign="center"; ctx.shadowColor=C.neon1; ctx.shadowBlur=22;
    ctx.fillText("VALIDATING LEVEL...",W/2,H/2-18);
    ctx.fillStyle="#555"; ctx.font=`${H*0.016}px 'Courier New',monospace`; ctx.fillText("Running physics bot simulation",W/2,H/2+18); ctx.restore();
  }
}