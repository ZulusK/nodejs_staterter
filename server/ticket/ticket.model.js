const mongoose = require('mongoose');
// const config = require('@config/config');

/**
 * @swagger
 *  definitions:
 *      Seat:
 *        description: Bus's ticket's public model
 *        type: object
 *        properties:
 *          cost:
 *            type: integer
 *            format: float
 *          id:
 *              type: string
 *              format: byte
 *              example: 507f1f77bcf86cd799439011
 *          userId:
 *              type: string
 *              format: byte
 *              example: 507f1f77bcf86cd799439011
 *          origin:
 *              $ref: "#/definitions/Stop"
 *          destination:
 *              $ref: "#/definitions/Stop"
 *          updatedAt:
 *              type: integer
 *              format: int64
 *          createdAt:
 *              type: integer
 *              format: int64
 */

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
