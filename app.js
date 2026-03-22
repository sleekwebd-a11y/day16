<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QR Generator — Free & Instant</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-slate-200 font-sans flex items-center justify-center px-4 py-10">

<div class="w-full max-w-md space-y-5">

  <div class="text-center space-y-2">
    <div class="text-5xl">⬛</div>
    <h1 class="text-3xl font-black bg-gradient-to-r from-white to-violet-300 bg-clip-text text-transparent">QR Generator</h1>
    <p class="text-slate-400 text-sm">Free. Instant. No login. No watermark.</p>
  </div>

  <div class="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">

    <div>
      <label class="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">URL or text</label>
      <textarea id="qrInput" rows="3" placeholder="https://yoursite.com or any text..."
        class="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none text-sm leading-relaxed"></textarea>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Foreground</label>
        <div class="flex items-center gap-2">
          <input type="color" id="fgColor" value="#ffffff"
            class="w-10 h-10 rounded-xl border border-white/20 bg-transparent cursor-pointer">
          <span id="fgHex" class="text-xs font-mono text-slate-400">#ffffff</span>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Background</label>
        <div class="flex items-center gap-2">
          <input type="color" id="bgColor" value="#0f172a"
            class="w-10 h-10 rounded-xl border border-white/20 bg-transparent cursor-pointer">
          <span id="bgHex" class="text-xs font-mono text-slate-400">#0f172a</span>
        </div>
      </div>
    </div>

    <div>
      <div class="flex justify-between mb-2">
        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Size</label>
        <span id="sizeLabel" class="text-xs font-mono text-violet-300">256 × 256</span>
      </div>
      <input type="range" id="qrSize" min="128" max="512" step="32" value="256"
        class="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-500 bg-white/10">
    </div>

    <div>
      <label class="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Error correction</label>
      <div class="grid grid-cols-4 gap-2">
        <button class="ec-btn py-2 rounded-xl text-xs font-bold border transition-all bg-violet-600 border-violet-500 text-white" data-ec="L">L · Low</button>
        <button class="ec-btn py-2 rounded-xl text-xs font-bold border transition-all bg-white/5 border-white/10 text-slate-300" data-ec="M">M · Med</button>
        <button class="ec-btn py-2 rounded-xl text-xs font-bold border transition-all bg-white/5 border-white/10 text-slate-300" data-ec="Q">Q · High</button>
        <button class="ec-btn py-2 rounded-xl text-xs font-bold border transition-all bg-white/5 border-white/10 text-slate-300" data-ec="H">H · Max</button>
      </div>
    </div>

    <button id="generateBtn"
      class="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95">
      ⬛ Generate QR Code
    </button>
  </div>

  <div id="outputCard" class="hidden bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5">
    <div class="flex justify-center">
      <div id="qrWrapper" class="rounded-2xl overflow-hidden shadow-2xl p-4 inline-block">
        <canvas id="qrCanvas"></canvas>
      </div>
    </div>
    <div class="bg-black/20 rounded-2xl p-3 text-center">
      <div class="text-xs text-slate-500 mb-1">Encoded content</div>
      <div id="inputPreview" class="text-sm text-slate-200 font-mono break-all"></div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <button id="downloadPng"
        class="py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-2xl font-bold text-sm transition-all active:scale-95">
        ⬇ Download PNG
      </button>
      <button id="copyBtn"
        class="py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold text-sm transition-all active:scale-95">
        📋 Copy Image
      </button>
    </div>
    <button id="resetBtn"
      class="w-full py-3 bg-transparent hover:bg-white/5 border border-white/10 rounded-2xl font-semibold text-sm text-slate-400 hover:text-white transition-all">
      ✕ Clear & start over
    </button>
  </div>

  <p class="text-center text-xs text-slate-600">No data is stored. Everything runs in your browser.</p>

</div>

<script>
var selectedEC = 'L';

window.addEventListener('DOMContentLoaded', function () {

  document.querySelectorAll('.ec-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectedEC = btn.dataset.ec;
      document.querySelectorAll('.ec-btn').forEach(function (b) {
        var active = b.dataset.ec === selectedEC;
        b.className = 'ec-btn py-2 rounded-xl text-xs font-bold border transition-all ' +
          (active ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10');
      });
    });
  });

  document.getElementById('qrSize').addEventListener('input', function () {
    document.getElementById('sizeLabel').textContent = this.value + ' × ' + this.value;
  });

  document.getElementById('fgColor').addEventListener('input', function () {
    document.getElementById('fgHex').textContent = this.value;
  });

  document.getElementById('bgColor').addEventListener('input', function () {
    document.getElementById('bgHex').textContent = this.value;
  });

  document.getElementById('generateBtn').addEventListener('click', generateQR);

  document.getElementById('qrInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateQR();
    }
  });

  document.getElementById('downloadPng').addEventListener('click', function () {
    var canvas = document.getElementById('qrCanvas');
    var link   = document.createElement('a');
    var text   = document.getElementById('qrInput').value.trim();
    var slug   = text.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40) || 'qr-code';
    link.download = slug + '.png';
    link.href     = canvas.toDataURL('image/png');
    link.click();
  });

  document.getElementById('copyBtn').addEventListener('click', function () {
    var canvas = document.getElementById('qrCanvas');
    canvas.toBlob(function (blob) {
      var item = new ClipboardItem({ 'image/png': blob });
      navigator.clipboard.write([item])
        .then(function ()  { flashBtn('copyBtn', '✅ Copied!'); })
        .catch(function () { flashBtn('copyBtn', '❌ Failed');  });
    });
  });

  document.getElementById('resetBtn').addEventListener('click', function () {
    document.getElementById('qrInput').value = '';
    document.getElementById('outputCard').classList.add('hidden');
    document.getElementById('qrInput').focus();
  });

});

function generateQR() {
  var text = document.getElementById('qrInput').value.trim();
  if (!text) { shake(document.getElementById('qrInput')); return; }

  var size    = parseInt(document.getElementById('qrSize').value);
  var fgColor = document.getElementById('fgColor').value;
  var bgColor = document.getElementById('bgColor').value;
  var canvas  = document.getElementById('qrCanvas');

  QRCode.toCanvas(canvas, text, {
    width: size, margin: 2,
    errorCorrectionLevel: selectedEC,
    color: { dark: fgColor, light: bgColor }
  }, function (err) {
    if (err) {
      alert('Could not generate QR code. Try switching error correction to L.');
      return;
    }
    document.getElementById('qrWrapper').style.backgroundColor = bgColor;
    document.getElementById('inputPreview').textContent = text.length > 80 ? text.slice(0, 80) + '…' : text;
    document.getElementById('outputCard').classList.remove('hidden');
    document.getElementById('outputCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function shake(el) {
  el.classList.add('ring-2', 'ring-red-500');
  el.placeholder = 'Please enter some text or a URL first...';
  setTimeout(function () {
    el.classList.remove('ring-2', 'ring-red-500');
    el.placeholder = 'https://yoursite.com or any text...';
  }, 1500);
}

function flashBtn(id, label) {
  var btn  = document.getElementById(id);
  var orig = btn.textContent;
  btn.textContent = label;
  setTimeout(function () { btn.textContent = orig; }, 2000);
}
</script>
</body>
</html>
