// components/admin/categories/ConfirmDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  isWarning?: boolean;
  isForceDelete?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onForceDelete?: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  isWarning = false,
  isForceDelete = false,
  onConfirm,
  onCancel,
  onForceDelete
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isWarning && (
              <div className={cn(
                "p-2 rounded-full",
                isForceDelete ? "bg-red-100 dark:bg-red-900/30" : "bg-yellow-100 dark:bg-yellow-900/30"
              )}>
                {isForceDelete ? (
                  <Trash2 className={cn(
                    "h-5 w-5",
                    isForceDelete ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"
                  )} />
                ) : (
                  <AlertTriangle className={cn(
                    "h-5 w-5",
                    isForceDelete ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"
                  )} />
                )}
              </div>
            )}
            <DialogTitle className={cn(
              isWarning && (isForceDelete ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400")
            )}>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="mt-3">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {isForceDelete && onForceDelete ? (
            <>
              <Button 
                variant="destructive" 
                onClick={onForceDelete}
                className="order-first sm:order-none"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Force Delete All
              </Button>
           {/*    <Button 
                variant="default" 
                onClick={onConfirm}
              >
                Okay, I'll handle it myself
              </Button> */}
            </>
          ) : (
            <Button 
              variant={isWarning ? "destructive" : "default"} 
              onClick={onConfirm}
            >
              {isWarning ? "Delete Anyway" : "Confirm"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}