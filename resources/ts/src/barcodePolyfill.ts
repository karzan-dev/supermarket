import { BarcodeDetector as BarcodeDetectorPonyfill, prepareZXingModule } from 'barcode-detector/ponyfill';
import zxingWasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';

// Native BarcodeDetector only exists in Chrome on Android/macOS. Every other
// browser (iOS Safari, Windows, Firefox) falls back to the ZXing WASM ponyfill,
// served from our own build so scanning does not depend on a third-party CDN.
prepareZXingModule({
  overrides: {
    locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? zxingWasmUrl : prefix + path),
  },
});

const REQUIRED_FORMATS = ['ean_13', 'code_128'];

type BarcodeWindow = Window & { BarcodeDetector?: { getSupportedFormats?: () => Promise<string[]> } | undefined };
const barcodeWindow = window as BarcodeWindow;

const usePonyfill = () => {
  barcodeWindow.BarcodeDetector = BarcodeDetectorPonyfill as unknown as BarcodeWindow['BarcodeDetector'];
};

if (!barcodeWindow.BarcodeDetector) {
  usePonyfill();
} else {
  // Some platforms expose the API but support no (or few) formats.
  void barcodeWindow.BarcodeDetector.getSupportedFormats?.()
    .then(formats => {
      if (!REQUIRED_FORMATS.every(format => formats.includes(format))) usePonyfill();
    })
    .catch(usePonyfill);
}
