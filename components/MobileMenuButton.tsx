"use client";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MobileMenuButton({ isOpen, onToggle }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden fixed top-4 left-4 z-[200] w-10 h-10 flex flex-col items-center justify-center gap-[5px] bg-[var(--sidebar-bg)] border border-[var(--border)] rounded-md"
      aria-label="Toggle menu"
    >
      <span
        className={`block w-5 h-[1px] bg-[var(--text-primary)] transition-all duration-300 ${
          isOpen ? "rotate-45 translate-y-[6px]" : ""
        }`}
      />
      <span
        className={`block w-5 h-[1px] bg-[var(--text-primary)] transition-all duration-300 ${
          isOpen ? "opacity-0" : ""
        }`}
      />
      <span
        className={`block w-5 h-[1px] bg-[var(--text-primary)] transition-all duration-300 ${
          isOpen ? "-rotate-45 -translate-y-[6px]" : ""
        }`}
      />
    </button>
  );
}
