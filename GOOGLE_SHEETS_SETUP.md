
# Google Sheets Integration Setup

## Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "MBA Leads" or similar
4. Add headers in row 1: `Name`, `Email`, `Phone`, `Timestamp`, `Source`

## Step 2: Create Google Apps Script
1. In your Google Sheet, go to `Extensions` > `Apps Script`
2. Replace the default code with the following:

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Parse the request data
    const data = JSON.parse(e.postData.contents);
    
    // Add data to the sheet
    sheet.appendRow([
      data.name || '',
      data.email || '',
      data.phone || '',
      data.timestamp || new Date().toISOString(),
      data.source || 'MBA Landing Page'
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 3: Deploy the Script
1. Click `Deploy` > `New deployment`
2. Choose type: `Web app`
3. Set execute as: `Me`
4. Set access: `Anyone`
5. Click `Deploy`
6. Copy the web app URL

## Step 4: Update the Form Component
1. Replace `YOUR_GOOGLE_SCRIPT_URL_HERE` in the ContactForm component with your web app URL
2. The URL should look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`

## Step 5: Test the Integration
1. Fill out the form on your website
2. Check your Google Sheet to see if the data appears
3. If there are issues, check the Apps Script logs for errors

## Security Notes
- The script is set to "Anyone" access to work with your public website
- Consider adding validation or rate limiting if needed
- The data is sent via HTTPS and stored in your private Google Sheet

## Troubleshooting
- If you get CORS errors, the script deployment might need to be updated
- Make sure the Google Sheet has the correct headers
- Check Apps Script execution logs for detailed error messages
