# Withdrawal Notification System

## How Users Know Their Withdrawal Status

### Current Implementation

Users can check their withdrawal status in **3 ways**:

#### 1. Transaction History (Wallet Page)

- Go to **Wallet** → **Transaction History**
- Look for withdrawal transactions
- Status shows:
  - 🟡 **pending** - Waiting for admin approval
  - ✅ **completed** - Approved and processed
  - ❌ **rejected** - Rejected with reason

#### 2. Visual Status Indicators

Each transaction row shows:

- **Pending**: Yellow/gold color
- **Completed**: Green color
- **Rejected**: Red color
- **Note column**: Shows approval/rejection reason

#### 3. Real-Time Socket Notifications (Added)

When admin approves/rejects:

- Server emits socket event
- User receives instant notification
- Balance updates automatically

### Server-Side Changes Made

**File: `server/server.js`**

```javascript
// Store io instance for routes to access
app.set("io", io);
```

**File: `server/routes/admin.js`**

```javascript
// On approval
const io = req.app.get("io");
if (io) {
  io.emit("withdrawal_approved", {
    userId: txn.userId.toString(),
    amount: txn.amount,
    coins: Math.abs(txn.coins),
  });
}

// On rejection
io.emit("withdrawal_rejected", {
  userId: txn.userId.toString(),
  amount: txn.amount,
  coins: coinsToRefund,
  reason: reason || "No reason given",
});
```

### Client-Side Implementation Needed

**File: `client/src/pages/player/Wallet.jsx`**

Add socket listeners:

```javascript
useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  socket.on("withdrawal_approved", (data) => {
    if (data.userId === user._id) {
      flash(`✅ Withdrawal approved! $${data.amount} processed`, "green");
      fetchData(); // Refresh transactions
    }
  });

  socket.on("withdrawal_rejected", (data) => {
    if (data.userId === user._id) {
      flash(
        `❌ Withdrawal rejected: ${data.reason}. ${data.coins} coins refunded`,
        "red",
      );
      fetchData(); // Refresh transactions
    }
  });

  return () => {
    socket.off("withdrawal_approved");
    socket.off("withdrawal_rejected");
  };
}, []);
```

### User Experience Flow

1. **User requests withdrawal**
   - Submits withdrawal request
   - Sees "pending" status immediately
   - Coins deducted from balance

2. **Admin reviews**
   - Admin sees request in Withdrawals page
   - Can approve or reject with reason

3. **User gets notified**
   - **If approved**:
     - ✅ Green notification popup
     - Status changes to "completed"
     - Transaction shows in history
   - **If rejected**:
     - ❌ Red notification popup
     - Coins automatically refunded
     - Reason shown in transaction note
     - Status changes to "rejected"

### Benefits

✅ **Instant feedback** - No need to refresh page
✅ **Clear status** - Color-coded indicators
✅ **Transparency** - Rejection reasons shown
✅ **Auto-refund** - Coins returned immediately on rejection
✅ **History tracking** - All transactions logged

### Testing

1. Request a withdrawal as player
2. Approve/reject as admin
3. Check if player sees notification
4. Verify transaction history updates
5. Confirm balance changes correctly
