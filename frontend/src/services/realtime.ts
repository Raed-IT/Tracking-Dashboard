
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import type { AlertSeverity, OperatorAlert } from "@/types/tracking";
 
declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

type ReverbCallbacks = {
    onMessage?: (data: { message: string }) => void;
    onAlert?: (data: { alert: RealtimeAlert }) => void;
    onEvent?: (eventName: string, data: unknown) => void;
    onStatus?: (status: RealtimeStatus) => void;
};

export type RealtimeStatus = "connecting" | "connected" | "disconnected";
export type RealtimeAlert = {
    id: string;
    severity: AlertSeverity;
    state: OperatorAlert["state"];
    title: string;
    message: string | null;
    created_at: string | null;
};

let alertAudio: HTMLAudioElement | undefined;

function getAlertAudio(): HTMLAudioElement | undefined {
    if (typeof window === "undefined") {
        return undefined;
    }

    if (!alertAudio) {
        alertAudio = new Audio("/sounds/alert.mp3");
        alertAudio.preload = "auto";
    }

    return alertAudio;
}

export async function unlockAlertSound(): Promise<boolean> {
    const audio = getAlertAudio();
    if (!audio) {
        return false;
    }

    if (!audio.paused) {
        return true;
    }

    const wasMuted = audio.muted;
    audio.muted = true;
    try {
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        return true;
    } finally {
        audio.muted = wasMuted;
    }
}

export function playAlertSound(volume: number): void {
    if (volume <= 0) {
        return;
    }

    const audio = getAlertAudio();
    if (!audio) {
        return;
    }

    void unlockAlertSound().then((unlocked) => {
        if (!unlocked) {
            return;
        }

        audio.volume = Math.min(1, Math.max(0, volume));
        audio.currentTime = 0;
        void audio.play().catch((error: unknown) => {
            console.warn("Alert sound could not play:", error);
        });
    }).catch((error: unknown) => {
        console.warn("Alert sound could not play until the browser allows audio:", error);
    });
}

export function connectTracking(
    callbacks: ReverbCallbacks = {}
): () => void {
    const host =
        process.env.NEXT_PUBLIC_REVERB_HOST ??
        window.location.hostname;

    const port = Number(
        process.env.NEXT_PUBLIC_REVERB_PORT ?? 9090
    );

    const scheme =
        process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http";

    const key =
        process.env.NEXT_PUBLIC_REVERB_APP_KEY ??
        "tracking-key";
    let echo: Echo<"reverb"> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const scheduleRetry = () => {
        if (stopped || retryTimer) {
           return;
        }

        retryTimer = setTimeout(() => {
           retryTimer = undefined;
           connect();
        }, 5000);
    };

    const connect = () => {
        if (stopped) {
           return;
        }

        callbacks.onStatus?.("connecting");
        window.Pusher = Pusher;

        try {
           echo?.disconnect();
           echo = new Echo({
               broadcaster: "reverb",
               key,
               wsHost: host,
               wsPort: port,
               wssPort: port,
               forceTLS: scheme === "https",
               enabledTransports: scheme === "https" ? ["wss"] : ["ws"],
           });

           const connection = (
               echo.connector as {
                   pusher?: {
                       connection?: {
                           bind: (event: string, callback: (data: unknown) => void) => void;
                           unbind: (event: string, callback: (data: unknown) => void) => void;
                       };
                   };
               }
           ).pusher?.connection;
           const handleStateChange = (data: unknown) => {
               const state = (data as { current?: string }).current;

               callbacks.onStatus?.(
                   state === "connected"
                       ? "connected"
                       : state === "connecting"
                         ? "connecting"
                         : "disconnected",
               );

               if (state === "connected") {
                   if (retryTimer) {
                       clearTimeout(retryTimer);
                       retryTimer = undefined;
                   }
               } else if (state === "disconnected") {
                   scheduleRetry();
               }
           };
           connection?.bind("state_change", handleStateChange);

           const channel = echo.channel("test-channel");
           channel.listen(".test.message", (data: { message: string }) => {
               callbacks.onMessage?.(data);
           });

           const alertsChannel = echo.channel("alerts");
           alertsChannel.listen(".alert.created", (data: { alert: RealtimeAlert }) => {
            console.log("Received alert:", data.alert);
               callbacks.onAlert?.(data);
           });

           const pusherChannel = (channel as {
               subscription?: {
                   bind_global: (callback: (eventName: string, data: unknown) => void) => void;
               };
           }).subscription;

           pusherChannel?.bind_global((eventName, data) => {
               callbacks.onEvent?.(eventName, data);
           });
           scheduleRetry();
        } catch (error) {
           callbacks.onStatus?.("disconnected");
           console.error("Failed to connect to realtime services:", error);
           scheduleRetry();
        }
    };

    connect();

    return () => {
        stopped = true;
        if (retryTimer) {
           clearTimeout(retryTimer);
        }
        echo?.leave("test-channel");
        echo?.leave("alerts");
        echo?.disconnect();
        callbacks.onStatus?.("disconnected");
    };
}