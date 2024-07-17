const { createSlug, createCode } = require('../../utils/crypto');
const fs = require('fs-extra');
const Event = require('./Model');
const TicketType = require('../TicketType/Model');
const Ticket = require('../Ticket/Model');
const Category = require('../Category/Model');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// [POST] -> /api/event/create
module.exports.POST_CreateEvent = async (req, res, next) => {
    const { license, banner } = req.files;
    const { event_name } = req.body;
    let image = await cloudinary.uploader.upload(banner[0].path);
    if (!image) {
        fs.unlinkSync(file.path);
        return res.status(500).json({
            success: false,
            msg: 'Cloudinary error',
        });
    }

    return Event.create({
        ...req.body,
        banner: image.url,
        license: 'uploads/' + license[0].filename,
        status: 'pending',
        slug: createSlug(event_name),
    })
        .then((event) => {
            return res.status(200).json({
                success: true,
                event,
                msg: 'Tạo sự kiện thành công',
            });
        })
        .catch(async (err) => {
            await cloudinary.uploader.destroy(image.public_id);
            return res.status(500).json({
                success: false,
                msg: 'Tạo sự kiện thất bại: ' + err,
            });
        })
        .finally(() => {
            fs.unlinkSync(banner[0].path);
        });
};

// [PUT] -> /api/event/update/:event_id
module.exports.PUT_UpdateTicketTypesOfEvent = async (req, res, next) => {
    const { ticket_types } = req.body;

    let types = JSON.parse(ticket_types);
    
    if (types.length !== 0) {
        for (let i = 0; i < types.length; i++) {
            if (types[i].is_delete) {
                await TicketType.findByIdAndDelete(types[i]._id)
                    .then(async (type) => {
                        await Ticket.deleteMany({ ticket_type: type }).then((result) => {
                            console.log(result);
                        });
                    })
                    .catch((err) => {
                        return res.status(500).json({
                            success: false,
                            msg: `Lỗi khi xóa vé: ` + err,
                        });
                    });
            } else {
                await TicketType.findByIdAndUpdate(types[i]._id, types[i])
                    .then((type) => {
                        
                    })
                    .catch((err) => {
                        return res.status(500).json({
                            success: false,
                            msg: `Lỗi khi cập nhật vé: ` + err,
                        });
                    });
            }
        }
    }

    next();
};

// [PUT] -> /api/event/update/:event_id
module.exports.PUT_UpdateEvent = async (req, res, next) => {
    const user = req.user;
    const { event_id } = req.params;
    const { event_name, ticket_types } = req.body;
    // console.log(event_name);
    const file = req.file;

    // Kiểm tra sự kiện tồn tại hay không
    let event = await Event.findOne({ _id: event_id }).select({ introduce: 0 }).lean();

    if (!event) {
        return res.status(404).json({
            success: false,
            msg: 'Không tìm thấy sự kiện',
        });
    }

    // Tạm gắn banner cũ
    let banner = event.banner;
    let url_parts = banner.split('/');

    // Lưu public id (cloudinary)
    let new_public_id = '';
    let old_public_id = url_parts[url_parts.length - 1].replace('.jpg', '');

    if (file) {
        // Upload banner mới len cloudinary
        let image = await cloudinary.uploader.upload(file.path);
        if (!image) {
            return res.status(500).json({
                success: false,
                msg: 'Cloudinary error',
            });
        }

        // Gắn banner mới khi có file mới
        banner = image.url;
        new_public_id = image.public_id;

        // Xóa file multer upload lên
        fs.unlinkSync(file.path);
    }

    return await Event.findByIdAndUpdate(
        event_id,
        { $set: { ...req.body, slug: createSlug(event_name), banner } },
        { returnOriginal: false },
    )
        .then(async (event) => {
            // Destroy link banner cũ trên cloudinary
            if (file) {
                cloudinary.uploader.destroy(old_public_id);
            }

            return res.status(200).json({
                success: true,
                event,
                msg: 'Cập nhật sự kiện thành công',
            });
        })
        .catch((err) => {
            // Destroy banner mới trên cloudinary vì update lỗi
            cloudinary.uploader.destroy(new_public_id);

            return res.status(500).json({
                success: false,
                msg: 'Cập nhật sự kiện thất bại: ' + err,
            });
        });
};

