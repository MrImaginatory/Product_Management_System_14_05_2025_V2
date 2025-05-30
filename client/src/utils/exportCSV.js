import Papa from 'papaparse';

/**
 * Export JSON data to CSV and trigger download in browser.
 * @param {Array<Object>} data - Array of objects to export.
 * @param {string} fileName - CSV file name.
 */
export function exportToCSV(data, fileName = 'export.csv') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const csv = Papa.unparse(data);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
