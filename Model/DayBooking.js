var booking = require('./Booking');

class DayBooking {

    constructor() {
        this.bookings = [];
        this.booking_map = new Map();
    }

    checkTimeslot(year, month, day, hour, min) {
        var given_date_utc = Date.UTC(year, month - 1, day, hour, min, 0);

        var given_date = new Date(given_date_utc);

        var time_slot_utc = Date.UTC(year, month - 1, day, 9, 0, 0);

        var time_slot = new Date(time_slot_utc);

        while(true) {

            if(+time_slot == +given_date) {
                return true;
            }
            time_slot.setMinutes(time_slot.getMinutes() + 45);
            if(time_slot > given_date || time_slot.getUTCHours()>=18) {
                return false;
            }
        }
    }

    addBooking(year, month, day, hour, min) {

        var new_date_utc = Date.UTC(year, month - 1, day, hour, min, 0);

        var new_date = new Date(new_date_utc);

        hour = new_date.getUTCHours();

        if (hour < 9 || hour >= 18) {
            return 'Cannot book outside bookable timeframe';
        }

        if(new_date.getDay()<1 || new_date.getDay() >5) {
            return 'Appointments can only be booked during weekdays from 9 am to 6 pm';
        }

        var now_date = new Date();

        var tmp_date = new Date(new_date);

        if (now_date > new_date) {
            return 'Cannot book time in the past';
        } else if (tmp_date.setHours(tmp_date.getHours() - 24) < now_date) {
            return 'Cannot book with less than 24 hours in advance';
        }

        if(!this.checkTimeslot(year, month, day, hour, min)) {
            return 'Invalid Timeslot entered';
        }

        var arrayLength = this.bookings.length;
        for (var i = 0; i < arrayLength; i++) {

            var tmp_date1 = new Date(this.bookings[i].startTime);
            var tmp_date2 = new Date(this.bookings[i].startTime);
            tmp_date2.setMinutes(tmp_date2.getMinutes() + 45);

            var new_date_end = new Date(new_date);
            new_date_end.setMinutes(new_date_end.getMinutes() + 45);

            if (!(+tmp_date1 >= +new_date_end || +tmp_date2 <= +new_date)) {
                return 'Time slot colliding with existing bookings';
            }
        }

        var curr_booking = new booking(new_date_utc);

        var current_booking_on_that_day = [];
        current_booking_on_that_day = this.booking_map.get(day + ',' + month + ',' + year);

        if (!current_booking_on_that_day) {
            current_booking_on_that_day = [];
        }
        current_booking_on_that_day.push(curr_booking);

        this.booking_map.set(day + ',' + month + ',' + year, current_booking_on_that_day);

        this.bookings.push(curr_booking);

        this.bookings.sort(function (a, b) {
            if (a.startTime < b.startTime) {
                return -1;
            } else {
                return 1;
            }
        });


        return new_date;
    };

    hasFreeTimeSlot(day, month, year) {

        var current_booking_on_that_day = this.booking_map.get(day + ',' + month + ',' + year);

        if (!current_booking_on_that_day) {
            return true;
        }

        var prev = new Date(current_booking_on_that_day[0].startTime);

        var arrayLength = current_booking_on_that_day.length;

        for (var i = 1; i < arrayLength; i++) {

            var curr = new Date(this.bookings[i].startTime);

            var diff = curr - prev;
            var diff_minutes = (diff / 1000) / 60;
            if (diff_minutes >= 90) {
                return true;
            }
            prev = curr;

        }
        return false;

    };

    getTimeSlots(day, month, year) {

        var start_times = [];

        var current_booking_on_that_day = this.booking_map.get(day + ',' + month + ',' + year);

        if (!current_booking_on_that_day) {
            current_booking_on_that_day = [];
        }

        var curr_date_utc = Date.UTC(year, month - 1, day, 9, 0, 0);

        var curr_date = new Date(curr_date_utc);


        while (true) {

            var can_insert_this_timeslot = true;

            for (var i = 0; i < current_booking_on_that_day.length; i++) {

                var tmp_date1 = new Date(current_booking_on_that_day[i].startTime);
                var tmp_date2 = new Date(current_booking_on_that_day[i].startTime);
                tmp_date2.setMinutes(tmp_date2.getMinutes() + 45);

                var curr_date_end = new Date(curr_date);
                curr_date_end.setMinutes(curr_date_end.getMinutes() + 45);

                if (!(+tmp_date1 >= +curr_date_end || +tmp_date2 <= +curr_date)) {
                    curr_date = tmp_date2;
                    can_insert_this_timeslot = false;
                    break;
                }
            }

            if(can_insert_this_timeslot) {
                var tmp = new Date(curr_date);
                start_times.push(tmp);
                curr_date.setMinutes(curr_date.getMinutes() + 45);
            }

            if (curr_date.getUTCHours() >= 18) {
                break;
            }
        }
        return start_times;
    }
}

module.exports = DayBooking;
