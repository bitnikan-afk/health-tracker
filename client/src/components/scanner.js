// Сканер штрихкодов через камеру
export function initScanner(videoEl, onDetected) {
  if (!videoEl || !('BarcodeDetector' in window)) {
    console.warn('BarcodeDetector не поддерживается');
    return null;
  }

  let stream = null;
  let stopped = false;

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoEl.srcObject = stream;
      await videoEl.play();

      const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'code_128'] });

      const scan = async () => {
        if (stopped) return;
        try {
          const barcodes = await detector.detect(videoEl);
          for (const b of barcodes) {
            if (onDetected) onDetected(b.rawValue);
            stop();
            return;
          }
        } catch {}
        requestAnimationFrame(scan);
      };
      scan();
    } catch (e) {
      console.error('Camera error:', e);
    }
  }

  function stop() {
    stopped = true;
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  return { start, stop };
}
