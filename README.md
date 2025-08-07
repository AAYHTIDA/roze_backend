
# Roze Solar Solutions Backend

Node.js backend server for handling file uploads and serving files for the Roze Solar Solutions website.

## Features

- File upload handling for certificates and datasheets
- File serving with proper content types
- File download endpoints
- Category-based file organization
- File deletion capabilities
- CORS enabled for frontend integration

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 3. cPanel Deployment

To deploy this backend to your cPanel server:

1. **Upload Files**: Upload all backend files to a folder called `backend` in your cPanel file manager
2. **Create Node.js App**: In cPanel, create a new Node.js application
3. **Set Entry Point**: Set `server.js` as the entry point
4. **Install Dependencies**: Run `npm install` in the app directory
5. **Start Application**: Start the Node.js application

### 4. Environment Configuration

Create a `.env` file in the backend directory:
```
PORT=3001
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800
```

### 5. Frontend Integration

Update your frontend API calls to point to your backend server:

```javascript
// Replace localhost with your actual domain
const API_BASE_URL = 'https://yourdomain.com/backend';

// Upload file
const formData = new FormData();
formData.append('file', file);
formData.append('category', 'certificates');
formData.append('name', fileName);

fetch(`${API_BASE_URL}/api/upload/certificate`, {
  method: 'POST',
  body: formData
});
```

## API Endpoints

### Upload Endpoints
- `POST /api/upload/certificate` - Upload certificate files
- `POST /api/upload/file` - Upload general files

### File Serving
- `GET /api/files/:category/:filename` - Serve file (inline)
- `GET /api/download/:category/:filename` - Download file (attachment)

### File Management
- `GET /api/files/:category` - List files in category
- `DELETE /api/files/:category/:filename` - Delete file

### Health Check
- `GET /health` - Server health status

## File Categories

The system supports these categories:
- `certificates`
- `datasheets`
- `manuals`
- `solar-panels`
- `inverters`
- `batteries`
- `microinverters`

## File Upload Limits

- Maximum file size: 50MB
- Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF

## cPanel Specific Notes

1. Make sure Node.js is enabled in your cPanel
2. Set the correct Node.js version (recommended: 18+)
3. Ensure the uploads directory has write permissions
4. Update your frontend to use the correct backend URL after deployment
