import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Camera, Upload, ArrowLeft, Loader } from 'lucide-react';
import { eightiesIcon } from '../ui/EightiesIcons';
import './SelfieCaptureScreen.css';

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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [cameraPending, setCameraPending] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const cameraSession = useRef(0);
    const [cameraError, setCameraError] = useState(false);

    const isGenerating = ugcPhase === 'generating';
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
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const size = Math.min(video.videoWidth, video.videoHeight);
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 512, 512);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        setPreview(dataUrl);
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
                const canvas = canvasRef.current;
                if (!canvas) return;
                const size = Math.min(img.width, img.height);
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext('2d')!;
                const sx = (img.width - size) / 2;
                const sy = (img.height - size) / 2;
                ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                stopCamera();
                setPreview(dataUrl);
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
                        <p role="status" className="generating-text">Generating your portrait and signature card. This may take up to two minutes.</p>
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
            <p className="selfie-subtitle">Keep your face centered. Your photo is cropped to a square.</p>

            <div className="selfie-viewport">
                <div className="selfie-orbit-ring" />
                {preview ? <img src={preview} alt="Photo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : !cameraError ? (
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
            </div>

            {(ugcError || fileError) && (
                <p role="alert" className="selfie-error">{fileError || ugcError}</p>
            )}

            <div className="selfie-actions">
                {preview ? <>
                    <button className="selfie-capture-btn" onClick={() => submitSelfie(preview)}>Use this photo</button>
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
            <p className="selfie-subtitle">Your photo is sent to our server and AI service to create your hero when you choose Use this photo.</p>

            <details className="photo-handling"><summary>How your photo is used</summary>
                <p>We crop your photo to a square and send it through our server to Google Gemini to create your fictional hero and artwork.</p>
                <p>Your original photo is not included in the saved run. Generated artwork and your deck are saved in this browser so you can resume.</p>
                <p>Canceling stops this app from waiting for the result. A request already sent to the AI service may still finish.</p>
            </details>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}
