"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

// Native <dialog> gives focus trapping, Escape and inert background for free.
export function Drawer({
  open,
  onClose,
  side,
  title,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  side: "left" | "right";
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-y-0 m-0 h-dvh max-h-none ${wide ? "w-[min(40rem,100%)]" : "w-[min(24rem,100%)]"} max-w-none border-kat-line bg-kat-card p-0 text-kat-text backdrop:bg-black/40 ${
        side === "left" ? "left-0 border-r" : "right-0 left-auto border-l"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-kat-line px-5">
          <h2 className="font-grotesk text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-sm text-kat-muted transition-colors duration-150 hover:bg-kat-raised hover:text-kat-text"
            aria-label="Tutup"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="shrink-0 border-t border-kat-line p-5">{footer}</div>}
      </div>
    </dialog>
  );
}
