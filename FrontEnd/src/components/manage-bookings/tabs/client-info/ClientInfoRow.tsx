
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FileText, Upload, CheckCircle2, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientDocumentUpload } from "@/hooks/useClientDocumentUpload";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ClientInfoRowProps {
  client: {
    bedNumber: number;
    cabin: string;
    groupName: string;
    name: string;
    surname: string;
    foodRemarks: string;
    dateOfBirth: Date | undefined;
    visaNumber: string;
    visaIssueDate: Date | undefined;
    divingLicenseType: string;
    divingLevel: string;
    documentUploaded: boolean;
    [key: string]: string | number | boolean | Date | undefined;
  };
  index: number;
  onFieldChange: (index: number, field: string, value: string | Date | boolean) => void;
}

export function ClientInfoRow({ client, index, onFieldChange }: ClientInfoRowProps) {
  const { tripId } = useParams();
  const { uploadDocument, getAllDocumentsByTrip } = useClientDocumentUpload();
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (tripId && client.documentUploaded) {
      // Try to find the file for this client
      const clientDocuments = getAllDocumentsByTrip(tripId);
      const clientFullName = `${client.name}-${client.surname}`.replace(/\s+/g, '-');
      
      // Find the first document that matches this client
      const clientFile = Object.entries(clientDocuments).find(
        ([_, file]: [string, any]) => file.clientName.includes(clientFullName)
      );
      
      if (clientFile) {
        const [fileName, fileData] = clientFile;
        setUploadedFileName(fileData.name);
        
        // Create object URL from file data
        if (fileData.content) {
          try {
            // Use a utility function to convert base64 to blob
            const binary = atob(fileData.content.split(',')[1]);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              array[i] = binary.charCodeAt(i);
            }
            
            const blob = new Blob([array], { type: fileData.type });
            const url = URL.createObjectURL(blob);
            setFileUrl(url);
          } catch (error) {
            console.error("Error creating blob URL:", error);
          }
        }
      }
    }
  }, [tripId, client.documentUploaded, client.name, client.surname]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tripId) return;

    setIsUploading(true);
    try {
      // Make sure we have a valid name and surname
      if (!client.name || !client.surname) {
        toast.error("Please enter client name and surname before uploading documents");
        setIsUploading(false);
        return;
      }
      
      const clientFullName = `${client.name}-${client.surname}`.replace(/\s+/g, '-');
      
      const documentUrl = await uploadDocument(file, clientFullName, tripId);
      
      if (documentUrl) {
        onFieldChange(index, 'documentUploaded', true);
        setUploadedFileName(file.name);
        setFileUrl(documentUrl);
        toast.success(`Document "${file.name}" uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDocument = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
      <td className="p-2 border bg-gray-500 text-white text-center">{client.bedNumber}</td>
      <td className="p-2 border">{client.cabin}</td>
      <td className="p-2 border">{client.groupName}</td>
      <td className="p-2 border">
        <Input 
          value={client.name} 
          onChange={(e) => onFieldChange(index, 'name', e.target.value)}
          disabled={true} // Name can only be changed in Client Details
          className="bg-gray-100"
        />
      </td>
      <td className="p-2 border">
        <Input 
          value={client.surname} 
          onChange={(e) => onFieldChange(index, 'surname', e.target.value)}
          disabled={true} // Surname can only be changed in Client Details
          className="bg-gray-100"
        />
      </td>
      <td className="p-2 border">
        <Input 
          value={client.foodRemarks} 
          onChange={(e) => onFieldChange(index, 'foodRemarks', e.target.value)}
        />
      </td>
      <td className="p-2 border text-center">
        <Input
          type="file"
          className="hidden"
          id={`file-upload-${index}`}
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent mb-1"></div>
            <span className="text-xs">Uploading...</span>
          </div>
        ) : client.documentUploaded && uploadedFileName ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center text-green-500 mb-1">
              <FileText className="h-4 w-4 mr-1" />
              <span className="text-xs truncate max-w-[100px]">{uploadedFileName}</span>
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewDocument}
                title="View document"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                title="Replace document"
              >
                <X className="h-3 w-3 mr-1 text-red-500" />
                Replace
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
        )}
      </td>
      <td className="p-2 border">
        <DatePicker
          date={client.dateOfBirth}
          setDate={(date) => onFieldChange(index, 'dateOfBirth', date as Date)}
        />
      </td>
      <td className="p-2 border">
        <Input 
          value={client.visaNumber} 
          onChange={(e) => onFieldChange(index, 'visaNumber', e.target.value)}
        />
      </td>
      <td className="p-2 border">
        <DatePicker 
          date={client.visaIssueDate}
          setDate={(date) => onFieldChange(index, 'visaIssueDate', date as Date)}
        />
      </td>
      <td className="p-2 border">
        <Input 
          value={client.divingLicenseType} 
          onChange={(e) => onFieldChange(index, 'divingLicenseType', e.target.value)}
        />
      </td>
      <td className="p-2 border">
        <Input 
          value={client.divingLevel} 
          onChange={(e) => onFieldChange(index, 'divingLevel', e.target.value)}
        />
      </td>
    </tr>
  );
}
