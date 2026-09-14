import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

type ReverbCallbacks = {
    onMessage?: (data: { message: string }) => void;
    onEvent?: (eventName: string, data: unknown) => void;
};

export function connectTracking(
    callbacks: ReverbCallbacks = {}
): () => void {
    window.Pusher = Pusher;

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

    const echo = new Echo({
        broadcaster: "reverb",
        key,

        wsHost: host,
        wsPort: port,
        wssPort: port,

        forceTLS: scheme === "https",

        enabledTransports:
            scheme === "https"
                ? ["wss"]
                : ["ws"],
    });

    const channel = echo.channel("test-channel");

    channel.listen(
        ".test.message",
        (data: { message: string }) => {
            console.log("🔥 REAL-TIME EVENT:", data);

            callbacks.onMessage?.(data);
        }
    );

    const pusherChannel = (channel as any).subscription;

    if (pusherChannel) {
        pusherChannel.bind_global(
            (eventName: string, data: unknown) => {
                console.log(
                    "🔥 EVENT:",
                    eventName,
                    data
                );

                callbacks.onEvent?.(
                    eventName,
                    data
                );
            }
        );
    }

    return () => {
        echo.leave("test-channel");
        echo.disconnect();
    };
}