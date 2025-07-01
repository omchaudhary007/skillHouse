import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ChatBot = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === "/") {
            // Set config before script loads
            (window as any).chtlConfig = { chatbotId: "2837314586" };

            const script = document.createElement("script");
            script.async = true;
            script.type = "text/javascript";
            script.setAttribute("data-id", "2837314586");
            script.id = "chtl-script";
            script.src = "https://chatling.ai/js/embed.js";

            document.body.appendChild(script);
        }

        return () => {
            const existingScript = document.getElementById("chtl-script");
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
            const chatElements = document.querySelectorAll('[id^="chatling"]');
            chatElements.forEach(element => element.remove());
        };
    }, [location.pathname]);

    return null;
};

export default ChatBot;