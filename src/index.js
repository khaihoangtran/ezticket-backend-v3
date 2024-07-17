require('dotenv').config();
const PORT = process.env.SERVER_PORT || 5000;
const app = require('./config/server').init();
const db = require('./config/db/database');
const routes = require('./resources/routes');
const Booking = require('./resources/Booking/Model');
const TicketType = require('./resources/TicketType/Model');
// const Event = require('./resources/Event/Model');

db.connect();

app.use('/api', routes);

setInterval(() => {
    const current = new Date();

    Booking.find({ status: 'pending' })
        .where('createdAt')
        .lte(current - 15 * 60 * 1000)
        .then(async (bookings) => {
            for (const booking of bookings) {
                booking.status = 'canceled';
                booking.save();

                for (const ticket of booking.tickets) {
                    let ticket_type = await TicketType.findById(ticket.ticket_type);
                    ticket_type.n_stock += ticket.qty;
                    await ticket_type.save();
                }
            }
            // console.log(bookings);
        });
}, 1000 * 60 * 5);

app.get('/', async (req, res, next) => {
    // await Event.updateMany({}, { ticket_types: []})
    // await Event.updateMany({}, { license: '/uploads/giayphep.pdf' })
    return res.json('Ezticket API');
});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
