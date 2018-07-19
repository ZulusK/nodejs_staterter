# Project structure
1. [**Entry point**](../index.js) - creates new server and bind it to port (_default 3000_)
2. [**Server configuration**](../config/config.js) - validate environment variables and used as storage for all 
vars
3. [**Express configuration**](../config/express.js) - Configure express app, used as main engine of server
3.  [**Passport**](../config/passport) - includes all auth strategies, used in application
    1. [**Basic strategy**](../config/passport/basic.js) - definition of basic auth strategy
    2. [**Bearer strategy**](../config/passport/bearer.js) - definition of bearer-JWT strategy
    3. [**Initializer**](../config/passport/index.js) - Initializes all strategies and adds them to passport
4. [**Param validation**](../config/param-validation.js) - Defines all validation rules for all 
endpoints via Joi
5. [**Joi extentions**](../config/joi.extentions.js) - Defines extra rules for validation (like 
mobileNumber validation)
6. [**Winston**](../config/winston.js) - Configuration of application logger (winston)
7. [**Index route**](../server/index.route.js) - Adds all routes to application
8. [**Mailer sms**](../server/mailer/sms.js) - Provides abstraction for mobile phone messenger service
8. [**Mailer email**](../server/mailer/email.js) - Provides abstraction for email sender service
8. [**Helpers**](../server/helpers) - Used in development mode as DB filler
8. [**Tests**](../server/tests) - Includes basic tests structure and useful tests, used in each other entity tests 


##### All next folders will include 4 files: `x.route`, `x.controller`, `x.model` and `x.test`. This is server 
endpoint, 
server controller, DB's model and test for entity, named `x`.

8. [**Auth**](../server/auth) provides operation with authorization in app (signup, token generation, phone and 
email confirmation, etc.) 
9. [**Bus**](../server/bus) provides operation with buses
9. [**Event**](../server/event) provides operation with events
9. [**PendingUser**](../server/pendingUser) provides operation with pendingUser (used as user model, before user 
confirms his mobile number)
10. [**Route**](../server/route) provides operation with routes
10. [**Stop**](../server/stop) provides operation with stops
10. [**User**](../server/user) provides operation with user + user registration after mobile number confirmation

 