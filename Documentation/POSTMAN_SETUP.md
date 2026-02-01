# Postman Collection Setup Guide

This guide will help you set up and use the VU Proctors Diary API Postman collection.

## 📦 Files Included

- `VU_Proctors_Diary_API.postman_collection.json` - Complete API collection with all endpoints

## 🚀 Quick Start

### Step 1: Import Collection into Postman

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `VU_Proctors_Diary_API.postman_collection.json`
5. Click **Import**

### Step 2: Create Environment Variables

1. In Postman, click **Environments** (left sidebar)
2. Click **+** to create a new environment
3. Name it: `VU Proctors Diary - Local`
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | `http://localhost:5000/api` | `http://localhost:5000/api` |
| `token` | (leave empty) | (will be auto-set after login) |
| `userId` | (leave empty) | (will be auto-set after login) |
| `userRole` | (leave empty) | (will be auto-set after login) |

5. Click **Save**
6. Select this environment from the dropdown (top right)

### Step 3: Start Your Backend Server

Make sure your backend server is running on `http://localhost:5000`

```bash
cd Code/Backend
npm start
```

### Step 4: Get Authentication Token

1. Go to **Authentication** folder
2. Use **Register Admin** or **Register User** to create an account
3. Use **Login** endpoint to authenticate
4. The token will be automatically saved to the `token` environment variable

## 📋 Collection Structure

The collection is organized into the following folders:

### 🔐 Authentication
- **Register User** - Register invigilator/superintendent
- **Register Admin** - Register admin user
- **Login** - Authenticate and get token (auto-saves token)

### 👨‍💼 Admin
- **Get Pending Users** - View users awaiting approval
- **Approve User** - Approve a pending user
- **Reject User** - Reject and delete a pending user
- **Get Available Users** - Find users available for duty assignment
- **Get All Users** - View all users

### 📅 Duties
**Admin Endpoints:**
- Assign Duty
- Get All Duties (with filters)
- Get Attendance Report
- Approve Payments
- Auto Mark Absentees
- Verify Attendance

**User Endpoints:**
- Get My Duties
- Mark Attendance
- Upload Report
- Get Duty Stats

### 👤 Profile
- Get Profile
- Update Profile (supports file upload for avatar)

### 🏖️ Leaves
- Request Leave
- Get Leave Requests
- Admin - Review Leave Request

### 💰 Withdrawals
- Get Payment Summary
- Request Withdrawal
- Get My Withdrawals
- Admin - Get All Withdrawals
- Admin - Process Withdrawal

### 📊 Attendance
- Admin - Generate Attendance Report
- Admin - Get All Attendance Reports
- Admin - Get Attendance Report by ID
- Admin - Export Attendance Report (CSV)
- Admin - Get Attendance Dashboard

### 🔔 Notifications
- Get Notifications
- Mark Notification as Read
- Mark All Notifications as Read
- Delete Notification
- Clear All Notifications

## 🔑 Authentication

Most endpoints require authentication. The collection automatically:
- Saves the token after login to the `token` environment variable
- Adds `Authorization: Bearer {{token}}` header to authenticated requests

## 📝 Common Request Patterns

### Date Format
All dates should be in `YYYY-MM-DD` format (e.g., `2024-12-25`)

### Time Slots
Available time slots:
- `Morning (09:00-12:00)`
- `Afternoon (13:00-16:00)`
- `Evening (17:00-20:00)`
- `Full Day (09:00-17:00)`

### Payment Types
- `full` - 2000 PKR
- `half` - 1200 PKR
- `afternoon` - 1000 PKR
- `other` - 800 PKR

### Payment Methods (Withdrawals)
- `bank_transfer`
- `easypaisa`
- `jazzcash`
- `cash`

### User Roles
- `admin`
- `invigilator`
- `superintendent`

## 🎯 Testing Workflow

### 1. Create Admin User
```
POST /api/auth/register
{
  "name": "Admin User",
  "cnic": "12345-1234567-2",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

### 2. Login as Admin
```
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
Token is automatically saved!

### 3. Register a User
```
POST /api/auth/register
{
  "name": "John Doe",
  "cnic": "12345-1234567-1",
  "email": "john@example.com",
  "password": "password123",
  "role": "invigilator"
}
```

### 4. Approve User
```
GET /api/admin/pending  (to get user ID)
PATCH /api/admin/approve/:id
```

### 5. Assign Duty
```
POST /api/duties/assign/:userId
{
  "examName": "Final Exam 2024",
  "date": "2024-12-25",
  "timeSlot": "Morning (09:00-12:00)",
  "center": "Center A",
  "paymentType": "full"
}
```

### 6. Mark Attendance (as user)
```
PUT /api/duties/attendance/:dutyId
```

## 🔧 Troubleshooting

### Token Not Working
- Make sure you've selected the correct environment
- Re-run the Login endpoint to refresh the token
- Check that the token variable is set in your environment

### 401 Unauthorized
- Verify your token is valid
- Check that Authorization header is set correctly
- Ensure you're logged in with the correct role

### 403 Forbidden
- Verify you have the correct role (admin vs user)
- Check that the user is approved (for non-admin users)

### 404 Not Found
- Verify the endpoint URL is correct
- Check that IDs in the URL are valid MongoDB ObjectIds
- Ensure the resource exists in the database

### File Upload Issues
- Use `form-data` body type for file uploads
- Ensure file size is within limits
- Check file field name matches expected name (`file` or `avatar`)

## 📚 Additional Resources

- Check `Code/Readme.md` for project setup instructions
- Review backend controllers for detailed request/response formats
- Check models for data structure details

## 💡 Tips

1. **Use Environment Variables**: Replace hardcoded IDs with variables like `{{userId}}` or `{{dutyId}}`
2. **Save Responses**: Use Postman's "Save Response" feature to keep example responses
3. **Create Examples**: Add example responses to requests for documentation
4. **Use Pre-request Scripts**: Automate token refresh or data setup
5. **Organize with Folders**: Keep related requests grouped together

## 🆘 Support

If you encounter issues:
1. Check server logs for error messages
2. Verify MongoDB connection
3. Ensure all required environment variables are set
4. Review API documentation in code comments

---

**Happy Testing! 🚀**








