"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Bell, Sparkles, Send, MessageCircle } from "lucide-react";
import type { ActiveNotification } from "@/hooks/useWelcomeNotification";

/**
 * WelcomeNotificationModal
 *
 * Pops up once when a user lands on the dashboard right after logging in,
 * IF the backend has an active admin-configured notification. The admin
 * enters every notification the same way (title, message, optional
 * Telegram/WhatsApp links) — there's no "type" to pick.
 *
 * Which visual variant renders is decided entirely by `isFirstLogin`,
 * this viewer's own login context (from `useWelcomeNotification`) — not
 * anything stored on the notification:
 *
 *   - First-ever login (isFirstLogin === true):
 *       sparkle icon, full-width stacked join buttons, "Skip for now"
 *   - Any later login (isFirstLogin === false):
 *       bell icon, compact side-by-side join buttons
 *   - Unknown (isFirstLogin === undefined, e.g. hook couldn't tell):
 *       bell icon, side-by-side buttons — same as a returning user
 *
 * If the notification has no Telegram/WhatsApp links at all, a single
 * "Got it" button is shown instead, regardless of login context.
 */

interface WelcomeNotificationModalProps {
  shouldShow: boolean;
  notification: ActiveNotification | null;
  isFirstLogin?: boolean;
  onDismiss: () => void;
}

export default function WelcomeNotificationModal({
  shouldShow,
  notification,
  isFirstLogin,
  onDismiss,
}: WelcomeNotificationModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (shouldShow && notification) {
      const t = setTimeout(() => setOpen(true), 350);
      return () => clearTimeout(t);
    }
  }, [shouldShow, notification]);

  function handleClose(openState: boolean) {
    setOpen(openState);
    if (!openState) {
      onDismiss();
    }
  }

  if (!notification) return null;

  const isNewUser = isFirstLogin === true;
  const hasTelegram = Boolean(notification.telegramUrl);
  const hasWhatsapp = Boolean(notification.whatsappUrl);
  const hasSocialLinks = hasTelegram || hasWhatsapp;

  const Icon = isNewUser ? Sparkles : Bell;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-sm gap-0 overflow-hidden rounded-2xl border border-white/10 bg-[#232428] p-6 text-center sm:max-w-sm [&>button]:hidden"
      >
        <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center text-white">
          <Icon className="h-6 w-6" />
        </div>

        <DialogTitle className="text-base font-semibold text-white">
          {notification.title}
        </DialogTitle>

        <DialogDescription className="mt-1.5 text-sm leading-relaxed text-zinc-400">
          {notification.message}
        </DialogDescription>

        {hasSocialLinks ? (
          <div
            className={`mt-5 flex gap-2 ${isNewUser ? "flex-col" : "flex-row"}`}
          >
            {hasTelegram && (
              <a
                href={notification.telegramUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#2f3136] py-2.5 text-sm font-medium text-white transition hover:bg-[#3a3c42]"
              >
                <Send className="h-4 w-4" />
                {isNewUser ? "Join Telegram" : "Telegram"}
              </a>
            )}
            {hasWhatsapp && (
              <a
                href={notification.whatsappUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#2f3136] py-2.5 text-sm font-medium text-white transition hover:bg-[#3a3c42]"
              >
                <MessageCircle className="h-4 w-4" />
                {isNewUser ? "Join WhatsApp" : "WhatsApp"}
              </a>
            )}
          </div>
        ) : (
          <DialogClose asChild>
            <button className="mt-5 w-full rounded-xl border border-white/10 bg-[#2f3136] py-2.5 text-sm font-medium text-white transition hover:bg-[#3a3c42]">
              Got it
            </button>
          </DialogClose>
        )}

        {isNewUser && hasSocialLinks && (
          <DialogClose asChild>
            <button className="mt-3 text-xs text-zinc-500 transition hover:text-zinc-300">
              Skip for now
            </button>
          </DialogClose>
        )}
      </DialogContent>
    </Dialog>
  );
}