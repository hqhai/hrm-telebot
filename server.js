const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

// replace the value below with the Telegram token you receive from @BotFather
const token = '8438692443:AAHQjt2gfYRXmdsb_XW3wpBv1YpGH_bDQWw';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Chart configuration
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 800,
  height: 600,
  backgroundColour: 'white'
});

// Chart generation functions
async function generateBarChart(data, title = 'Biểu đồ cột') {
  const configuration = {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: data.label || 'Dữ liệu',
        data: data.values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 18 }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

async function generatePieChart(data, title = 'Biểu đồ tròn') {
  const configuration = {
    type: 'pie',
    data: {
      labels: data.labels,
      datasets: [{
        label: data.label || 'Dữ liệu',
        data: data.values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 18 }
        },
        legend: {
          display: true,
          position: 'right'
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

async function generateLineChart(data, title = 'Biểu đồ đường') {
  const configuration = {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: data.label || 'Dữ liệu',
        data: data.values,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 18 }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Matches "/weather [city]"
bot.onText(/\/weather (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const city = match[1]; // the captured city name

  // WeatherAPI configuration
  const API_KEY = process.env.WEATHER_API_KEY || '55dcc69442a6472c95e162734252709';
  const apiUrl = `https://api.weatherapi.com/v1/current.json?q=${city}&lang=vi&key=${API_KEY}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Xử lý dữ liệu JSON trả về từ WeatherAPI
    const temp = data.current.temp_c;
    const condition = data.current.condition.text;
    const humidity = data.current.humidity;
    const windSpeed = data.current.wind_kph;
    const feelsLike = data.current.feelslike_c;

    const message = `Thời tiết tại ${data.location.name}, ${data.location.country}:\n` +
                    `🌡️ Nhiệt độ: ${temp}°C (cảm giác như ${feelsLike}°C)\n` +
                    `🌤️ Tình hình: ${condition}\n` +
                    `💧 Độ ẩm: ${humidity}%\n` +
                    `💨 Tốc độ gió: ${windSpeed} km/h`;

    bot.sendMessage(chatId, message);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      bot.sendMessage(chatId, `Không tìm thấy thành phố "${city}".`);
    } else {
      console.error('Lỗi khi gọi API:', error.message);
      bot.sendMessage(chatId, 'Đã có lỗi xảy ra khi lấy dữ liệu thời tiết.');
    }
  }
});

// Chart command handlers
bot.onText(/\/chart_bar (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  try {
    const input = match[1];
    const [title, ...dataStr] = input.split('|');

    if (dataStr.length === 0) {
      bot.sendMessage(chatId, '❌ Format: /chart_bar Tiêu đề|nhãn1:giá_trị1,nhãn2:giá_trị2,...\nVí dụ: /chart_bar Doanh số|T1:100,T2:150,T3:200');
      return;
    }

    const pairs = dataStr[0].split(',');
    const labels = [];
    const values = [];

    pairs.forEach(pair => {
      const [label, value] = pair.split(':');
      if (label && value && !isNaN(value)) {
        labels.push(label.trim());
        values.push(parseFloat(value));
      }
    });

    if (labels.length === 0) {
      bot.sendMessage(chatId, '❌ Không tìm thấy dữ liệu hợp lệ!');
      return;
    }

    const chartData = {
      labels: labels,
      values: values,
      label: 'Giá trị'
    };

    const chartBuffer = await generateBarChart(chartData, title.trim());

    bot.sendPhoto(chatId, chartBuffer, {
      caption: `📊 ${title.trim()}`
    });

  } catch (error) {
    console.error('Lỗi tạo biểu đồ cột:', error);
    bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi tạo biểu đồ cột');
  }
});

bot.onText(/\/chart_pie (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  try {
    const input = match[1];
    const [title, ...dataStr] = input.split('|');

    if (dataStr.length === 0) {
      bot.sendMessage(chatId, '❌ Format: /chart_pie Tiêu đề|nhãn1:giá_trị1,nhãn2:giá_trị2,...\nVí dụ: /chart_pie Thị phần|A:30,B:25,C:45');
      return;
    }

    const pairs = dataStr[0].split(',');
    const labels = [];
    const values = [];

    pairs.forEach(pair => {
      const [label, value] = pair.split(':');
      if (label && value && !isNaN(value)) {
        labels.push(label.trim());
        values.push(parseFloat(value));
      }
    });

    if (labels.length === 0) {
      bot.sendMessage(chatId, '❌ Không tìm thấy dữ liệu hợp lệ!');
      return;
    }

    const chartData = {
      labels: labels,
      values: values,
      label: 'Phần trăm'
    };

    const chartBuffer = await generatePieChart(chartData, title.trim());

    bot.sendPhoto(chatId, chartBuffer, {
      caption: `🥧 ${title.trim()}`
    });

  } catch (error) {
    console.error('Lỗi tạo biểu đồ tròn:', error);
    bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi tạo biểu đồ tròn');
  }
});

bot.onText(/\/chart_line (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  try {
    const input = match[1];
    const [title, ...dataStr] = input.split('|');

    if (dataStr.length === 0) {
      bot.sendMessage(chatId, '❌ Format: /chart_line Tiêu đề|nhãn1:giá_trị1,nhãn2:giá_trị2,...\nVí dụ: /chart_line Tăng trưởng|Q1:10,Q2:15,Q3:12,Q4:20');
      return;
    }

    const pairs = dataStr[0].split(',');
    const labels = [];
    const values = [];

    pairs.forEach(pair => {
      const [label, value] = pair.split(':');
      if (label && value && !isNaN(value)) {
        labels.push(label.trim());
        values.push(parseFloat(value));
      }
    });

    if (labels.length === 0) {
      bot.sendMessage(chatId, '❌ Không tìm thấy dữ liệu hợp lệ!');
      return;
    }

    const chartData = {
      labels: labels,
      values: values,
      label: 'Giá trị'
    };

    const chartBuffer = await generateLineChart(chartData, title.trim());

    bot.sendPhoto(chatId, chartBuffer, {
      caption: `📈 ${title.trim()}`
    });

  } catch (error) {
    console.error('Lỗi tạo biểu đồ đường:', error);
    bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi tạo biểu đồ đường');
  }
});

// HRM statistics chart command
bot.onText(/\/hrm_stats/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    bot.sendMessage(chatId, '📊 Đang tạo biểu đồ thống kê HRM...');

    const sampleData = {
      labels: ['Đi làm đúng giờ', 'Đi muộn', 'Nghỉ có phép', 'Nghỉ không phép', 'Làm thêm giờ'],
      values: [85, 10, 3, 2, 25],
      label: 'Số ngày'
    };

    const chartBuffer = await generateBarChart(sampleData, 'Thống kê chấm công tháng này');

    bot.sendPhoto(chatId, chartBuffer, {
      caption: '📊 **Thống kê HRM tháng này**\n\n' +
               '✅ Đi làm đúng giờ: 85 ngày\n' +
               '⏰ Đi muộn: 10 ngày\n' +
               '📋 Nghỉ có phép: 3 ngày\n' +
               '❌ Nghỉ không phép: 2 ngày\n' +
               '🕒 Làm thêm giờ: 25 ngày',
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Lỗi tạo thống kê HRM:', error);
    bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi tạo thống kê HRM');
  }
});

// Profile handler function
async function handleProfileCommand(chatId) {

  // Authorization token - should be stored in environment variable for security
  const authToken = process.env.HRM_AUTH_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyTmFtZSI6InF1YW5naGFpQGF0bGFudGljLmVkdS52biIsIkZ1bGxOYW1lIjoiSMOgIFF1YW5nIEjhuqNpIiwiRW1haWwiOiJxdWFuZ2hhaUBhdGxhbnRpYy5lZHUudm4iLCJVc2VySWQiOiJjNzhhOWUwYy1jODY5LTRmYTUtMWM0Ni0wOGRjYjEzZmVmZWQiLCJTdWIiOiJiYXNlV2ViQXBpU3ViamVjdCIsIkp0aSI6IjBhYWEwOTFhLTA5YjItNDFlNS04NWU5LTBlZTQyODczYTA3ZCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlVzZXIiLCJSb2xlcyI6IlVzZXIiLCJleHAiOjE3NTk0MTEyMDksImlzcyI6ImJhc2VXZWJBcGlJc3N1ZXIiLCJhdWQiOiJiYXNlV2ViQXBpQXVkaWVuY2UifQ.t0eHMWXrLEiWJ_6z_7O4gVXZWW_mtp2yBHcMTD_cIVc';

  const apiUrl = 'https://user-hrm.atlanticgroup.vn/api/v1/user/get-user-profile';

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'vi-VN',
        'authorization': `Bearer ${authToken}`,
        'content-type': 'application/json',
        'origin': 'https://hrm.atlanticgroup.vn',
        'referer': 'https://hrm.atlanticgroup.vn/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
      }
    });

    const data = response.data;

    // Check if response is successful
    if (!data.isOK || data.statusCode !== 200) {
      bot.sendMessage(chatId, '❌ Không thể lấy thông tin profile từ hệ thống.');
      return;
    }

    const userData = data.result;

    // Format basic profile information
    const basicInfo = `👤 **THÔNG TIN CÁ NHÂN**\n\n` +
                     `🏷️ **Họ tên:** ${userData.fullName || 'N/A'}\n` +
                     `🆔 **Mã nhân viên:** ${userData.code || 'N/A'}\n` +
                     `📧 **Email:** ${userData.email || 'N/A'}\n` +
                     `📱 **Số điện thoại:** ${userData.phoneNumber || 'N/A'}\n` +
                     `🎂 **Ngày sinh:** ${userData.dayOfBirth ? new Date(userData.dayOfBirth).toLocaleDateString('vi-VN') : 'N/A'}\n` +
                     `👥 **Giới tính:** ${userData.gender || 'N/A'}`;

    // Format work information
    let workInfo = `\n\n💼 **THÔNG TIN CÔNG VIỆC**\n\n`;
    workInfo += `📊 **Trạng thái:** ${userData.workingStatus || 'N/A'}\n`;

    if (userData.userDepartmentPositions && userData.userDepartmentPositions.length > 0) {
      const position = userData.userDepartmentPositions[0];
      workInfo += `🏢 **Phòng ban:** ${position.nameDepartment || 'N/A'}\n`;
      workInfo += `👔 **Chức vụ:** ${position.namePosition || 'N/A'}\n`;
      workInfo += `⏰ **Loại nhân sự:** ${position.typeOfPersonnel === 'FullTime' ? 'Toàn thời gian' : position.typeOfPersonnel || 'N/A'}\n`;
    }

    if (userData.probationDay) {
      workInfo += `📅 **Ngày thử việc:** ${new Date(userData.probationDay).toLocaleDateString('vi-VN')}\n`;
    }
    if (userData.officialDay) {
      workInfo += `📅 **Ngày chính thức:** ${new Date(userData.officialDay).toLocaleDateString('vi-VN')}\n`;
    }

    const fullMessage = basicInfo + workInfo;

    // Create inline keyboard with buttons
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 Chi tiết thêm', callback_data: 'profile_details' },
            { text: '🔄 Làm mới', callback_data: 'profile_refresh' }
          ],
          [
            { text: '📱 Liên hệ', callback_data: 'profile_contact' },
            { text: '📋 Báo cáo', callback_data: 'profile_report' }
          ]
        ]
      },
      parse_mode: 'Markdown'
    };

    bot.sendMessage(chatId, fullMessage, inlineKeyboard);

  } catch (error) {
    console.error('Lỗi khi lấy thông tin profile:', error.message);
    console.error('Chi tiết lỗi:', error.response?.data || error);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 401:
          bot.sendMessage(chatId, `❌ Token hết hạn hoặc không hợp lệ.\n🔧 Chi tiết: ${errorData?.message || 'Unauthorized'}\n💡 Vui lòng cập nhật token trong biến môi trường HRM_AUTH_TOKEN.`);
          break;
        case 403:
          bot.sendMessage(chatId, '❌ Không có quyền truy cập. Kiểm tra lại quyền của token.');
          break;
        case 404:
          bot.sendMessage(chatId, '❌ Không tìm thấy thông tin profile hoặc API endpoint đã thay đổi.');
          break;
        case 500:
          bot.sendMessage(chatId, '❌ Lỗi server HRM. Vui lòng thử lại sau.');
          break;
        default:
          bot.sendMessage(chatId, `❌ Lỗi HTTP ${status}: ${errorData?.message || error.message}`);
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      bot.sendMessage(chatId, '❌ Không thể kết nối đến server HRM. Kiểm tra kết nối mạng hoặc URL API.');
    } else {
      bot.sendMessage(chatId, `❌ Lỗi không xác định: ${error.message}`);
    }
  }
}

// Matches "/profile"
bot.onText(/\/profile/, async (msg) => {
  const chatId = msg.chat.id;
  await handleProfileCommand(chatId);
});

// Handle inline keyboard button clicks
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  const chatId = message.chat.id;

  // Answer callback query to remove loading spinner
  await bot.answerCallbackQuery(callbackQuery.id);

  switch (data) {
    case 'profile_details':
      // Show additional profile details
      const detailsText = `📋 **THÔNG TIN BỔ SUNG**\n\n` +
                         `🏥 Bảo hiểm y tế: Có\n` +
                         `💰 Lương cơ bản: Theo hợp đồng\n` +
                         `📅 Ngày nghỉ còn lại: 12 ngày\n` +
                         `🎯 Mục tiêu tháng: Hoàn thành dự án A`;

      bot.sendMessage(chatId, detailsText, { parse_mode: 'Markdown' });
      break;

    case 'profile_refresh':
      // Refresh profile data
      bot.sendMessage(chatId, '🔄 Đang làm mới thông tin...');
      // Trigger profile command again
      setTimeout(() => {
        bot.emit('text', { chat: { id: chatId }, text: '/profile' }, [null, '']);
      }, 1000);
      break;

    case 'profile_contact':
      // Show contact options
      const contactKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📧 Email HR', url: 'mailto:hr@company.com' },
              { text: '📱 Gọi điện', url: 'tel:+84123456789' }
            ],
            [
              { text: '💬 Chat với HR', callback_data: 'chat_hr' }
            ]
          ]
        }
      };

      bot.sendMessage(chatId, '📞 **Thông tin liên hệ:**', contactKeyboard);
      break;

    case 'profile_report':
      // Generate report
      const reportText = `📊 **BÁO CÁO THÁNG ${new Date().getMonth() + 1}/${new Date().getFullYear()}**\n\n` +
                        `✅ Nhiệm vụ hoàn thành: 15/18\n` +
                        `⏰ Số giờ làm việc: 168h\n` +
                        `📈 Hiệu suất: 85%\n` +
                        `🎯 Đánh giá: Tốt`;

      bot.sendMessage(chatId, reportText, { parse_mode: 'Markdown' });
      break;

    case 'chat_hr':
      bot.sendMessage(chatId, '💬 Để liên hệ với HR, vui lòng gửi tin nhắn bắt đầu bằng "HR: [nội dung]"');
      break;

    default:
      bot.sendMessage(chatId, '❌ Chức năng này chưa được triển khai.');
  }
});

// Handle /start command with reply keyboard
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const replyKeyboard = {
    reply_markup: {
      keyboard: [
        ['👤 Profile', '🌤️ Thời tiết'],
        ['📊 Báo cáo', '📈 Biểu đồ'],
        ['⚙️ Cài đặt', '📞 Liên hệ'],
        ['❓ Trợ giúp']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };

  bot.sendMessage(chatId, 'Chào mừng! Chọn một tùy chọn:', replyKeyboard);
});

// Handle reply keyboard button presses
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Bỏ qua tất cả các lệnh bắt đầu bằng /
  if (text && text.startsWith('/')) {
    return;
  }

  // Handle reply keyboard buttons
  switch (text) {
    case '👤 Profile':
      // Call profile functionality directly
      handleProfileCommand(chatId);
      break;
    case '🌤️ Thời tiết':
      bot.sendMessage(chatId, 'Nhập: /weather [tên thành phố]');
      break;
    case '📊 Báo cáo':
      bot.sendMessage(chatId, 'Chức năng báo cáo đang phát triển...');
      break;
    case '📈 Biểu đồ':
      const chartMenu = `📈 **Menu Biểu đồ:**\n\n` +
                       `📊 \`/chart_bar Tiêu đề|nhãn1:giá_trị1,nhãn2:giá_trị2\`\n` +
                       `   Tạo biểu đồ cột\n\n` +
                       `🥧 \`/chart_pie Tiêu đề|nhãn1:giá_trị1,nhãn2:giá_trị2\`\n` +
                       `   Tạo biểu đồ tròn\n\n` +
                       `📈 \`/chart_line Tiêu đề|nhãn1:giá_trị1,nhãn2:giá_trị2\`\n` +
                       `   Tạo biểu đồ đường\n\n` +
                       `📊 \`/hrm_stats\`\n` +
                       `   Xem thống kê HRM mẫu\n\n` +
                       `**Ví dụ:**\n` +
                       `\`/chart_bar Doanh số|T1:100,T2:150,T3:200\``;
      bot.sendMessage(chatId, chartMenu, { parse_mode: 'Markdown' });
      break;
    case '⚙️ Cài đặt':
      bot.sendMessage(chatId, 'Chức năng cài đặt đang phát triển...');
      break;
    case '📞 Liên hệ':
      bot.sendMessage(chatId, 'Email: support@company.com\nPhone: 0123-456-789');
      break;
    case '❓ Trợ giúp':
      const helpText = `🤖 **Hướng dẫn sử dụng bot:**\n\n` +
                      `📋 **Các lệnh cơ bản:**\n` +
                      `/start - Hiển thị menu chính\n` +
                      `/profile - Xem thông tin cá nhân\n` +
                      `/weather [thành phố] - Xem thời tiết\n` +
                      `/echo [tin nhắn] - Lặp lại tin nhắn\n\n` +
                      `📈 **Lệnh biểu đồ:**\n` +
                      `/chart_bar - Tạo biểu đồ cột\n` +
                      `/chart_pie - Tạo biểu đồ tròn\n` +
                      `/chart_line - Tạo biểu đồ đường\n` +
                      `/hrm_stats - Thống kê HRM`;
      bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
      break;
    default:
      bot.sendMessage(chatId, 'Vui lòng chọn một tùy chọn từ menu hoặc sử dụng lệnh /help');
  }
});