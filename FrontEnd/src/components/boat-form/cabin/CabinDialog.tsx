
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { CabinForm } from "./dialog/CabinForm";

interface CabinDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  boatId: string;
  title: string;
}

export function CabinDialog({
  isOpen,
  onOpenChange,
  boatId,
  title,
}: CabinDialogProps) {
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
    >
      <DialogContent 
        className="sm:max-w-[500px]"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Configure the cabin details below.
          </DialogDescription>
        </DialogHeader>
        <CabinForm 
          boatId={boatId}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
