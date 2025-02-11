const mongoose = require('mongoose');


const walletSchema = new mongoose.Schema(
  {
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        // required:true      
    },
    transactions: [
      {
        transactionType: {
          type: String, // e.g., 'debit' or 'credit'
          required: true,
        },
        amount: {
          type: Number, // Store as a number for better calculation
          required: true,
        },
        date: {
          type: Date,
          default: Date.now, // Default to the current date
        },
      },
    ],
    totalAmount:{
      type:Number,
      // required:true
    }
  },
  { timestamps: true } // This will automatically add createdAt and updatedAt fields
);

// Create the Wallet model
 
module.exports = mongoose.model("Wallet", walletSchema);
