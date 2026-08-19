(() => {
  const TH = 0.15;
  const MIN = 5;
  const STEP = 1;
  const W = 96;
  const H = 54;
  const RATE = 16;
  const PARALLEL = 4;
  const MINSEL = 16;

  const fileInput = document.getElementById('fileInput');
  const dropZone = document.getElementById('dropZone');
  const panels = {
    1: document.getElementById('panelUpload'),
    2: document.getElementById('panelCrop'),
    3: document.getElementById('panelAnalyze'),
    4: document.getElementById('panelResult'),
  };
  const stepsEl = [...document.querySelectorAll('.steps li')];
  const backButton = document.getElementById('backButton');
  const nextButton = document.getElementById('nextButton');
  const scrub = document.getElementById('scrub');
  const scrubTime = document.getElementById('scrubTime');
  const fullFrameButton = document.getElementById('fullFrameButton');
  const stage = document.getElementById('stage');
  const cropCanvas = document.getElementById('cropCanvas');
  const selection = document.getElementById('selection');
  const shades = {
    top: document.getElementById('shadeTop'),
    right: document.getElementById('shadeRight'),
    bottom: document.getElementById('shadeBottom'),
    left: document.getElementById('shadeLeft'),
  };
  const progressText = document.getElementById('progressText');
  const barFill = document.getElementById('barFill');
  const verdict = document.getElementById('verdict');
  const meta = document.getElementById('meta');
  const playerWrap = document.getElementById('playerWrap');
  const player = document.getElementById('player');
  const timeline = document.getElementById('timeline');
  const playPause = document.getElementById('playPause');
  const prevStill = document.getElementById('prevStill');
  const nextStill = document.getElementById('nextStill');
  const zoomIn = document.getElementById('zoomIn');
  const zoomOut = document.getElementById('zoomOut');
  const stillPos = document.getElementById('stillPos');
  const viewToggle = document.getElementById('viewToggle');
  const mergeGap = document.getElementById('mergeGap');
  const resultTable = document.getElementById('resultTable');
  const resultBody = document.getElementById('resultBody');
  const recStart = document.getElementById('recStart');
  const status = document.getElementById('status');

  let runId = 0;
  let file = null;
  let url = null;
  let preview = null;
  let duration = 0;
  let vw = 0;
  let vh = 0;
  let sel = { x: 0, y: 0, w: 0, h: 0 };
  let stillRuns = [];
  let lastCrop = null;
  let showFull = false;
  let rawRuns = [];
  let analysisMeta = null;
  let recStartEpoch = null;

  const mergeRuns = (runs, gap) => {
    if (!runs.length) return [];
    const out = [runs[0].slice()];
    for (let i = 1; i < runs.length; i++) {
      const prev = out[out.length - 1];
      const r = runs[i];
      // merge only if the gap is short AND the image returned to the same still
      // (keyframe blip); real motion/stepping changes the image and is never bridged
      if (r[0] - prev[1] <= gap && pixDiff(r[2], prev[2]) < TH) prev[1] = r[1];
      else out.push(r.slice());
    }
    return out;
  };

  const renderResults = () => {
    if (!analysisMeta) return;
    const gap = Math.max(0, Number(mergeGap.value) || 0);
    const merged = mergeRuns(rawRuns, gap).filter(([a, b]) => b - a >= MIN);
    stillRuns = merged;
    const m = analysisMeta;
    meta.textContent =
      `${m.file} · length ${hms(m.duration)} · ${m.region} · ${m.n} samples (1/s) · analyzed in ` +
      `${m.sec} s · threshold ${TH}, merge gaps ≤ ${gap}s, min ${MIN}s · ` +
      `diff median ${m.median}, max ${m.max}` + m.cov;
    resultBody.textContent = '';
    resultTable.hidden = !merged.length;
    let prevStart = null;
    merged.forEach(([a, b], i) => {
      const tr = document.createElement('tr');
      const cells = [
        ['num', String(i + 1)],
        ['', hms(a)],
        ['', hms(b)],
        ['num dur', `${Math.round(b - a)} s`],
        ['num', prevStart === null ? '–' : `${hms(Math.round(a - prevStart))}`],
        ['', recStartEpoch === null ? '–' : clockOf(recStartEpoch + Math.round(a * 1000))],
      ];
      for (const [cls, text] of cells) {
        const td = document.createElement('td');
        if (cls) td.className = cls;
        td.textContent = text;
        tr.appendChild(td);
      }
      tr.addEventListener('click', () => seekTo(Math.max(0, a - 1)));
      resultBody.appendChild(tr);
      prevStart = a;
    });
    if (!merged.length) {
      verdict.textContent = 'No freezes found';
      verdict.className = 'verdict clean';
      setStatus('No freezes found.', 'success');
    } else {
      const tot = merged.reduce((s, [a, b]) => s + (b - a), 0);
      verdict.textContent = `${merged.length} freeze${merged.length === 1 ? '' : 's'} found – ${hms(tot)} total`;
      verdict.className = 'verdict found';
      setStatus(`${merged.length} freeze(s) found.`);
    }
    drawTimeline();
  };
  let viewStart = 0;
  let viewEnd = 0;

  const layoutPlayer = () => {
    if (!lastCrop || !vw) return;
    const c = showFull ? { x: 0, y: 0, w: vw, h: vh } : lastCrop;
    const cw = panels[4].clientWidth || 1;
    const maxH = window.innerHeight * 0.44;
    const s = Math.min(cw / c.w, maxH / c.h);
    playerWrap.style.width = `${Math.round(c.w * s)}px`;
    playerWrap.style.height = `${Math.round(c.h * s)}px`;
    player.style.width = `${vw * s}px`;
    player.style.height = `${vh * s}px`;
    player.style.left = `${Math.round(-c.x * s)}px`;
    player.style.top = `${Math.round(-c.y * s)}px`;
  };

  const viewSpan = () => Math.max(1, viewEnd - viewStart);

  const clampView = () => {
    const span = Math.min(viewSpan(), duration);
    viewStart = Math.max(0, Math.min(viewStart, duration - span));
    viewEnd = viewStart + span;
  };

  const drawTimeline = () => {
    const cssW = timeline.clientWidth || 1;
    const cssH = timeline.clientHeight || 44;
    const dpr = window.devicePixelRatio || 1;
    if (timeline.width !== Math.round(cssW * dpr)) {
      timeline.width = Math.round(cssW * dpr);
      timeline.height = Math.round(cssH * dpr);
    }
    const c = timeline.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, cssW, cssH);
    if (!duration) return;
    const span = viewSpan();
    const tx = (t) => ((t - viewStart) / span) * cssW;
    c.fillStyle = '#b91c1c';
    for (const [a, b] of stillRuns) {
      if (b < viewStart || a > viewEnd) continue;
      const x = tx(Math.max(a, viewStart));
      const w = Math.max(2, tx(Math.min(b, viewEnd)) - x);
      c.fillRect(x, 10, w, cssH - 20);
    }
    const px = tx(player.currentTime);
    if (px >= -2 && px <= cssW + 2) {
      c.fillStyle = '#2563eb';
      c.fillRect(px - 1, 0, 2, cssH);
    }
    c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted') || '#666';
    c.font = '10px system-ui, sans-serif';
    c.textBaseline = 'top';
    c.textAlign = 'left';
    c.fillText(hms(viewStart), 4, 1);
    c.textAlign = 'right';
    c.fillText(hms(viewEnd), cssW - 4, 1);
    stillPos.textContent = `${hms(player.currentTime)} / ${hms(duration)}`;
    highlightRow();
  };

  const highlightRow = () => {
    const t = player.currentTime;
    let active = -1;
    stillRuns.forEach(([a, b], i) => { if (t >= a - 1 && t <= b + 1) active = i; });
    [...resultBody.children].forEach((tr, i) => tr.classList.toggle('active', i === active));
  };

  const seekTo = (t) => {
    player.currentTime = Math.max(0, Math.min(duration, t));
    if (viewSpan() < duration && (t < viewStart || t > viewEnd)) {
      viewStart = t - viewSpan() / 2;
      clampView();
    }
    drawTimeline();
  };

  const zoomBy = (factor) => {
    const center = (player.currentTime >= viewStart && player.currentTime <= viewEnd)
      ? player.currentTime : viewStart + viewSpan() / 2;
    let span = Math.max(10, Math.min(duration, viewSpan() * factor));
    viewStart = center - span / 2;
    viewEnd = viewStart + span;
    clampView();
    drawTimeline();
  };

  const setStep = (n) => {
    for (const [k, el] of Object.entries(panels)) el.hidden = Number(k) !== n;
    stepsEl.forEach((li, i) => {
      li.classList.toggle('active', i + 1 === n);
      li.classList.toggle('done', i + 1 < n);
    });
    backButton.hidden = !(n === 2 || n === 4);
    backButton.textContent = n === 4 ? 'New analysis' : 'Back';
    nextButton.hidden = n !== 2;
  };

  const setStatus = (msg, cls) => {
    status.textContent = msg || '';
    status.className = 'status' + (cls ? ' ' + cls : '');
  };

  const hms = (t) => {
    t = Math.floor(t);
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
             : `${m}:${String(s).padStart(2, '0')}`;
  };

  const pad2 = (n) => String(n).padStart(2, '0');
  const clockOf = (epoch) => {
    const d = new Date(epoch);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  };
  const fmtLocalInput = (epoch) => {
    const d = new Date(epoch);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` +
           `T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  };

  const reset = () => {
    runId++;
    if (preview) { preview.removeAttribute('src'); preview.load(); preview = null; }
    if (url) { URL.revokeObjectURL(url); url = null; }
    file = null;
    fileInput.value = '';
    stillRuns = [];
    resultBody.textContent = '';
    player.removeAttribute('src');
    player.load();
    setStatus('');
    setStep(1);
  };

  const updateOverlay = () => {
    const rect = cropCanvas.getBoundingClientRect();
    if (!rect.width || !vw) return;
    const s = rect.width / vw;
    const x = sel.x * s, y = sel.y * s, w = sel.w * s, h = sel.h * s;
    const cw = rect.width, ch = rect.height;
    Object.assign(selection.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    Object.assign(shades.top.style, { left: '0px', top: '0px', width: cw + 'px', height: y + 'px' });
    Object.assign(shades.bottom.style, { left: '0px', top: (y + h) + 'px', width: cw + 'px', height: Math.max(0, ch - y - h) + 'px' });
    Object.assign(shades.left.style, { left: '0px', top: y + 'px', width: x + 'px', height: h + 'px' });
    Object.assign(shades.right.style, { left: (x + w) + 'px', top: y + 'px', width: Math.max(0, cw - x - w) + 'px', height: h + 'px' });
  };

  const drawPreview = () => {
    const ctx = cropCanvas.getContext('2d');
    ctx.drawImage(preview, 0, 0, vw, vh);
    updateOverlay();
  };

  const clampSel = () => {
    sel.w = Math.max(MINSEL, Math.min(sel.w, vw));
    sel.h = Math.max(MINSEL, Math.min(sel.h, vh));
    sel.x = Math.max(0, Math.min(sel.x, vw - sel.w));
    sel.y = Math.max(0, Math.min(sel.y, vh - sel.h));
  };

  let drag = null;
  const onPointerDown = (e) => {
    const handle = e.target.dataset ? e.target.dataset.handle : null;
    if (e.target !== selection && !handle) return;
    e.preventDefault();
    e.target.setPointerCapture(e.pointerId);
    drag = { handle: handle || 'move', x: e.clientX, y: e.clientY, sel0: { ...sel } };
  };
  const onPointerMove = (e) => {
    if (!drag) return;
    const rect = cropCanvas.getBoundingClientRect();
    const s = rect.width / vw;
    const dx = (e.clientX - drag.x) / s;
    const dy = (e.clientY - drag.y) / s;
    const o = drag.sel0;
    let { x, y, w, h } = o;
    const hd = drag.handle;
    if (hd === 'move') { x = o.x + dx; y = o.y + dy; }
    if (hd.includes('w')) { x = o.x + dx; w = o.w - dx; }
    if (hd.includes('e')) { w = o.w + dx; }
    if (hd.includes('n')) { y = o.y + dy; h = o.h - dy; }
    if (hd.includes('s')) { h = o.h + dy; }
    if (w < MINSEL) { if (hd.includes('w')) x = o.x + o.w - MINSEL; w = MINSEL; }
    if (h < MINSEL) { if (hd.includes('n')) y = o.y + o.h - MINSEL; h = MINSEL; }
    sel = { x, y, w, h };
    if (drag.handle === 'move') {
      sel.x = Math.max(0, Math.min(sel.x, vw - sel.w));
      sel.y = Math.max(0, Math.min(sel.y, vh - sel.h));
    } else {
      if (sel.x < 0) { sel.w += sel.x; sel.x = 0; }
      if (sel.y < 0) { sel.h += sel.y; sel.y = 0; }
      sel.w = Math.min(sel.w, vw - sel.x);
      sel.h = Math.min(sel.h, vh - sel.y);
    }
    updateOverlay();
  };
  const onPointerUp = () => { drag = null; };
  stage.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('resize', updateOverlay);

  fullFrameButton.addEventListener('click', () => {
    sel = { x: 0, y: 0, w: vw, h: vh };
    updateOverlay();
  });

  scrub.addEventListener('input', () => {
    if (!preview || !duration) return;
    const t = (scrub.value / 100) * duration;
    scrubTime.textContent = hms(t);
    preview.currentTime = t;
  });

  const openFile = async (f) => {
    reset();
    file = f;
    url = URL.createObjectURL(f);
    preview = document.createElement('video');
    preview.muted = true;
    preview.preload = 'auto';
    preview.src = url;
    const ok = await new Promise((res) => {
      preview.onloadedmetadata = () => res(true);
      preview.onerror = () => res(false);
    });
    if (!ok || !preview.duration || !isFinite(preview.duration)) {
      reset();
      setStatus('Your browser cannot decode this file. Record as MP4 (H.264) and try again.', 'error');
      return;
    }
    duration = preview.duration;
    vw = preview.videoWidth;
    vh = preview.videoHeight;
    cropCanvas.width = vw;
    cropCanvas.height = vh;
    sel = { x: 0, y: 0, w: vw, h: vh };
    preview.onseeked = drawPreview;
    const t0 = Math.min(duration * 0.1, 30);
    scrub.value = (t0 / duration) * 100;
    scrubTime.textContent = hms(t0);
    preview.currentTime = t0;
    setStep(2);
    requestAnimationFrame(updateOverlay);
  };

  const grayFromCanvas = (ctx) => {
    const d = ctx.getImageData(0, 0, W, H).data;
    const g = new Float32Array(W * H);
    for (let i = 0, j = 0; i < d.length; i += 4, j++) {
      g[j] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    }
    return g;
  };

  const pixDiff = (a, b) => {
    let sum = 0;
    for (let j = 0; j < a.length; j++) sum += Math.abs(a[j] - b[j]);
    return sum / a.length;
  };

  const newDetectState = () => ({ prevG: null, diffs: [], anchorG: null, anchorT: 0, endT: 0, runs: [] });

  const processSecond = (t, g, st) => {
    if (st.prevG) st.diffs.push(g === st.prevG ? 0 : pixDiff(g, st.prevG));
    st.prevG = g;
    if (st.anchorG) {
      const d = g === st.anchorG ? 0 : pixDiff(g, st.anchorG);
      if (d < TH) { st.endT = t; return; }
      if (st.endT - st.anchorT >= 1) st.runs.push([st.anchorT, st.endT, st.anchorG]);
    }
    st.anchorG = g;
    st.anchorT = t;
    st.endT = t;
  };

  const finalizeDetect = (st) => {
    if (st.anchorG && st.endT - st.anchorT >= 1) st.runs.push([st.anchorT, st.endT, st.anchorG]);
    return st;
  };

  const decodeDiffs = async (crop, myRun, onProgress) => {
    const buf = await file.arrayBuffer();
    const mp4 = MP4Box.createFile();
    const st = newDetectState();
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let heldFrame = null;
    let heldGray = null;
    let nextT = 0;
    let decoder = null;
    let lastProg = 0;
    let failed = null;

    const grayOfHeld = () => {
      if (!heldGray) {
        ctx.drawImage(heldFrame, crop.x, crop.y, crop.w, crop.h, 0, 0, W, H);
        heldGray = grayFromCanvas(ctx);
      }
      return heldGray;
    };

    const emitUpTo = (t) => {
      while (nextT < t) {
        if (heldFrame) processSecond(nextT, grayOfHeld(), st);
        nextT += STEP;
      }
    };

    const trackDescription = (track) => {
      const trak = mp4.getTrackById(track.id);
      for (const entry of trak.mdia.minf.stbl.stsd.entries) {
        const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
        if (box) {
          const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
          box.write(stream);
          return new Uint8Array(stream.buffer, 8);
        }
      }
      return null;
    };

    await new Promise((resolve, reject) => {
      mp4.onError = (e) => reject(new Error('demux: ' + e));
      mp4.onReady = (info) => {
        try {
          const track = info.videoTracks && info.videoTracks[0];
          if (!track) throw new Error('no video track');
          decoder = new VideoDecoder({
            output: (frame) => {
              const t = frame.timestamp / 1e6;
              if (myRun !== runId) { frame.close(); return; }
              emitUpTo(t);
              if (heldFrame) heldFrame.close();
              heldFrame = frame;
              heldGray = null;
              if (t - lastProg > 5) { lastProg = t; onProgress(t); }
            },
            error: (e) => { failed = e; },
          });
          decoder.configure({
            codec: track.codec,
            codedWidth: track.video.width,
            codedHeight: track.video.height,
            description: trackDescription(track),
          });
          mp4.setExtractionOptions(track.id, null, { nbSamples: Infinity });
          mp4.onSamples = (id, user, chunk) => {
            for (const s of chunk) {
              decoder.decode(new EncodedVideoChunk({
                type: s.is_sync ? 'key' : 'delta',
                timestamp: (s.cts * 1e6) / s.timescale,
                duration: (s.duration * 1e6) / s.timescale,
                data: s.data,
              }));
            }
          };
          mp4.start();
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      buf.fileStart = 0;
      mp4.appendBuffer(buf);
      mp4.flush();
    });
    await decoder.flush();
    decoder.close();
    if (failed) throw failed;
    emitUpTo(duration + STEP);
    if (heldFrame) heldFrame.close();
    return finalizeDetect(st);
  };

  const analyzeSegment = (crop, t0, t1, myRun, onProgress) => new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'auto';
    video.src = url;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const samples = [];
    let nextT = Math.max(0, t0 - STEP);
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      video.pause();
      video.removeAttribute('src');
      video.load();
      resolve(samples);
    };
    video.onerror = () => { if (!finished) { finished = true; reject(new Error('decode')); } };

    const tick = () => {
      if (finished) return;
      if (myRun !== runId) { finish(); return; }
      const t = video.currentTime;
      if (t >= nextT) {
        ctx.drawImage(video, crop.x, crop.y, crop.w, crop.h, 0, 0, W, H);
        samples.push([t, grayFromCanvas(ctx)]);
        nextT = t + STEP;
        onProgress(Math.min(t, t1) - t0);
      }
      if (t >= t1 || video.ended) { finish(); return; }
      if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(tick);
      else setTimeout(tick, 40);
    };

    video.onloadedmetadata = () => {
      video.currentTime = Math.max(0, t0 - STEP);
      video.onseeked = async () => {
        video.onseeked = null;
        video.playbackRate = RATE;
        try { await video.play(); } catch (e) { reject(e); return; }
        if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(tick);
        else tick();
      };
    };
    video.onended = finish;
  });

  const runAnalysis = async () => {
    const myRun = ++runId;
    const crop = {
      x: Math.round(sel.x), y: Math.round(sel.y),
      w: Math.round(sel.w), h: Math.round(sel.h),
    };
    setStatus('');
    setStep(3);
    progressText.textContent = 'Loading the video …';
    barFill.style.width = '0%';

    const t0clock = performance.now();
    let lastPaint = 0;
    const paint = (total) => {
      const now = performance.now();
      if (now - lastPaint < 250) return;
      lastPaint = now;
      const frac = Math.min(1, total / duration);
      const eta = frac > 0.02 ? ` – about ${hms(((now - t0clock) / 1000) * (1 - frac) / frac)} left` : '';
      progressText.textContent = `Analyzing … ${hms(total)} / ${hms(duration)}${eta}`;
      barFill.style.width = `${frac * 100}%`;
    };

    let detect = null;
    if (window.MP4Box && window.VideoDecoder) {
      try {
        detect = await decodeDiffs(crop, myRun, paint);
      } catch (e) {
        console.warn('WebCodecs path failed, falling back to playback:', e);
        detect = null;
      }
    }
    if (myRun !== runId) return;
    if (!detect || !detect.diffs.length) {
      let samples = null;
      const nSeg = Math.max(1, Math.min(PARALLEL, Math.ceil(duration / 300)));
      const segLen = duration / nSeg;
      const progress = new Array(nSeg).fill(0);
      const seg = (i) => (done) => { progress[i] = done; paint(progress.reduce((a, b) => a + b, 0)); };
      let segResults;
      try {
        segResults = await Promise.all(
          Array.from({ length: nSeg }, (_, i) =>
            analyzeSegment(crop, i * segLen, i === nSeg - 1 ? duration : (i + 1) * segLen, myRun, seg(i)))
        );
      } catch (e) {
        if (myRun !== runId) return;
        setStep(2);
        setStatus('Analysis failed – the browser could not play the file. Try MP4 (H.264).', 'error');
        return;
      }
      samples = [];
      for (const sg of segResults) {
        for (const s of sg) {
          if (!samples.length || s[0] - samples[samples.length - 1][0] > STEP * 0.4) samples.push(s);
        }
      }
      const st = newDetectState();
      for (const [t, g] of samples) processSecond(t, g, st);
      detect = finalizeDetect(st);
    }
    if (myRun !== runId) return;

    const ds = [...detect.diffs].sort((x, y) => x - y);
    const n = ds.length;
    if (!n) {
      setStep(2);
      setStatus('No frames could be analyzed.', 'error');
      return;
    }

    const coverage = n / Math.max(1, duration - 1);
    const covNote = coverage < 0.9 ? ` · WARNING: only ${Math.round(coverage * 100)}% of the video was sampled` : '';
    const region = (crop.x === 0 && crop.y === 0 && crop.w === vw && crop.h === vh)
      ? 'full frame' : `region ${crop.w}×${crop.h} @ (${crop.x},${crop.y})`;
    rawRuns = detect.runs;
    analysisMeta = {
      file: file.name, duration, region, n,
      sec: ((performance.now() - t0clock) / 1000).toFixed(0),
      median: ds[Math.floor(n / 2)].toFixed(2), max: ds[n - 1].toFixed(2), cov: covNote,
    };
    lastCrop = crop;
    recStartEpoch = (file && file.lastModified ? file.lastModified : 0) - Math.round(duration * 1000);
    if (recStart) recStart.value = fmtLocalInput(recStartEpoch);
    viewStart = 0;
    viewEnd = duration;
    renderResults();
    showFull = false;
    const isFullCrop = crop.x === 0 && crop.y === 0 && crop.w === vw && crop.h === vh;
    viewToggle.hidden = isFullCrop;
    viewToggle.textContent = 'Full frame';
    if (player.src !== url) player.src = url;
    setStep(4);
    requestAnimationFrame(() => { layoutPlayer(); drawTimeline(); });
    if (stillRuns.length) seekTo(Math.max(0, stillRuns[0][0] - 2));
  };

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) openFile(fileInput.files[0]);
  });
  ['dragenter', 'dragover'].forEach((ev) =>
    dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.classList.remove('drag'); }));
  dropZone.addEventListener('drop', (e) => {
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) openFile(f);
  });
  mergeGap.addEventListener('input', renderResults);
  if (recStart) recStart.addEventListener('input', () => {
    const t = Date.parse(recStart.value);
    if (!Number.isNaN(t)) { recStartEpoch = t; renderResults(); }
  });
  nextButton.addEventListener('click', () => { if (file) runAnalysis(); });
  backButton.addEventListener('click', reset);
  const brandEl = document.getElementById('brand');
  if (brandEl) brandEl.addEventListener('click', reset);

  const timeAtPointer = (clientX) => {
    const rect = timeline.getBoundingClientRect();
    return viewStart + ((clientX - rect.left) / rect.width) * viewSpan();
  };

  let scrubbing = false;
  let lastScrubSeek = 0;
  const scrubTo = (clientX, force) => {
    const tp = Math.max(0, Math.min(duration, timeAtPointer(clientX)));
    const now = performance.now();
    if (force || now - lastScrubSeek > 150) {
      lastScrubSeek = now;
      player.currentTime = tp;
    }
    drawTimeline();
  };
  timeline.addEventListener('pointerdown', (e) => {
    timeline.setPointerCapture(e.pointerId);
    scrubbing = true;
    scrubTo(e.clientX, true);
  });
  timeline.addEventListener('pointermove', (e) => {
    if (scrubbing) scrubTo(e.clientX, false);
  });
  timeline.addEventListener('pointerup', (e) => {
    if (scrubbing) scrubTo(e.clientX, true);
    scrubbing = false;
  });
  timeline.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = timeline.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    if (e.ctrlKey || e.metaKey) {
      const cursorT = viewStart + fx * viewSpan();
      const span = Math.max(10, Math.min(duration, viewSpan() * (e.deltaY > 0 ? 1.25 : 0.8)));
      viewStart = cursorT - fx * span;
      viewEnd = viewStart + span;
      clampView();
    } else {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      viewStart += (d / rect.width) * viewSpan();
      clampView();
    }
    drawTimeline();
  }, { passive: false });
  playPause.addEventListener('click', () => {
    if (player.paused) player.play(); else player.pause();
  });
  player.addEventListener('play', () => { playPause.innerHTML = '&#10074;&#10074;'; });
  player.addEventListener('pause', () => { playPause.innerHTML = '&#9654;'; });
  viewToggle.addEventListener('click', () => {
    showFull = !showFull;
    viewToggle.textContent = showFull ? 'Analyzed region' : 'Full frame';
    layoutPlayer();
  });
  zoomIn.addEventListener('click', () => zoomBy(0.5));
  zoomOut.addEventListener('click', () => zoomBy(2));
  player.addEventListener('timeupdate', () => {
    if (!player.paused && viewSpan() < duration && player.currentTime > viewEnd) {
      viewStart = player.currentTime - viewSpan() * 0.1;
      clampView();
    }
    drawTimeline();
  });
  player.addEventListener('seeked', drawTimeline);
  window.addEventListener('resize', () => { layoutPlayer(); drawTimeline(); });
  nextStill.addEventListener('click', () => {
    const t = player.currentTime;
    const run = stillRuns.find(([a]) => a > t + 0.5);
    if (run) seekTo(Math.max(0, run[0] - 1));
  });
  prevStill.addEventListener('click', () => {
    const t = player.currentTime;
    const before = stillRuns.filter(([a]) => a < t - 1.5);
    if (before.length) seekTo(Math.max(0, before[before.length - 1][0] - 1));
  });

  setStep(1);
})();
