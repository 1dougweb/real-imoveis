import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Trash2, AlertTriangle, HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type IconType = "delete" | "warning" | "info" | "question";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  variant?: "delete" | "warning" | "info" | "default";
  iconType?: IconType;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  variant = "default",
  iconType = "question",
  isLoading = false,
  children,
}: ConfirmationDialogProps) {
  const [isPending, startTransition] = React.useTransition();
  
  const loading = isLoading || isPending;

  // Define colors based on variant
  const variantStyles = {
    delete: {
      icon: <Trash2 className="h-6 w-6 text-red-500" />,
      buttonClass: "bg-red-500 hover:bg-red-600 text-white",
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
      buttonClass: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    info: {
      icon: <Info className="h-6 w-6 text-blue-500" />,
      buttonClass: "bg-blue-500 hover:bg-blue-600 text-white",
    },
    default: {
      icon: <HelpCircle className="h-6 w-6 text-gray-500" />,
      buttonClass: "bg-primary hover:bg-primary/90",
    },
  };

  // Icons based on iconType
  const iconMap: Record<IconType, React.ReactNode> = {
    delete: <Trash2 className="h-6 w-6 text-red-500" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    info: <Info className="h-6 w-6 text-blue-500" />,
    question: <HelpCircle className="h-6 w-6 text-gray-500" />,
  };

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
      onOpenChange(false);
    });
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {iconType ? iconMap[iconType] : variantStyles[variant].icon}
          </div>
          <div className="flex-1">
            <AlertDialogHeader>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            {children && <div className="py-4">{children}</div>}
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel onClick={handleCancel}>
                {cancelText}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                className={cn(variantStyles[variant].buttonClass)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">&#9696;</span>
                    Processando...
                  </>
                ) : (
                  confirmText
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
} 