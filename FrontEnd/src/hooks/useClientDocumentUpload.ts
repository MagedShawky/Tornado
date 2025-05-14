
import { toast } from "sonner";
import { useState } from "react";

export const useClientDocumentUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocument = async (file: File, clientName: string, tripId: string) => {
    try {
      setIsUploading(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${tripId}_${clientName}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Use FileReader to convert file to base64
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          try {
            const base64String = reader.result as string;
            
            // Get existing files from localStorage or initialize empty object
            const storedFiles = JSON.parse(localStorage.getItem('clientDocuments') || '{}');
            
            // Store the new file
            storedFiles[fileName] = {
              name: file.name,
              type: file.type,
              content: base64String,
              clientName,
              tripId,
              uploadedAt: new Date().toISOString()
            };
            
            // Save back to localStorage
            localStorage.setItem('clientDocuments', JSON.stringify(storedFiles));
            
            // Create a blob URL for the file to make it accessible in the app
            const blob = new Blob([base64ToArrayBuffer(base64String)], { type: file.type });
            const url = URL.createObjectURL(blob);
            
            toast.success("Document uploaded successfully");
            resolve(url);
          } catch (error) {
            console.error('Error processing file:', error);
            toast.error("Failed to process document");
            reject(error);
          } finally {
            setIsUploading(false);
          }
        };
        
        reader.onerror = () => {
          console.error('Error reading file');
          setIsUploading(false);
          toast.error('Error reading file');
          reject(new Error('Error reading file'));
        };
        
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      setIsUploading(false);
      toast.error('Failed to upload document');
      return null;
    }
  };

  // Helper function to convert base64 to ArrayBuffer (to avoid using Buffer)
  const base64ToArrayBuffer = (base64: string) => {
    // Extract base64 data part if it's a data URL
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    
    try {
      // Convert base64 to binary string
      const binary = atob(base64Data);
      // Create byte array
      const bytes = new Uint8Array(binary.length);
      // Assign binary data to byte array
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      console.error('Error converting base64 to array buffer:', error);
      return new Uint8Array();
    }
  };

  const getUploadedDocument = (fileName: string) => {
    try {
      const storedFiles = JSON.parse(localStorage.getItem('clientDocuments') || '{}');
      const fileData = storedFiles[fileName] || null;
      
      if (fileData && fileData.content) {
        // Create a blob URL for the file to make it accessible in the app
        const blob = new Blob(
          [base64ToArrayBuffer(fileData.content)], 
          { type: fileData.type }
        );
        fileData.url = URL.createObjectURL(blob);
      }
      
      return fileData;
    } catch (error) {
      console.error('Error retrieving document:', error);
      return null;
    }
  };

  const getAllDocumentsByTrip = (tripId: string) => {
    try {
      const storedFiles = JSON.parse(localStorage.getItem('clientDocuments') || '{}');
      return Object.entries(storedFiles)
        .filter(([_, file]: [string, any]) => file.tripId === tripId)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>);
    } catch (error) {
      console.error('Error retrieving documents by trip:', error);
      return {};
    }
  };

  const deleteDocument = (fileName: string) => {
    try {
      const storedFiles = JSON.parse(localStorage.getItem('clientDocuments') || '{}');
      if (storedFiles[fileName]) {
        delete storedFiles[fileName];
        localStorage.setItem('clientDocuments', JSON.stringify(storedFiles));
        toast.success('Document deleted successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
      return false;
    }
  };

  return { 
    uploadDocument, 
    getUploadedDocument, 
    getAllDocumentsByTrip,
    deleteDocument,
    isUploading 
  };
};