// [DELETE] -> /api/event/delete/:event_id
module.exports.DELETE_RemoveEvent = async (req, res, next) => {
    const { event_id } = req.params;

    return await Event.findByIdAndDelete(event_id)
        .then((event) => {
            let url_parts = event.banner.split('/');
            let public_id = url_parts[url_parts.length - 1].replace('.jpg', '');

            cloudinary.uploader.destroy(public_id);
            return res.status(200).json({
                success: true,
                event,
                msg: 'Xóa sự kiện thành công',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: 'Xóa sự kiện thất bại: ' + err,
            });
        });
};

// [GET] -> api/event/detail/:event_id
module.exports.GET_EventDetail = async (req, res, next) => {
    const { event_id } = req.params;

    return await Event.findById(event_id)
        .populate({ path: 'category' })
        .lean()
        .then(async (event) => {
            let ticket_types = await TicketType.find({ event });
            return res.status(200).json({
                success: true,
                event: { ...event, occur_date: event.occur_date.toLocaleDateString('en-CA'), ticket_types },
                msg: 'Tìm kiếm sự kiện thành công',
            });
        })
        .catch((err) => {
            return res.status(404).json({
                success: false,
                msg: 'Tìm kiếm sự kiện thất bại: ' + err,
            });
        });
};

// [GET] -> api/event/view/:event_slug
module.exports.GET_EventView = async (req, res, next) => {
    const { event_slug } = req.params;

    return await Event.findOne({ slug: event_slug })
        .populate({ path: 'category' })
        .lean()
        .then(async (event) => {
            let ticket_types = await TicketType.find({ event }).sort({ price: 1 })
            return res.status(200).json({
                success: true,
                event: { ...event, occur_date: event.occur_date.toLocaleDateString('en-CA'), ticket_types },
                msg: 'Tìm kiếm sự kiện thành công',
            });
        })
        .catch((err) => {
            return res.status(404).json({
                success: false,
                msg: 'Tìm kiếm sự kiện thất bại: ' + err,
            });
        });
};

// [GET] -> api/event/search?...
module.exports.GET_SearchEvents = async (req, res, next) => {
    return await Event.find({ ...req.query })
        .select({ introduce: 0 })
        .sort({ createdAt: -1 })
        .populate({ path: 'category' })
        .lean()
        .then((events) => {
            return res.status(200).json({
                success: true,
                events,
                msg: `Đã tìm thấy ${events.length} sự kiện tương ứng`,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                msg: 'Lỗi hệ thống trong quá trình tìm kiếm: ' + err,
            });
        });
};

// [GET] -> api/event/search_by_category?slug=...
module.exports.GET_SearchEventsByCategory = async (req, res, next) => {
    const { slug, page } = req.query;
    
    const category = await Category.findOne({slug});

    if(!category) {
        return res.status(404).json({
            success: false,
            msg: 'Không tìm thấy danh mục này'
        })
    }
    
    const limit = 20;
    const skip = page ? limit * (parseInt(page) - 1) : 0;
    return await Event.find({ category })
        .populate('category')
        .select({ introduce: 0 })
        .skip(skip)
        .limit(limit)
        .lean()
        .then(async events => {
            let return_events = [];
            for(let i in events) {
                let ticket_types = await TicketType.find({event: events[i]}).sort({ price: 1 }).lean();
                return_events.push({...events[i], ticket_types});
            }

            return res.status(200).json({
                success: true,
                events: return_events,
                msg: `Tìm thấy ${events.length} sự kiện tương ứng`
            })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                msg: 'Tìm kiếm sự kiện thất bại: ' + err
            })
        })
}

// [POST] -> /api/event/uploadCK
module.exports.POST_UploadCK = async (req, res, next) => {
    const file = req.file;
    if (!file) {
        return res.status(500).json({
            success: false,
            msg: 'Không tìm thấy file',
        });
    }

    let image = await cloudinary.uploader.upload(file.path);
    if (!image) {
        return res.status(500).json({
            success: false,
            msg: 'Cloudinary error',
        });
    }

    fs.unlinkSync(file.path);

    return res.status(200).json({
        success: true,
        url: image.url,
    });
};
