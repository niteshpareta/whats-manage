/**
 * Utilities for backing up and restoring localStorage data
 * - Local file download/upload
 * - Google Drive integration
 */

// Google API Client ID - Replace with your own when setting up Google Drive API
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
const GOOGLE_APP_ID = 'whatsmanage';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';

// File names for backups
const BACKUP_FILENAME = 'whatsmanage_backup.json';
const BACKUP_MIME_TYPE = 'application/json';

/**
 * Initialize Google API client
 * @returns {Promise} - Resolves when client is loaded and initialized
 */
export const initGoogleDriveClient = () => {
  return new Promise((resolve, reject) => {
    // Load the Google API client library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(() => {
          resolve();
        }).catch(error => {
          reject(error);
        });
      });
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google API client'));
    };
    document.body.appendChild(script);
  });
};

/**
 * Check if user is signed into Google
 * @returns {boolean} - True if user is signed in
 */
export const isSignedInToGoogle = () => {
  if (!window.gapi || !window.gapi.auth2) {
    return false;
  }
  return window.gapi.auth2.getAuthInstance().isSignedIn.get();
};

/**
 * Sign in to Google
 * @returns {Promise} - Resolves when sign-in is complete
 */
export const signInToGoogle = () => {
  if (!window.gapi || !window.gapi.auth2) {
    return Promise.reject(new Error('Google API client not loaded'));
  }
  return window.gapi.auth2.getAuthInstance().signIn();
};

/**
 * Sign out from Google
 * @returns {Promise} - Resolves when sign-out is complete
 */
export const signOutFromGoogle = () => {
  if (!window.gapi || !window.gapi.auth2) {
    return Promise.reject(new Error('Google API client not loaded'));
  }
  return window.gapi.auth2.getAuthInstance().signOut();
};

/**
 * Find an existing backup file in Google Drive
 * @returns {Promise<string|null>} - Resolves with file ID if found, null otherwise
 */
export const findExistingBackupFile = async () => {
  try {
    const response = await window.gapi.client.drive.files.list({
      spaces: 'appDataFolder,drive',
      fields: 'files(id, name, modifiedTime)',
      q: `name = '${BACKUP_FILENAME}' and trashed = false`
    });

    const files = response.result.files;
    if (files && files.length > 0) {
      // Sort by modified time (newest first)
      files.sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
      return files[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error finding backup file:', error);
    throw error;
  }
};

/**
 * Upload backup to Google Drive
 * @param {Object} data - Data to backup
 * @param {string} [fileId] - Optional existing file ID to update
 * @returns {Promise<Object>} - Resolves with the uploaded file metadata
 */
export const uploadBackupToGoogleDrive = async (data, fileId = null) => {
  try {
    // Convert data to JSON string
    const content = JSON.stringify(data);
    const blob = new Blob([content], { type: BACKUP_MIME_TYPE });

    // Create form data
    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: BACKUP_MIME_TYPE
    };

    // If no fileId is provided, we're creating a new file
    if (!fileId) {
      metadata.parents = ['appDataFolder']; // Store in the app data folder
    }

    // Initialize a multipart request
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    let method, path;
    if (fileId) {
      // Update existing file
      method = 'PATCH';
      path = `/upload/drive/v3/files/${fileId}`;
    } else {
      // Create new file
      method = 'POST';
      path = '/upload/drive/v3/files';
    }

    // Execute the request
    return window.gapi.client.request({
      path,
      method,
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: form
    });
  } catch (error) {
    console.error('Error uploading backup to Google Drive:', error);
    throw error;
  }
};

/**
 * Download backup from Google Drive
 * @param {string} fileId - ID of the file to download
 * @returns {Promise<Object>} - Resolves with the downloaded data
 */
export const downloadBackupFromGoogleDrive = async (fileId) => {
  try {
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    return JSON.parse(response.body);
  } catch (error) {
    console.error('Error downloading backup from Google Drive:', error);
    throw error;
  }
};

/**
 * Backup all localStorage data to Google Drive
 * @returns {Promise<Object>} - Resolves with the uploaded file metadata
 */
export const backupToGoogleDrive = async () => {
  try {
    // Collect all localStorage data
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }

    // Add metadata
    data._backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      appName: 'WhatsManage'
    };

    // Check if a backup file already exists
    const existingFileId = await findExistingBackupFile();
    
    // Upload the backup
    const result = await uploadBackupToGoogleDrive(data, existingFileId);
    
    return result;
  } catch (error) {
    console.error('Error backing up to Google Drive:', error);
    throw error;
  }
};

/**
 * Restore all localStorage data from Google Drive
 * @returns {Promise<Object>} - Resolves with the restored data
 */
export const restoreFromGoogleDrive = async () => {
  try {
    // Find the most recent backup file
    const fileId = await findExistingBackupFile();
    if (!fileId) {
      throw new Error('No backup found in Google Drive');
    }

    // Download the backup
    const data = await downloadBackupFromGoogleDrive(fileId);

    // Restore data to localStorage
    Object.keys(data).forEach(key => {
      // Skip metadata
      if (key !== '_backup') {
        localStorage.setItem(key, data[key]);
      }
    });

    return data;
  } catch (error) {
    console.error('Error restoring from Google Drive:', error);
    throw error;
  }
};

/**
 * Download all localStorage data as a JSON file
 */
export const downloadLocalBackup = () => {
  try {
    // Collect all localStorage data
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }

    // Add metadata
    data._backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      appName: 'WhatsManage'
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsmanage_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    return true;
  } catch (error) {
    console.error('Error creating local backup:', error);
    throw error;
  }
};

/**
 * Import localStorage data from a JSON file
 * @param {File} file - The file to import
 * @returns {Promise<Object>} - Resolves with the imported data
 */
export const importLocalBackup = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Validate that this is a WhatsManage backup
        if (!data._backup || data._backup.appName !== 'WhatsManage') {
          reject(new Error('Invalid backup file. Not a WhatsManage backup.'));
          return;
        }
        
        // Restore data to localStorage
        Object.keys(data).forEach(key => {
          // Skip metadata
          if (key !== '_backup') {
            localStorage.setItem(key, data[key]);
          }
        });
        
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid backup file. Could not parse JSON.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file.'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Get all available backup options
 * @returns {Array<Object>} - Array of backup options
 */
export const getBackupOptions = () => {
  const options = [
    {
      id: 'local',
      name: 'Local Backup',
      description: 'Download a backup file to your device',
      icon: 'download',
      action: 'download',
      handler: downloadLocalBackup
    },
    {
      id: 'local-import',
      name: 'Import Backup',
      description: 'Import a backup file from your device',
      icon: 'upload',
      action: 'import',
      handler: importLocalBackup
    }
  ];
  
  // Add Google Drive options if available
  if (typeof window !== 'undefined' && window.gapi) {
    options.push(
      {
        id: 'google-drive',
        name: 'Google Drive Backup',
        description: 'Save a backup to your Google Drive',
        icon: 'google-drive',
        action: 'backup',
        handler: backupToGoogleDrive
      },
      {
        id: 'google-drive-restore',
        name: 'Restore from Google Drive',
        description: 'Restore data from Google Drive backup',
        icon: 'google-drive-restore',
        action: 'restore',
        handler: restoreFromGoogleDrive
      }
    );
  }
  
  return options;
}; 