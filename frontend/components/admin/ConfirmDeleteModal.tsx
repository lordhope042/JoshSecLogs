"use client";

import {
  AlertTriangle,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  open: boolean;
  title?: string;
  description?: string;

  loading?: boolean;

  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  open,
  title = "Delete Item",
  description = "This action cannot be undone.",
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !loading) onCancel();
      }}
    >
      <DialogContent className="max-w-md rounded-2xl border border-red-500/20 bg-[#0f172a] text-white">
        <DialogHeader>

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          <DialogTitle className="text-center text-2xl">
            {title}
          </DialogTitle>

          <DialogDescription className="pt-2 text-center text-zinc-400">
            {description}
          </DialogDescription>

        </DialogHeader>

        <DialogFooter className="mt-6 flex-row gap-3">

          <Button
            variant="outline"
            disabled={loading}
            onClick={onCancel}
            className="flex-1 border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
          >
            Cancel
          </Button>

          <Button
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}