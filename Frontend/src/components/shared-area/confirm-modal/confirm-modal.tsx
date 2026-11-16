import { ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import "./confirm-modal.css";

type ConfirmModalProps = {
    open: boolean;
    title: string;
    children: ReactNode;          // The message.
    confirmText?: string;
    busyText?: string;            // Shown on the confirm button while isBusy.
    cancelText?: string;
    danger?: boolean;             // Red confirm button, for destructive actions.
    isBusy?: boolean;             // Disables the buttons and closing while the action runs.
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmModal({
    open,
    title,
    children,
    confirmText = "Confirm",
    busyText,
    cancelText = "Cancel",
    danger = false,
    isBusy = false,
    onConfirm,
    onCancel
}: ConfirmModalProps) {

    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const messageId = useId();

    // Open / close the native dialog to match the `open` prop.
    // showModal() gives the backdrop, keeps focus inside, and focuses the first button (Cancel - the safe choice):
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    function requestCancel(): void {
        if (!isBusy) onCancel();
    }

    return createPortal(
        <dialog
            ref={dialogRef}
            className="ConfirmModal"
            aria-labelledby={titleId}
            aria-describedby={messageId}
            // Escape key - let the parent decide (keeps the `open` prop the single source of truth):
            onCancel={event => { event.preventDefault(); requestCancel(); }}
            // A click on the dialog element itself is a click on the backdrop (the content fills the dialog):
            onClick={event => { if (event.target === event.currentTarget) requestCancel(); }}
        >
            <div className="modal-content">

                <h3 id={titleId}>{title}</h3>
                <div id={messageId} className="modal-message">{children}</div>

                <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={requestCancel} disabled={isBusy}>
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={danger ? "btn-danger" : "btn-primary"}
                        onClick={onConfirm}
                        disabled={isBusy}
                    >
                        {isBusy && busyText ? busyText : confirmText}
                    </button>
                </div>

            </div>
        </dialog>,
        document.body
    );
}
