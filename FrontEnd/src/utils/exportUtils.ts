
/**
 * Utility functions for exporting data to Excel (XLSX)
 */
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

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
    
    // Fetch all related data directly from Supabase for the trip tabs
    try {
      // Fetch client details
      const { data: clientDetails, error: clientDetailsError } = await supabase
        .rpc("get_client_details", { trip_id_param: tripId })
        .select("*");
        
      if (clientDetailsError) throw clientDetailsError;
      
      if (clientDetails && clientDetails.length > 0) {
        const clientSheet = XLSX.utils.json_to_sheet(clientDetails);
        XLSX.utils.book_append_sheet(workbook, clientSheet, "Client Details");
      }
    } catch (error) {
      console.error("Error fetching client details for export:", error);
    }
    
    try {
      // Fetch client info
      const { data: clientInfo, error: clientInfoError } = await supabase
        .rpc("get_client_info", { trip_id_param: tripId })
        .select("*");
        
      if (clientInfoError) throw clientInfoError;
      
      if (clientInfo && clientInfo.length > 0) {
        const clientInfoSheet = XLSX.utils.json_to_sheet(clientInfo);
        XLSX.utils.book_append_sheet(workbook, clientInfoSheet, "Client Info");
      }
    } catch (error) {
      console.error("Error fetching client info for export:", error);
    }
    
    try {
      // Fetch travel info
      const { data: travelInfo, error: travelInfoError } = await supabase
        .rpc("get_travel_info", { trip_id_param: tripId })
        .select("*");
        
      if (travelInfoError) throw travelInfoError;
      
      if (travelInfo && travelInfo.length > 0) {
        const travelSheet = XLSX.utils.json_to_sheet(travelInfo);
        XLSX.utils.book_append_sheet(workbook, travelSheet, "Travel Info");
      }
    } catch (error) {
      console.error("Error fetching travel info for export:", error);
    }
    
    try {
      // Fetch tourism services
      const { data: tourismServices, error: tourismServicesError } = await supabase
        .rpc("get_tourism_services", { trip_id_param: tripId })
        .select("*");
        
      if (tourismServicesError) throw tourismServicesError;
      
      if (tourismServices && tourismServices.length > 0) {
        const tourismServicesSheet = XLSX.utils.json_to_sheet(tourismServices);
        XLSX.utils.book_append_sheet(workbook, tourismServicesSheet, "Tourism Services");
      }
    } catch (error) {
      console.error("Error fetching tourism services for export:", error);
    }
    
    try {
      // Fetch rentals
      const { data: rentals, error: rentalsError } = await supabase
        .rpc("get_rentals", { trip_id_param: tripId })
        .select("*");
        
      if (rentalsError) throw rentalsError;
      
      if (rentals && rentals.length > 0) {
        const rentalsSheet = XLSX.utils.json_to_sheet(rentals);
        XLSX.utils.book_append_sheet(workbook, rentalsSheet, "Equipment Rentals");
      }
    } catch (error) {
      console.error("Error fetching rentals for export:", error);
    }
    
    // Write the workbook and trigger download
    XLSX.writeFile(workbook, filename);
    console.log('Excel export completed successfully with multiple sheets');
  } catch (error) {
    console.error('Error exporting Excel:', error);
  }
}

/**
 * Format a value for CSV to handle strings, nulls and quotes
 * (Keeping this method for backward compatibility)
 */
function formatCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    // Escape quotes and wrap in quotes
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  if (value instanceof Date) {
    return `"${value.toLocaleDateString()}"`;
  }
  
  return String(value);
}

/**
 * Legacy CSV export function (kept for backward compatibility)
 */
export function exportBookingsToCSV(bookings: any[], filename: string = 'bookings.csv') {
  if (!bookings || bookings.length === 0) {
    console.error('No bookings data to export');
    return;
  }

  try {
    // Define which fields to include in the CSV and their order
    const headerFields = [
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
    
    // Create header row
    const headerRow = headerFields.map(field => {
      // Format nested field names to be more readable
      return field.includes('.')
        ? field.split('.').pop()
        : field;
    }).join(',');
    
    // Create data rows
    const dataRows = bookings.map(booking => {
      return headerFields.map(field => {
        // Handle nested properties using field path
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
          
          return formatCsvValue(value);
        }
        
        // Handle regular properties
        return formatCsvValue(booking[field]);
      }).join(',');
    }).join('\n');
    
    // Combine headers and data
    const csvContent = `${headerRow}\n${dataRows}`;
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('CSV export completed successfully');
  } catch (error) {
    console.error('Error exporting CSV:', error);
  }
}
