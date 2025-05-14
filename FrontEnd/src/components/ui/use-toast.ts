
// Import from sonner
import { toast, type ToastT } from "sonner";

// Re-export toast with the correct types
export { toast, type ToastT as Toast };

// Re-export our legacy hook
export { useToast } from "@/hooks/use-toast";
