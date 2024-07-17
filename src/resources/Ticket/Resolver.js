const mongoose = require('mongoose');
const { createCode } = require('../../utils/crypto');
const Ticket = require('./Model');
const Event = require('../Event/Model');
const { sendMail, mailForm } = require('../../utils/mail');

// [POST] -> api/ticket/create
module.exports.POST_CreateTicket = async (req, res, next) => {
    const { trade_code, ticket_type, ticket_name, qty } = req.body;
    let payloads = [];
    let oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    for (let i = 0; i < qty; i++) {
        payloads.push({
            trade_code,
            ticket_type,
            ticket_code: createCode(8).toUpperCase(),
            expiry: oneMonthLater,
            status: 'available',
        });
    }

    return await Ticket.insertMany(payloads)
        .then((tickets) => {
            return res.status(200).json({
                success: true,
                tickets,
                msg: `Đã tạo thành công ${tickets.length} vé ${ticket_name}`,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: 'Tạo vé thất bại: ' + err,
            });
        });
};

// [PUT] -> api/ticket/update/:ticket_id
module.exports.PUT_UpdateTicket = async (req, res, next) => {
    const { ticket_id } = req.params;

    return await Ticket.findByIdAndUpdate(ticket_id, { $set: { ...req.body } }, { returnOriginal: false })
        .then((ticket) => {
            return res.status(200).json({
                success: true,
                ticket,
                msg: 'Cập nhật vé thành công',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: 'Cập nhật vé thất bại: ' + err,
            });
        });
};

// [DELETE] -> api/ticket/delete/:ticket_id
module.exports.DELETE_RemoveTicket = async (req, res, next) => {
    const { ticket_id } = req.params;

    return await Ticket.findByIdAndDelete(ticket_id)
        .then((ticket) => {
            return res.status(200).json({
                success: true,
                ticket,
                msg: 'Xóa vé thành công',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: 'Xóa vé thất bại: ' + err,
            });
        });
};

// [GET] -> api/ticket/detail/:ticket_code
module.exports.GET_TicketDetail = async (req, res, next) => {
    const { ticket_id } = req.params;

    return await Ticket.findOne({ _id: ticket_id })
        .populate({ path: 'ticket_type', populate: { path: 'event', select: 'event_name banner' } })
        .lean()
        .then((ticket) => {
            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    msg: 'Không tìm thấy vé tương ứng',
                });
            }

            return res.status(200).json({
                success: true,
                ticket,
                msg: 'Tìm kiếm vé thành công',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: 'Tìm kiếm vé thất bại: ' + err,
            });
        });
};

// [GET] -> api/ticket/search?
module.exports.GET_SearchTickets = async (req, res, next) => {
    return await Ticket.find({ ...req.query })
        .lean()
        .then((tickets) => {
            return res.status(200).json({
                success: true,
                tickets,
                msg: `Đã tìm thấy ${tickets.length} vé tương ứng`,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: 500,
                msg: 'Lỗi tìm kiếm: ' + err,
            });
        });
};

// [GET] -> api/ticket/group_by_events
module.exports.GET_GroupByEvent = async (req, res, next) => {
    const { event_id } = req.params;
    return await Ticket.aggregate([
        {
            $match: {
                event: new mongoose.Types.ObjectId(event_id), // Lọc để chỉ lấy vé của sự kiện cụ thể
            },
        },
        {
            $group: {
                _id: {
                    name: '$name', // Nhóm theo tên trước
                    status: '$status', // và sau đó theo trạng thái
                },
                count: { $sum: 1 }, // Đếm số lượng vé
                price: { $first: '$price' },
            },
        },
        {
            $group: {
                _id: '$_id.name',
                // price: "$_id.price",// Nhóm lại theo tên
                statuses: {
                    $push: {
                        // Đẩy các trạng thái và số lượng tương ứng vào một mảng
                        status: '$_id.status',
                        count: '$count',
                        price: '$price',
                    },
                },
            },
        },
    ])
        .then(async (result) => {
            if (result.length !== 0) {
                let event = await Event.findById(event_id)
                    .select({
                        _id: 1,
                        name: 1,
                        banner: 1,
                    })
                    .lean();
                return res.status(200).json({
                    success: 200,
                    tickets: result,
                    event: event,
                    msg: 'Nhóm danh sách vé thành công',
                });
            }
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: 'Nhóm danh sách vé thất bại: ' + err,
            });
        });
};

// [GET] -> /api/ticket/resend/:trade_code/:owner
module.exports.GET_ResendTicket = async (req, res, next) => {
    const { trade_code, owner } = req.params;

    return await Ticket.find({ trade_code, owner })
        .populate({
            path: 'owner',
            select: `fullname email`,
        })
        .populate({
            path: 'ticket_type',
            populate: { path: 'event', select: 'event_name banner' },
        })
        .lean()
        .then((tickets) => {
            if (tickets.length == 0) {
                return res.status(404).json({
                    success: false,
                    msg: `Không tìm thấy vé nào tương ứng`,
                });
            }

            const customer = tickets[0].owner;
            let ticketsHtml = '';
            tickets.forEach((ticket) => {
                ticketsHtml += `
                <table width="800" border="0" cellspacing="0" cellpadding="0" style="font-family: Roboto, Consolas; border: 3px solid gray; border-radius: 16px; margin-bottom: 20px; overflow: hidden;">
                    <tr>
                        <td width="216" valign="top" style="padding: 15px; border-right: 2px dashed black;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                            <td width="50%" style="padding-right: 5px;">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg/800px-Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg.png" width="100%" style="display: block;"/>
                            </td>
                            <td valign="top">
                                <div style="width: 100px; height: 20px; background-color: #71b190; border-radius: 999px; margin-bottom: 5px;"></div>
                                <div style="width: 60px; height: 20px; background-color: #71b190; border-radius: 999px; margin-bottom: 5px;"></div>
                                <div style="width: 40px; height: 20px; background-color: #71b190; border-radius: 999px; margin-bottom: 5px;"></div>
                                <div style="width: 100px; height: 20px; background-color: #71b190; border-radius: 999px;"></div>
                            </td>
                            </tr>
                        </table>
                        <div style="font-size: 20px; font-weight: bold; margin-top: 6px;">${ticket.ticket_type?.ticket_name}</div>
                        <div style="font-weight: 600;">${(ticket.ticket_type?.price).toLocaleString('vi-vn')}đ</div>
                        <div>ID: ${trade_code}</div>
                        </td>
                        <td width="584" style="background-color: #eee;">
                        <img src="${ticket.ticket_type?.event?.banner}" width="100%" style="border-radius: 0 16px 16px 0; display: block;" />
                        </td>
                    </tr>
                </table>
                `;
            });
            sendMail({
                to: customer.email,
                subject: 'Thông tin vé sự kiện từ EzTicket',
                text: `Xin chào ${customer.fullname}`,
                html: ticketsHtml,
            });

            return res.status(200).json({
                success: true,
                // tickets,
                msg: `Tìm thấy ${tickets.length} vé tương ứng`,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: `Tìm kiếm vé xãy ra lồi: ` + err,
            });
        });
};
