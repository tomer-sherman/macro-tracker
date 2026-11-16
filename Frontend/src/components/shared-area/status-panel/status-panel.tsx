import { ReactNode } from "react";
import "./status-panel.css";

type StatusPanelProps = {
    kind: "empty" | "failed";
    text: string;         // Always says what happened - the color is never the only cue.
    children?: ReactNode; // An action, e.g. a "Try again" button.
};

// The "no data" / "couldn't load" panel - a dashed sunken box with a status square:
export function StatusPanel({ kind, text, children }: StatusPanelProps) {
    return (
        <div className={`StatusPanel ${kind}`}>
            <p>{text}</p>
            {children}
        </div>
    );
}
