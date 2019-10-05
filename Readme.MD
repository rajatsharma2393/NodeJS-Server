A system to create bookings for massages that
 is available on the web.

Requirements
* All appointments are 40 minutes long and have fixed times, starting from 9–9:40 am
* Ensure there is always a 5 minute break in between each appointment
* Appointments can only be booked during weekdays from 9 am to 6 pm
* Bookings can only be made at least 24 hours in advance
* Appointments cannot be booked in the past
* For simplicity, use UTC time for all bookings and days

Endpoints :

1. GET bookable days

Requires a year and month. Note that months must not be zero-indexed.

GET  /days?year=yyyy&month=mm
Returns an array of all days in the specified month, each of which has the field hasTimeSlots, which is false if there are no time slots available, based on the requirements listed above.

{
  "success": true,
  "days": [
    { "day": 1,  "hasTimeSlots": false },
    ...
    { "day": 31, "hasTimeSlots": true }
  ]
}


2 . GET available time slots

Requires a year, month, and day.

GET  /timeslots?year=yyyy&month=mm&day=dd
Returns a list of all 40-minute time slots available for that day as an array of objects that contain a startTime and endTime in ISO 8601 format.

{
  "success": true,
  "timeSlots": [
    {
      "startTime": "2019-09-04T09:00:00.000Z",
        "endTime": "2019-09-04T09:40:00.000Z"
    },
    {
      "startTime": "2019-09-04T09:45:00.000Z",
        "endTime": "2019-09-04T10:25:00.000Z"
    },
    ...
  ]
}



3 . POST book an appointment

Requires a year, month, day, hour, and minute.

POST  /book?year=yyyy&month=MM&day=dd&hour=hh&minute=mm
Returns a boolean field success. If the booking was successful, also return startTime and endTime.



Run instructions ->
node app.js
