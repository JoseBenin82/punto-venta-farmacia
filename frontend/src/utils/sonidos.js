/**
 * RNF-004: Sistema de Sonidos / Feedback auditivo
 * Genera tonos con Web Audio API — sin archivos externos necesarios
 */

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playTone(frequency, duration = 0.15, type = 'sine', volume = 0.3) {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = frequency;
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch {
        // Silently fail if audio context isn't available
    }
}

/** Escaneo exitoso — beep corto agudo */
export function sonidoExito() {
    playTone(1200, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(1600, 0.1, 'sine', 0.2), 100);
}

/** Error / Producto no encontrado — tono bajo doble */
export function sonidoError() {
    playTone(300, 0.2, 'square', 0.2);
    setTimeout(() => playTone(200, 0.3, 'square', 0.2), 250);
}

/** Alerta (interacción, caducidad) — tono medio triple */
export function sonidoAlerta() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => playTone(800, 0.12, 'triangle', 0.25), i * 180);
    }
}

/** Venta completada — melodía ascendente */
export function sonidoVentaCompletada() {
    playTone(523, 0.15, 'sine', 0.2);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.2), 150);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.2), 300);
}

/** Venta cancelada — melodía descendente */
export function sonidoCancelacion() {
    playTone(784, 0.15, 'sine', 0.2);
    setTimeout(() => playTone(523, 0.25, 'sine', 0.2), 200);
}

export default {
    sonidoExito,
    sonidoError,
    sonidoAlerta,
    sonidoVentaCompletada,
    sonidoCancelacion
};
