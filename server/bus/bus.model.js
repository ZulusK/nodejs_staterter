// const Promise = require('bluebird');
// const mongoose = require('mongoose');
// const httpStatus = require('http-status');
// const APIError = require('@helpers/APIError');
// const config = require('@config/config');
// {
//     _id: 'asdkjasdhkj3hddjoid1j1',
//     routeName: 'West Route',
//     origin: {
//       name: 'Tan Tye Place, Singapore',
//       coords: {
//         latitude: 1.2912642,
//         longitude: 103.845232,
//       }
//     },
//     destination: {
//       name: 'Tan Tye Place, Singapore',
//       coords: {
//         latitude: 1.2912642,
//         longitude: 103.845232,
//       }
//     },
//     waypoints: [
//       'NUS Engineering, Singapore',
//       'Clementi MRT, Singapore',
//       'Jurong East MRT, Jurong East Street 12, Singapore',
//       'Boon Lay MRT Station, Boon Lay Way, Singapore',
//       'Pioneer MRT Station, Jurong West Street 63, Singapore',
//     ],
//     strokeColor: 'red',
//     stops: 5,
//     distance: '44.8 km',
//     estimatedTime: '1 hr 13 mins',
//   },
/**
 * @swagger
 *  definitions:
 *      Bus:
 *        description: Bus public model
 *        type: object
 *        required:
 *          - id
 *          - routeName
 *          - origin
 *          - destination
 *        properties:
 *          id:
 *              type: string
 *              format: byte
 *              example: 507f1f77bcf86cd799439011
 *          email:
 *              type: string
 *              format: email
 *              example: example@mail.com
 *          fullname:
 *              example: John Smith
 *              type: string
 *          mobileNumber:
 *              type: string
 *          updatedAt:
 *              type: integer
 *              format: int64
 *          createdAt:
 *              type: integer
 *              format: int64
 */
