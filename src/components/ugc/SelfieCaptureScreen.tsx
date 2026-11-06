import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Camera, Upload, ArrowLeft, Loader } from 'lucide-react';
import { eightiesIcon } from '../ui/EightiesIcons';
import './SelfieCaptureScreen.css';

const centeredCrop = { zoom: 1, x: 50, y: 50 };

function copyPhoto(source: CanvasImageSource, width: number, height: number, mirror = false) {
    const scale = Math.min(1, 1536 / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d');
    if (!context) return null;
    if (mirror) context.setTransform(-1, 0, 0, 1, canvas.width, 0);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
}

export function SelfieCaptureScreen() {
    const { ugcPhase, ugcError, selfieDataUrl, submitSelfie, cancelUgc, initializeRun } = useGameStore(state => ({
        ugcPhase: state.ugcPhase,
        ugcError: state.ugcError,
        selfieDataUrl: state.selfieDataUrl,
        submitSelfie: state.submitSelfie,
        cancelUgc: state.cancelUgc,
        initializeRun: state.initializeRun,
    }));

    const videoRef = useRef<HTMLVideoElement>(null);
    const cropCanvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [cameraPending, setCameraPending] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [preview, setPreview] = useState<HTMLCanvasElement | null>(null);
    const [crop, setCrop] = useState(centeredCrop);
    const cameraSession = useRef(0);
    const [cameraError, setCameraError] = useState(false);

    const isGenerating = ugcPhase === 'generating';
    const photoWidth = preview?.width ?? 0;
    const photoHeight = preview?.height ?? 0;
    const cropSize = Math.min(photoWidth, photoHeight) / crop.zoom;

    useLayoutEffect(() => {
        const canvas = cropCanvasRef.current;
        const context = canvas?.getContext('2d');
        if (!preview || !canvas || !context) return;
        const left = (photoWidth - cropSize) * crop.x / 100;
        const top = (photoHeight - cropSize) * crop.y / 100;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(preview, left, top, cropSize, cropSize, 0, 0, canvas.width, canvas.height);
    }, [preview, crop, cropSize, photoWidth, photoHeight, isGenerating]);
    const startCamera = useCallback(async () => {
        const session = ++cameraSession.current;
        setCameraError(false);
        setCameraPending(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
            });
            if (session !== cameraSession.current) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => setCameraReady(true);
            }
        } catch {
            if (session === cameraSession.current) setCameraError(true);
        } finally {
            if (session === cameraSession.current) setCameraPending(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        cameraSession.current++;
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setCameraReady(false);
        setCameraPending(false);
    }, []);

    useEffect(() => {
        return stopCamera;
    }, [isGenerating, startCamera, stopCamera]);

    const capturePhoto = () => {
        const video = videoRef.current;
        if (!video?.videoWidth || !video.videoHeight) return;

        const canvas = copyPhoto(video, video.videoWidth, video.videoHeight, true);
        if (!canvas) return;
        stopCamera();
        setCrop(centeredCrop);
        setPreview(canvas);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setFileError(null);
        if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) { setFileError('Choose an image smaller than 10 MB.'); return; }

        const reader = new FileReader();
        reader.onerror = () => setFileError('Could not read that photo. Choose another image.');
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => setFileError('That image could not be opened. Try a JPEG or PNG.');
            img.onload = () => {
                const canvas = copyPhoto(img, img.naturalWidth, img.naturalHeight);
                if (!canvas) return;
                stopCamera();
                setCrop(centeredCrop);
                setPreview(canvas);
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    if (isGenerating) {
        return (
            <div className="selfie-screen">
                <div className="selfie-sparkle selfie-sparkle-1"><img src={eightiesIcon(0)} alt="" /></div>
                <div className="selfie-sparkle selfie-sparkle-2"><img src={eightiesIcon(7)} alt="" /></div>
                <div className="selfie-sparkle selfie-sparkle-3"><img src={eightiesIcon(3)} alt="" /></div>
                <div className="selfie-sparkle selfie-sparkle-4"><img src={eightiesIcon(12)} alt="" /></div>
                <div className="generating-overlay">
                    <div className="generating-portal">
                        <div className="generating-orbit generating-orbit-1" />
                        <div className="generating-orbit generating-orbit-2" />
                        {selfieDataUrl && (
                            <img src={selfieDataUrl} className="generating-selfie" alt="Your photo" />
                        )}
                    </div>
                    <div className="generating-content">
                        <Loader size={36} className="generating-spinner" />
                        <p className="generating-label">Creating your hero</p>
                        <p role="status" className="generating-text">Fitting your photo into your Street Runner helmet.</p>
                        <button className="selfie-upload-btn" onClick={cancelUgc}>Cancel and go home</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="selfie-screen">
            <button aria-label="Back to home" className="selfie-back-btn" onClick={cancelUgc}>
                <ArrowLeft size={20} />
            </button>

            <div className="selfie-sparkle selfie-sparkle-1"><img src={eightiesIcon(5)} alt="" /></div>
            <div className="selfie-sparkle selfie-sparkle-2"><img src={eightiesIcon(14)} alt="" /></div>
            <div className="selfie-sparkle selfie-sparkle-3"><img src={eightiesIcon(9)} alt="" /></div>
            <div className="selfie-sparkle selfie-sparkle-4"><img src={eightiesIcon(18)} alt="" /></div>

            <h2 className="selfie-title">Show Us Your Mug</h2>
            <p className="selfie-subtitle">Center your face inside the inner circle. That area goes into your helmet.</p>

            <div className="selfie-viewport">
                <div className="selfie-orbit-ring" />
                {preview ? <canvas ref={cropCanvasRef} width={512} height={512} role="img" aria-label="Photo crop preview" className="selfie-crop-preview" /> : !cameraError ? (
                    <video
                        ref={videoRef}
                        aria-hidden="true"
                        autoPlay
                        playsInline
                        muted
                        className={`selfie-video ${cameraReady ? 'ready' : ''}`}
                    />
                ) : (
                    <div className="selfie-placeholder">
                        <Camera size={48} />
                        <p>Camera unavailable. Try again or choose a photo.</p>
                    </div>
                )}
                {!preview && !cameraReady && !cameraError && <div className="selfie-placeholder capture-prompt"><Camera size={40} /><p>{cameraPending ? 'Starting camera… Allow access if prompted.' : 'Your legend starts here.'}</p><p>Choose a photo or turn on your camera.</p></div>}
                <div className="selfie-frame" />
                {(preview || cameraReady) && <div className="selfie-face-guide" aria-hidden="true" />}
            </div>

            {preview && <div className="selfie-crop-controls" role="group" aria-label="Frame your photo">
                <label>Zoom<input type="range" min={1} max={3} step={0.05} value={crop.zoom} onChange={event => setCrop({ ...crop, zoom: event.target.valueAsNumber })} /></label>
                <label>Left to right<input type="range" value={crop.x} disabled={cropSize >= photoWidth} onChange={event => setCrop({ ...crop, x: event.target.valueAsNumber })} /></label>
                <label>Top to bottom<input type="range" value={crop.y} disabled={cropSize >= photoHeight} onChange={event => setCrop({ ...crop, y: event.target.valueAsNumber })} /></label>
            </div>}

            {(ugcError || fileError) && (
                <p role="alert" className="selfie-error">{fileError || ugcError}</p>
            )}

            <div className="selfie-actions">
                {preview ? <>
                    <button className="selfie-capture-btn" onClick={() => {
                        const canvas = cropCanvasRef.current;
                        if (canvas) void submitSelfie(canvas.toDataURL('image/jpeg', 0.8));
                    }}>Use this photo</button>
                    <button className="selfie-upload-btn" onClick={() => setPreview(null)}>Replace photo</button>
                </> : <>
                {!cameraReady && <button className="selfie-upload-btn" disabled={cameraPending} onClick={startCamera}>Use camera</button>}
                {cameraReady && (
                    <button className="selfie-capture-btn" onClick={capturePhoto}>
                        <img src={eightiesIcon(10)} alt="" className="btn-icon" />
                        Take photo
                    </button>
                )}
                <button className="selfie-upload-btn" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={20} />
                    Choose photo
                </button>
                </>}
            </div>
            {ugcError && <button className="selfie-upload-btn" onClick={() => initializeRun(crypto.randomUUID())}>Play a starter hero</button>}
            <p className="selfie-subtitle">Your photo stays in this browser.</p>

            <details className="photo-handling"><summary>How your photo is used</summary>
                <p>Your browser fits the area inside the guide into a Street Runner helmet. Your hero uses the standard starter deck.</p>
                <p>Your cropped portrait and battle sprite are saved on this device when you start your run.</p>
            </details>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />
        </div>
    );
}
