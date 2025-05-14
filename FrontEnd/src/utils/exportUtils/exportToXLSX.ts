
/**
 * Utility functions for exporting data to Excel (XLSX)
 */
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

/**
 * Export data to Excel file
 */
export async function exportToXLSX(data: any[], filename: string) {
  try {
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    
    console.log('Excel export completed successfully');
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

/**
 * Convert booking data to Excel (XLSX) format with multiple sheets and trigger download
 */
export async function exportBookingsToXLSX(
  bookings: any[], 
  tripId: string,
  filename: string = 'bookings.xlsx'
) {
  if (!bookings || bookings.length === 0) {
    console.error('No bookings data to export');
    return;
  }

  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Add the main bookings sheet
    addBookingsSheet(workbook, bookings);
    
    // Add additional sheets with trip data
    await addTripDataSheets(workbook, tripId);
    
    // Write the workbook and trigger download
    XLSX.writeFile(workbook, filename);
    console.log('Excel export completed successfully with multiple sheets');
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
}

/**
 * Add the main bookings sheet to the workbook
 */
function addBookingsSheet(workbook: XLSX.WorkBook, bookings: any[]) {
  // Define the fields for the main bookings sheet
  const bookingFields = [
    'id', 
    'status', 
    'bed_number', 
    'cabin.cabin_number', 
    'price', 
    'group_name',
    'passenger_gender',
    'booked_at',
    'cancel_date',
    'trip.destination',
    'trip.start_date',
    'trip.end_date',
    'trip.boat.name'
  ];
  
  // Create data rows for the main bookings sheet
  const bookingData = bookings.map(booking => {
    const row: Record<string, any> = {};
    
    bookingFields.forEach(field => {
      if (field.includes('.')) {
        const parts = field.split('.');
        let value = booking;
        
        for (const part of parts) {
          if (value && value[part] !== undefined) {
            value = value[part];
          } else {
            value = '';
            break;
          }
        }
        
        // Use the last part of the field path as the column name
        const columnName = parts[parts.length - 1];
        row[columnName] = value instanceof Date ? value.toLocaleDateString() : value;
      } else {
        row[field] = booking[field] instanceof Date ? booking[field].toLocaleDateString() : booking[field];
      }
    });
    
    return row;
  });
  
  // Add the main bookings sheet
  const bookingSheet = XLSX.utils.json_to_sheet(bookingData);
  XLSX.utils.book_append_sheet(workbook, bookingSheet, "Bookings");
}

/**
 * Add sheets with additional trip data
 */
async function addTripDataSheets(workbook: XLSX.WorkBook, tripId: string) {
  // Define the function names explicitly with the correct type
  type FunctionName = "get_client_details" | "get_client_info" | "get_travel_info" | "get_tourism_services" | "get_rentals";
  
  // Add client details sheet
  await addDataSheet(
    workbook, 
    "Client Details", 
    "get_client_details" as FunctionName, 
    tripId
  );
  
  // Add client info sheet
  await addDataSheet(
    workbook, 
    "Client Info", 
    "get_client_info" as FunctionName, 
    tripId
  );
  
  // Add travel info sheet
  await addDataSheet(
    workbook, 
    "Travel Info", 
    "get_travel_info" as FunctionName, 
    tripId
  );
  
  // Add tourism services sheet
  await addDataSheet(
    workbook, 
    "Tourism Services", 
    "get_tourism_services" as FunctionName, 
    tripId
  );
  
  // Add rentals sheet
  await addDataSheet(
    workbook, 
    "Equipment Rentals", 
    "get_rentals" as FunctionName, 
    tripId
  );
}

/**
 * Add a sheet with data from a specific database function
 */
async function addDataSheet(
  workbook: XLSX.WorkBook, 
  sheetName: string, 
  functionName: "get_client_details" | "get_client_info" | "get_travel_info" | "get_tourism_services" | "get_rentals", 
  tripId: string
) {
  try {
    const { data, error } = await supabase
      .rpc(functionName, { trip_id_param: tripId })
      .select("*");
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      const sheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    }
  } catch (error) {
    console.error(`Error fetching ${sheetName} for export:`, error);
  }
}
