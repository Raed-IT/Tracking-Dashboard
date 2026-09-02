import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { useTrackingStore } from "@/stores/tracking-store";
import type { Track } from "@/types";

export function connectTracking(): () => void {
    window.Pusher = Pusher;

    const host =
        process.env.NEXT_PUBLIC_REVERB_HOST ??
        window.location.hostname;

    const port = Number(
        process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080
    );

    const scheme =
        process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http";

    console.log("Connecting to Reverb:", {
        host,
        port,
        scheme,
    });

    const echo = new Echo({
        broadcaster: "reverb",

        key:
            process.env.NEXT_PUBLIC_REVERB_APP_KEY ??
            "tracking-key",

        wsHost: host,

        wsPort: port,
        wssPort: port,

        forceTLS: scheme === "https",

        enabledTransports:
            scheme === "https"
                ? ["wss"]
                : ["ws"],
    });

    const tracksChannel = echo.channel("tracks");

    const pusherChannel =
        (tracksChannel as any).subscription;

    // PRINT EVERY EVENT
    pusherChannel.bind_global(
        (eventName: string, data: unknown) => {
            console.log(
                "🔥 EVENT:",
                eventName,
                data
            );
        }
    );

    

    return () => {
        echo.leave("tracks");
        echo.disconnect();
    };
}