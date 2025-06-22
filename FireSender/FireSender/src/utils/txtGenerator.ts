export function downloadTxtFile(data: string[], filename: string) {
    // Convert array to string
    const text = data.join('\n');
    
    // Create a Blob
    const blob = new Blob([text], { type: 'text/plain' });
    
    // Create a link element
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    
    // Set the filename
    link.download = filename;
    
    // Append the link to the body
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}
