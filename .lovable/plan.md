

# Plan: Fix Reset Password, Validate Edge Functions & Creative Numbering

## Problem Analysis

After investigation, here are the root causes:

### 1. Reset Password Not Working
The edge function itself **works correctly** — I deployed and tested it. The real issue is that **all 4 existing clients have `user_id: null`** in the database. They were created directly in the `clients` table without going through the `create-user` edge function, meaning they have **no auth accounts**. The "Resetar senha" button in the UI is conditional on `client.user_id` existing, so it never shows for these clients.

**Root cause**: The `CreateClientDialog` calls `addClient()` from `AuthContext`, which invokes the `create-user` edge function. This function creates an auth user and a client record with `user_id` linked. But the existing 4 clients were either created before this flow existed or created manually.

**Fix**: No code change needed — the flow is correct. The existing clients without auth accounts need to be cleaned up (they're test data). New clients created via the dialog will work correctly. I'll verify by testing the `create-user` function end-to-end.

### 2. Creative Numbering
The bulk upload logic (lines 208-214 of `CreativeUpload.tsx`) looks correct now:
- Calls `getCurrentMaxSequence()` once before the loop
- Increments sequentially: `currentMaxSequence + i + 1`
- Feed+Stories counts as 1 unit

The existing gaps in data (ADF001, ADF003, ADF006) are from previous buggy code. Current code should be correct. I'll verify with a test.

## Implementation Steps

1. **Test `create-user` edge function** via curl to confirm it creates auth users properly
2. **Test `reset-password` edge function** with a real user UUID
3. **Clean up test client data** — the 4 test clients without auth accounts are orphaned
4. If any edge function fails, fix and redeploy immediately

## What I'll Verify
- Creating a client via the edge function produces an auth user + client record with `user_id`
- Resetting that user's password works
- Bulk creative upload generates sequential numbers without gaps

