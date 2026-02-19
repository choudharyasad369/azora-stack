# 🔍 DEBUGGING 400 ERROR ON /api/projects

## The Error

```
Failed to load resource: the server responded with a status of 400 (Bad Request)
URL: http://localhost:3000/api/projects
```

## What This Means

The frontend is trying to create a new project by calling `POST /api/projects`, but the server is rejecting the request with a 400 Bad Request error.

## Required Fields (from validation schema)

The API expects these fields:

```typescript
{
  title: string (5-100 chars),
  shortDescription: string (20-200 chars),
  description: string (min 100 chars),
  price: number (1-100000),
  techStack: string[] (at least 1 item),
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
  demoUrl: string (optional, must be valid URL),
  documentationUrl: string (optional, must be valid URL),
  fileUrl: string (from upload),
  fileSize: number (from upload),
  thumbnailUrl: string (from upload)
}
```

## Common Causes

1. **Missing required fields** - One or more required fields is empty
2. **Validation errors**:
   - Title too short (< 5 chars) or too long (> 100 chars)
   - Short description too short (< 20 chars) or too long (> 200 chars)
   - Description too short (< 100 chars)
   - Price not a number or out of range (1-100000)
   - Tech stack empty array
   - Invalid difficulty value
   - Invalid URL format for demoUrl or documentationUrl

## How to Debug

### Step 1: Open Browser DevTools
1. Press F12
2. Go to Network tab
3. Try to submit the form
4. Click on the failed `/api/projects` request
5. Look at the "Payload" or "Request" tab to see what data was sent
6. Look at the "Response" tab to see the exact error message

### Step 2: Check Server Logs
The server logs will show the exact validation error. Look for lines like:
```
VALIDATION_ERROR: Invalid input
```

### Step 3: Common Fixes

**If title is too short:**
- Make sure title has at least 5 characters

**If short description is too short:**
- Make sure short description has at least 20 characters

**If description is too short:**
- Make sure description has at least 100 characters

**If price is invalid:**
- Make sure price is a number between 1 and 100000
- Check that price field is not empty

**If tech stack is empty:**
- Make sure at least one technology is selected

**If URLs are invalid:**
- Demo URL and Documentation URL must be valid URLs (start with http:// or https://)
- Or leave them empty

## Quick Test

Try filling the form with these minimum values:
- **Title**: "Test Project" (11 chars) ✅
- **Short Description**: "This is a test project for debugging purposes" (46 chars) ✅
- **Description**: "This is a detailed description of the test project. It needs to be at least 100 characters long to pass validation. So I'm adding more text here to meet the requirement." (175 chars) ✅
- **Price**: 1000 ✅
- **Tech Stack**: Select at least one (e.g., "React") ✅
- **Difficulty**: INTERMEDIATE ✅
- **Demo URL**: Leave empty or use "https://example.com" ✅
- **Documentation URL**: Leave empty or use "https://example.com" ✅

## Next Steps

1. Check the browser console for the exact error message
2. Check the Network tab to see what data is being sent
3. Make sure all required fields meet the minimum requirements
4. Try submitting again

If you still get the error, share the exact error message from the Response tab in DevTools.
