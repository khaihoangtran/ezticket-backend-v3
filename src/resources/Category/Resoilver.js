const Category = require('./Model');
const { createSlug } = require('../../utils/crypto');

// [POST] -> api/category/create
module.exports.POST_CreateCategory = async (req, res, next) => {
    const { category_name } = req.body;
    return await Category.create({category_name, category_code: Math.floor(Math.random() * 1000), slug: createSlug(category_name)})
        .then(category => {
            return res.status(200).json({
                success: true,
                category,
                msg: 'Tạo danh mục thành công'
            })
        })   
        .catch(err => {
            return res.status(500).json({
                success: false,
                msg: 'Tạo danh mục thất bại: ' + err
            })
        }) 
}


// [DELETE] -> api/category/delete/:category_id
module.exports.DELETE_RemoveCategory = async (req, res, next) => {
    const { category_id } = req.params;

    return await Category.findByIdAndDelete(category_id)
        .then(category => {
            return res.status(200).json({
                success: true,
                category,
                msg: 'Xóa danh mục thành công'
            })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                msg: 'Xóa danh mục thất bại: ' + err
            })
        })
}

// [GET] -> api/category/all
module.exports.GET_AllCategories = async (req, res, next) => {
    return await Category.find({})
        .then(categories => {
            return res.status(200).json({
                success: true,
                categories,
                msg: 'Tìm kiếm tất cả danh mục thành công'
            })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                msg: 'Tìm kiếm tất cả danh mục thất bại: ' + err
            })
        })
}