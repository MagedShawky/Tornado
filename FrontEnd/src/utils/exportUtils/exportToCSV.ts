
/**
 * Legacy CSV export utilities (kept for backward compatibility)
 */

/**
 * Format a value for CSV to handle strings, nulls and quotes
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
