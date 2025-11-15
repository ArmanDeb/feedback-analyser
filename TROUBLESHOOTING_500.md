# Troubleshooting 500 Error

## Possible Causes

1. **Database Connection Issue**
   - Check if `DATABASE_URL` is set in `.env`
   - Verify database is accessible
   - Check Prisma connection

2. **Lucia Initialization**
   - Lucia might fail to initialize if Prisma adapter fails
   - Check console logs for Lucia initialization errors

3. **Missing Environment Variables**
   - `DATABASE_URL` must be set
   - Other env vars might be needed

## Debug Steps

1. **Check Server Logs**
   ```bash
   npm run dev
   # Look for error messages in terminal
   ```

2. **Check Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Test Database Connection**
   ```bash
   npx prisma db push
   # Should connect successfully
   ```

4. **Check Environment Variables**
   ```bash
   # Make sure .env file exists and has DATABASE_URL
   cat .env | grep DATABASE_URL
   ```

## Quick Fixes Applied

1. ✅ Added error handling to `hooks.server.ts`
2. ✅ Added error handling to `+layout.server.ts`
3. ✅ Added browser checks to components
4. ✅ Added safe pathname access
5. ✅ Added Lucia initialization error handling

## If Still Failing

Check the actual error message in:
- Browser DevTools Console
- Terminal where `npm run dev` is running
- Network tab showing the failed request details

The error message will tell us exactly what's failing.

