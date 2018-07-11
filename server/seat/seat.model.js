const mongoose = require('mongoose');
// const config = require('@config/config');

/**
 * @swagger
 *  definitions:
 *      Seat:
 *        description: Bus's seat's public model
 *        type: object
 *        properties:
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

const SeatSchema = new mongoose.Schema(
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
 * @typedef Seat
 */
module.exports = mongoose.model('Seat', SeatSchema);
