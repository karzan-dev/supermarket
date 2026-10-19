import { useEffect, useRef, useState } from 'react';
import { Barcode, Camera, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

type DetectedBarcode = { rawValue: string };
type BarcodeDetectorInstance = { detect(source: HTMLVideoElement): Promise<DetectedBarcode[]> };
type BarcodeDetectorConstructor = new (options?: { formats: string[] }) => BarcodeDetectorInstance;

interface BarcodeScannerButtonProps {
  onDetected: (barcode: string) => void;
  className?: string;
}

export function BarcodeScannerButton({ onDetected, className }: BarcodeScannerButtonProps) {
  const { t, showToast } = useApp();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onDetectedRef = useRef(onDetected);
  const tRef = useRef(t);
  const showToastRef = useRef(showToast);

  onDetectedRef.current = onDetected;
  tRef.current = t;
  showToastRef.current = showToast;

  const startScanner = async () => {
    const BarcodeDetector = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!BarcodeDetector || !navigator.mediaDevices?.getUserMedia) {
      showToast(t('barcodeScanUnsupported'), 'error');
      return;
    }

    try {
      setStream(await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      }));
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('cameraPermissionError'), 'error');
    }
  };

  useEffect(() => {
    if (!stream) return;

    let active = true;
    let timeoutId: number | undefined;
    const video = videoRef.current;
    const stopStream = () => stream.getTracks().forEach(track => track.stop());
    const closeScanner = () => {
      stopStream();
      setStream(null);
    };
    const BarcodeDetector = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;

    if (!video || !BarcodeDetector) {
      showToastRef.current(tRef.current('barcodeScanUnsupported'), 'error');
      closeScanner();
      return;
    }

    let detector: BarcodeDetectorInstance;
    try {
      detector = new BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'codabar'],
      });
    } catch (error) {
      showToastRef.current(error instanceof Error ? error.message : tRef.current('barcodeScanUnsupported'), 'error');
      closeScanner();
      return;
    }

    video.srcObject = stream;
    const scan = async () => {
      if (!active) return;
      try {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          const [result] = await detector.detect(video);
          if (result?.rawValue) {
            closeScanner();
            onDetectedRef.current(result.rawValue);
            return;
          }
        }
        timeoutId = window.setTimeout(() => void scan(), 150);
      } catch (error) {
        showToastRef.current(error instanceof Error ? error.message : tRef.current('barcodeScanFailed'), 'error');
        closeScanner();
      }
    };

    void video.play().then(() => void scan()).catch(error => {
      showToastRef.current(error instanceof Error ? error.message : tRef.current('cameraPermissionError'), 'error');
      closeScanner();
    });

    return () => {
      active = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      stopStream();
      if (video.srcObject === stream) video.srcObject = null;
    };
  }, [stream]);

  return (
    <>
      <button
        type="button"
        onClick={() => void startScanner()}
        title={t('scanBarcode')}
        aria-label={t('scanBarcode')}
        className={className ?? 'grid size-10 shrink-0 place-items-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'}
      >
        <Camera className="size-5" aria-hidden="true" />
      </button>

      {stream && (
        <div
          className="fixed inset-0 z-[60] overflow-y-auto flex items-center-safe justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('scanBarcode')}
        >
          <div className="w-full max-w-lg rounded-md bg-white p-4 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Barcode className="size-5 text-teal-700" />
                {t('scanBarcode')}
              </h2>
              <button type="button" onClick={() => setStream(null)} aria-label={t('cancel')}>
                <X className="size-5 text-slate-500" />
              </button>
            </div>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="max-h-[65vh] w-full rounded-md bg-black object-contain"
            />
            <p className="mt-3 text-center text-sm text-slate-500">{t('cameraScanner')}</p>
          </div>
        </div>
      )}
    </>
  );
}
