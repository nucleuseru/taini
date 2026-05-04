"use client";

import { Button } from "@/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
} from "@/components/ui/drawer-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <DrawerDialog open={open} onOpenChange={onOpenChange}>
      <DrawerDialogContent className="sm:max-w-[425px]">
        <DrawerDialogHeader>
          <DrawerDialogTitle>{title}</DrawerDialogTitle>
          <DrawerDialogDescription>{description}</DrawerDialogDescription>
        </DrawerDialogHeader>
        <DrawerDialogFooter className="flex-row justify-end gap-2 pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
