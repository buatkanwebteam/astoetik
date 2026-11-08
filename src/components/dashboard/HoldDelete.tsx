"use client";

import { FaCheck, FaTrashCan } from "react-icons/fa6";
import HoldButton, { type HoldButtonSize } from "./HoldButton";

/** Delete confirmation by press-and-hold (React Bits Hold Button). Deleting is permanent. */
export function HoldDelete({
  onConfirm,
  disabled,
  size = "sm",
  compact = false,
  className,
}: {
  onConfirm: () => void;
  disabled?: boolean;
  size?: HoldButtonSize;
  /** Icon-only round button (label stays for screen readers). */
  compact?: boolean;
  className?: string;
}) {
  return (
    <HoldButton
      size={size}
      radius={999}
      holdTime={1500}
      resetAfter={900}
      backgroundColor="#fee2e2"
      textColor="#b91c1c"
      fillColor="#dc2626"
      fillTextColor="#ffffff"
      icon={<FaTrashCan className="size-3.5" aria-hidden />}
      doneIcon={<FaCheck className="size-3.5" aria-hidden />}
      doneLabel={compact ? <span className="sr-only">Terhapus</span> : "Terhapus"}
      disabled={disabled}
      onHold={onConfirm}
      className={`${compact ? "h-7! w-7! px-0! sm:h-8! sm:w-8!" : ""} ${className ?? ""}`.trim()}
      hint="Tahan tombol selama 1,5 detik untuk menghapus. Penghapusan tidak bisa dibatalkan."
    >
      {compact ? <span className="sr-only">Tahan untuk hapus</span> : "Tahan untuk hapus"}
    </HoldButton>
  );
}
