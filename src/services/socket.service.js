import { Message } from '~/models'
import { Op } from 'sequelize'

// Lưu tin nhắn vào DB
export const saveMessageToDB = async (from, to, content, timestamp) => {
    return await Message.create({
        sender: from,
        receiver: to,
        content,
        timestamp
    })
}

// Lấy lịch sử tin nhắn liên quan đến 1 số điện thoại
export const getMessageHistory = async (phone) => {
    return await Message.findAll({
        where: {
            [Op.or]: [
                { sender: phone },
                { receiver: phone }
            ]
        },
        order: [['timestamp', 'ASC']]
    })
}

// Lấy danh sách user có tương tác
export const getAllUsersWithMetadata = async () => {
    // Lấy tất cả các tin nhắn giữa người dùng và admin
    const messages = await Message.findAll({
        attributes: ['sender', 'receiver', 'content', 'timestamp'],
        where: {
            [Op.or]: [
                { sender: { [Op.ne]: 'admin' } },  // Loại trừ admin khỏi danh sách người gửi
                { receiver: { [Op.ne]: 'admin' } }  // Loại trừ admin khỏi danh sách người nhận
            ]
        },
        order: [['timestamp', 'DESC']]
    });

    // Dùng Map để lấy tin nhắn cuối cùng từ mỗi người
    const latestMessages = new Map();

    messages.forEach(msg => {
        const phone = msg.sender !== 'admin' ? msg.sender : msg.receiver;

        // Nếu chưa có người này trong Map, thêm vào
        if (!latestMessages.has(phone)) {
            latestMessages.set(phone, {
                id: phone,
                phone,
                name: 'Ẩn danh',  // Tạm thời gán tên mặc định
                message: msg.content
            });
        }
    });

    // Chuyển Map thành mảng và trả về
    return Array.from(latestMessages.values());
};

