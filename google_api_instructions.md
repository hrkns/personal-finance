To retrieve the necessary credentials for accessing the Google Sheets API using a Node.js application, you'll need to create a project in the Google Cloud Platform, enable the Google Sheets API, and create a service account with appropriate permissions. Here's a step-by-step guide:

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in with your Google account if you haven't already.
3. Click on "Select a project" at the top of the page, then click on "NEW PROJECT" to create a new project.
4. Enter a project name and click "CREATE".

### Step 2: Enable the Google Sheets API
1. In your new project, navigate to the navigation menu (three horizontal lines in the top left corner), and select "APIs & Services" > "Dashboard".
2. Click on "+ ENABLE APIS AND SERVICES".
3. Search for "Google Sheets API" and select it.
4. Click "ENABLE" to enable the API for your project.

### Step 3: Create a Service Account and Download Credentials
1. In the Google Cloud Console, go to "IAM & Admin" > "Service Accounts".
2. Click "CREATE SERVICE ACCOUNT".
3. Enter a service account name and description, then click "CREATE".
4. On the "Grant this service account access to project" page, you don't need to select any roles for this tutorial. Just click "CONTINUE".
5. Click "DONE" to finish creating the service account.
6. Click on the newly created service account in the list.
7. Go to the "KEYS" tab and click "ADD KEY" > "Create new key".
8. Choose "JSON" as the key type and click "CREATE". A JSON file with your credentials will be downloaded to your computer.

### Step 4: Set Up Your Environment Variables
1. Place the downloaded JSON file in your Node.js project directory.
2. Open the JSON file and find the `client_email` and `private_key` values.
3. Create a `.env` file in your project directory and add the following lines, replacing `<YOUR_CLIENT_EMAIL>` and `<YOUR_PRIVATE_KEY>` with the values from your JSON file:

   ```env
   GOOGLE_SHEETS_CLIENT_EMAIL=<YOUR_CLIENT_EMAIL>
   GOOGLE_SHEETS_PRIVATE_KEY=<YOUR_PRIVATE_KEY>
   ```

   Make sure to replace all newline characters in your private key with `\n`.

### Step 5: Share Your Google Sheet
1. Open the Google Sheet you want to access with your Node.js application.
2. Click the "Share" button in the top right corner.
3. Enter the `client_email` from your service account JSON file and click "Send". This gives your service account permission to access the sheet.

Now your Node.js application should be able to use the credentials to access the Google Sheets API and interact with your Google Sheet. Remember to keep your credentials secure and never share them publicly.