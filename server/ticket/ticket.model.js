const mongoose = require('mongoose');
// const config = require('@config/config');

const TicketSchema = new mongoose.Schema(
  {
    originId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Stop'
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Stop'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  { timestamps: true }
);

/**
 * @typedef Ticket
 */
module.exports = mongoose.model('Ticket', TicketSchema);
