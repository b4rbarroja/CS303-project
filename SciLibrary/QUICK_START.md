# Quick Start Guide for Mobile App

## 🚀 Getting Started

### Step 1: Configure API Endpoint
Edit `src/config/config.js` and set your IP address:
```javascript
const ENV = {
  dev: {
    apiUrl: 'http://192.168.X.X:5000', // ← Change this to your laptop's IP
    timeout: 15000,
  },
  // ...
};
```

### Step 2: Start the Development Server
```bash
npm install  # if not already installed
npm start    # or: expo start
```

### Step 3: Run on Device/Emulator
```bash
# Android
npm run android    # or: expo start --android

# iOS (macOS only)
npm run ios        # or: expo start --ios

# Web
npm run web        # or: expo start --web
```

### Step 4: Test Login
Use these credentials (or register new account):
- **Email:** testuser@example.com
- **Password:** Your backend's configured password

## 📋 App Structure

```
src/
├── api/
│   └── axios.js           # API client with interceptors
├── components/
│   ├── BookCard.js        # Book display component
│   ├── CategoryList.js    # Category selector
│   └── SearchBar.js       # Search input
├── config/
│   └── config.js          # API configuration (*** UPDATE THIS ***)
├── navigation/
│   └── AppNavigator.js    # Navigation routing
├── screens/               # All app screens
│   ├── HomeScreen.js      # Dashboard
│   ├── BookDetailsScreen.js
│   ├── MyBorrowedBooksScreen.js (NEW)
│   ├── BorrowRequestsScreen.js (NEW for admin)
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── OTPScreen.js
│   ├── ForgetPasswordScreen.js
│   ├── ResetPasswordScreen.js
│   ├── AdminDashboardScreen.js
│   ├── SettingsScreen.js
│   ├── CatalogScreen.js
│   └── ...
├── store/
│   ├── store.js           # Redux store config (UPDATED)
│   ├── books.js           # Book slice
│   └── slices/
│       ├── authSlice.js   # Auth (ENHANCED)
│       ├── borrowSlice.js (NEW)
│       ├── popupSlice.js  (NEW)
│       └── userSlice.js   # User management
├── utils/
│   └── toastNotificationManager.js (NEW)
└── App.js                 # Entry point
```

## 🔐 Authentication Flow

1. **Register** → Create account
2. **Verify Email** → Enter OTP
3. **Login** → Use email/password
4. **Dashboard** → Browse catalog
5. **Borrow** → Submit request
6. **Admin Approval** → Librarian approves
7. **Active Borrowing** → User can view details
8. **Return** → Admin confirms return

## 📱 User Features

### Browse & Search
- View all books in catalog
- Search by title, author, or genre
- Filter by availability

### Borrow Books
- Request to borrow from book details
- View all your borrowings
- See status: Pending, Active, Overdue, Returned
- Cancel pending requests
- Report lost/damaged books

### Manage Account
- View profile
- Update password
- Change email
- Logout

## 👨‍💼 Admin Features

### Manage Requests
- View all pending borrow requests
- Approve with due date
- Reject with remarks
- See statistics

### Manage Books
- Add new books
- Update book details
- Delete books
- Record direct borrowing

### Manage Users
- View all users
- Promote/demote roles
- Delete users

### Monitor Borrowing
- View all active borrowings
- Confirm returns
- Report issues
- Track overdue items

## 🆘 Troubleshooting

### "Network Error" or "Cannot connect to API"
- [ ] Check your IP address in `config.js`
- [ ] Ensure backend server is running (`npm start` in server folder)
- [ ] Check firewall settings
- [ ] Restart Expo development server

### "Invalid token" or "Session expired"
- [ ] Logout and login again
- [ ] Clear app data (Settings → Apps → SciLibrary → Storage → Clear All Data)
- [ ] Check if backend token has expired

### "Book not found" when trying to borrow
- [ ] Make sure book exists in database
- [ ] Check book status is "Available"
- [ ] Refresh the catalog

### "Approve button disabled"
- [ ] Make sure you're logged in as admin
- [ ] Check request status is "Pending"

## 🧪 Testing Scenarios

### Scenario 1: Regular User Flow
1. Register new account
2. Verify email with OTP
3. Login
4. Browse catalog
5. Borrow a book
6. Check "My Borrowings"
7. Logout

### Scenario 2: Admin Workflow
1. Login as admin (create admin account via backend)
2. Go to Admin Dashboard
3. Check Borrow Requests tab
4. Approve a pending request
5. Confirm book return
6. View statistics

### Scenario 3: Error Handling
1. Try borrowing without login (should redirect)
2. Try borrowing unavailable book (should error)
3. Try duplicate borrow (should handle gracefully)
4. Try offline (should show error)

## 📞 Support

For issues or questions:
1. Check `MOBILE_MIGRATION_SUMMARY.md` for detailed documentation
2. Check server logs for API errors
3. Review Redux DevTools for state
4. Check browser console/Simulator logs

## 📚 API Documentation

All API endpoints are documented in:
- `MOBILE_MIGRATION_SUMMARY.md` - Complete endpoint list
- Backend API documentation (in Server folder)
- Redux slices in `src/store/slices/`

## ✅ Verification Checklist

Use this before deploying:
- [ ] API endpoint configured correctly
- [ ] Can register and verify email
- [ ] Can login successfully
- [ ] Can browse books
- [ ] Can request borrow
- [ ] Can view borrowings
- [ ] Can cancel request (if pending)
- [ ] Admin can approve requests
- [ ] Admin can confirm returns
- [ ] Logout works
- [ ] Session persists on restart

## 🎉 Ready to Go!

Your mobile app is now fully functional and mirrors the web version. Happy coding!
