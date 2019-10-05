var express = require('express');
var app = express();

var booking_module = require('./Model/DayBooking');
var day_booking = new booking_module();


app.get('/', function (req, res) {
    res.send('Hello World!');
});

function verifyDateWithNow(year,month,day,hour) {

    var curr_date_utc = Date.UTC(year, month - 1, day, hour, 0, 0);

    var curr_date = new Date(curr_date_utc);

    var now_date = new Date();

    if (now_date > curr_date) {
        return false;
    }
    return true;
};

app.get('/days', function (req, res) {

    year = req.query["year"];
    month = req.query["month"];

    if(!year || year<=2018) {
        res.status(400).send({
            "success": false,
            "message": "Invalid parameter : year"
        });
    }

    if(!month || !(month>=1 && month<=12)) {
        res.status(400).send({
            "success": false,
            "message": "Invalid parameter : month"
        });
    }

    if(!verifyDateWithNow(year,month,1,0)) {
        res.status(400).send({
            "success": false,
            "message": "Cannot get booking information from past"
        });
    }

    var days = new Date(year, month, 0).getDate();

    var days_array = [];

    for(var i=1;i<=days;i++) {

        var curr_date_utc = Date.UTC(year, month - 1, i, 9, 0, 0);

        var curr_date = new Date(curr_date_utc);

        var now_date = new Date();

        if (now_date > curr_date) {
           continue;
        }

        var day = i;
        if(i<10) {
            day='0'+i;
        }

        if(day_booking.hasFreeTimeSlot(day,month,year)) {
            days_array.push(JSON.parse('{"day":'+i+',"hasTimeSlots":true}'));
        } else {
            days_array.push(JSON.parse('{"day":'+i+',"hasTimeSlots":false}'));
        }
    }

    return res.status(201).send({
        success: true,
        days:days_array
    });

});

app.get('/timeslots', function (req, res) {

    year = req.query["year"];
    month = req.query["month"];
    day = req.query["day"];

    if(!year || year<=2018) {
        res.status(400).send({
            "success": false,
            "message": "Invalid parameter : year"
        });
    }

    if(!month || !(month>=1 && month<=12)) {
        res.status(400).send({
            "success": false,
            "message": "Invalid parameter : month"
        });
    }

    var days_in_month = new Date(year, month, 0).getDate();

    if(!day || !(day>=1 && day<=days_in_month)) {
        res.status(400).send({
            "success": false,
            "message": "Invalid parameter : day"
        });
    }

    if(!verifyDateWithNow(year,month,day,0)) {
        res.status(400).send({
            "success": false,
            "message": "Cannot get booking information of today or previous dates"
        });
    }

    var start_times = day_booking.getTimeSlots(day, month, year);

    var slots = [];

    for(var i=0;i<start_times.length;i++) {

        var end_time = new Date(start_times[i]);
        end_time.setMinutes(end_time.getMinutes()+40);

        slots.push(JSON.parse('{"startTime":"'+start_times[i].toISOString()+'","endTime":"'+end_time.toISOString()+'"}'));
    }

    return res.status(201).send({
        success: true,
        timeSlots:slots
    });

});

app.post('/book', (req, res) => {

    year = req.query["year"];
    month = req.query["month"];
    day = req.query["day"];
    hour = req.query["hour"];
    min = req.query["minute"];

    if(!year || year<=2018) {
        res.status(400).send({
            "success": false,
            "message": "Invalid parameter : year"
        });
    }

    if(!month || !(month>=1 && month<=12)) {
        res.status(400).send({
            "success": false,
            "message": "Invalid parameter : month"
        });
    }

    var days_in_month = new Date(year, month, 0).getDate();

    if(!day || !(day>=1 && day<=days_in_month)) {
        res.status(400).send({
            "success": false,
            "message": "Invalid parameter : day"
        });
    }


    if(!hour || !(hour>=0 && hour<=23)) {
        res.status(400).send({
            "success": false,
            "message": "Invalid parameter : hour"
        });
    }

    if(!min || !(min>=0 && min<=59)) {
        res.status(400).send({
            "success": false,
            "message": "Invalid parameter : min"
        });
    }

    var response = day_booking.addBooking(year, month, day, hour, min);

    if (response instanceof Date) {

        var end_time = new Date(response);
        end_time.setMinutes(end_time.getMinutes()+40);

        return res.status(201).send({
            success: true,
            startTime: response.toISOString(),
            endTime: end_time.toISOString()
        });
    } else {

        return res.status(400).send({
            success: false,
            message: response
        });
    }
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
