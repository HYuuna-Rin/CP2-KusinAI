import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";

export default function DeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("📡 DeepLinkHandler mounted — waiting for deep links...");

    const listener = App.addListener("appUrlOpen", (event) => {
      try {
        const { url } = event;
        console.log("🔗 Deep link received:", url);

        if (!url) return;

        const parsedUrl = new URL(url);
        const pathname = parsedUrl.hostname; // e.g., "verify-email"
        const token = parsedUrl.searchParams.get("token");

        console.log("📦 Parsed host:", pathname, "token:", token);

        if (pathname === "verify-email" && token) {
          // Navigate to the same verification route your web app uses
          navigate(`/verify-email?token=${token}`);
        } else {
          console.warn("⚠️ Unrecognized deep link:", url);
        }
      } catch (err) {
        console.error("❌ Error handling deep link:", err);
      }
    });

    return () => {
      listener.remove();
    };
  }, [navigate]);

  return null;
}
