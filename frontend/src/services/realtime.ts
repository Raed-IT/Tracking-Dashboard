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
        process.env.NEXT_PUBLIC_REVERB_PORT ?? 9090
    );

    const scheme =
        process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http";

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

    echo
        .channel("tracks")
        .listen(
            ".track.updated",
            (event: { track: Track }) => {
                useTrackingStore
                    .getState()
                    .upsert(event.track);
            }
        );

    return () => {
        echo.leave("tracks");
        echo.disconnect();
    };
}