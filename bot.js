const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const axios = require('axios'); // Для работы с API

// Ваш токен бота
const token = '7555699495:AAFBkB5VC_068K0WhU-cz5iz6oUCmDzLUYI';

// Инициализация бота
const bot = new TelegramBot(token, { polling: true });

// Пример базы данных для хранения пользователей (или загрузка из файла)
let users = loadData() || {};

// Обработка команды /start с параметром реферала
bot.onText(/\/start (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const startParam = match[1];  // Получаем параметр команды (например, "ref12345")

    if (startParam.startsWith('ref')) {
        const inviterId = startParam.replace('ref', ''); // Получаем ID пригласившего пользователя

        // Проверяем, был ли этот пользователь ранее зарегистрирован
        if (!users[chatId]) {
            // Добавляем приглашенного пользователя и его реферера в базу данных
            users[chatId] = {
                invitedBy: inviterId,
                tokens: 0, // начальный баланс
                isReferralRewarded: false
            };

            // Обновляем данные пригласившего
            if (users[inviterId]) {
                users[inviterId].referrals.push(chatId);
                // Начисляем токены за приглашение обоим пользователям
                giveReferralRewards(inviterId, chatId);
            } else {
                bot.sendMessage(chatId, 'Пригласивший вас пользователь не существует или его данные не найдены.');
            }

            // Сохраняем данные после регистрации
            saveData();
        } else {
            bot.sendMessage(chatId, 'Вы уже зарегистрированы.');
        }
    } else {
        bot.sendMessage(chatId, 'Добро пожаловать! Используйте реферальную ссылку для приглашения друзей.');
    }
});

// Начисление токенов обоим пользователям
function giveReferralRewards(inviterId, referredUserId) {
    const rewardAmount = 50000;

    // Начисляем 50,000 токенов пригласившему
    if (users[inviterId]) {
        users[inviterId].tokens += rewardAmount;
        bot.sendMessage(inviterId, `Вы получили ${rewardAmount} токенов за приглашение друга! Ваш баланс: ${users[inviterId].tokens} токенов.`);

        // Отправляем обновлённый баланс в приложение через API
        sendBalanceToApp(inviterId, users[inviterId].tokens);
    }

    // Начисляем 50,000 токенов приглашенному, если ему еще не начислены
    if (users[referredUserId] && !users[referredUserId].isReferralRewarded) {
        users[referredUserId].tokens += rewardAmount;
        users[referredUserId].isReferralRewarded = true;  // Отмечаем, что реферальная награда была выдана
        bot.sendMessage(referredUserId, `Вы получили ${rewardAmount} токенов за использование реферальной ссылки! Ваш баланс: ${users[referredUserId].tokens} токенов.`);

        // Отправляем обновлённый баланс в приложение через API
        sendBalanceToApp(referredUserId, users[referredUserId].tokens);
    }

    // Сохраняем данные после начисления токенов
    saveData();
}

// Функция для отправки баланса в приложение
function sendBalanceToApp(userId, balance) {
    axios.post('https://ваш-сервер-приложения/api/updateBalance', {
        userId: userId,
        balance: balance
    })
    .then(response => {
        console.log('Баланс успешно обновлён в приложении:', response.data);
    })
    .catch(error => {
        console.error('Ошибка при обновлении баланса в приложении:', error);
    });
}

// Сохранение данных в файл JSON
function saveData() {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

// Загрузка данных из файла при старте
function loadData() {
    if (fs.existsSync('users.json')) {
        const data = fs.readFileSync('users.json');
        return JSON.parse(data);
    }
    return {};
}

// Сохраняем данные пользователей каждые 60 секунд
setInterval(saveData, 60000);

// Обрабатываем команду /start без параметра
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    if (!users[chatId]) {
        users[chatId] = { tokens: 0, invitedBy: null, isReferralRewarded: false };
    }

    bot.sendMessage(chatId, 'Добро пожаловать в приложение! Пригласите друзей и получите 50,000 токенов.');
});
// Функция для генерации реферальной ссылки
function generateReferralLink() {
    const userId = 'USER_ID'; // Здесь должно быть ID текущего пользователя
    const referralLink = `https://t.me/condicii_bot?start=ref${userId}`;
    document.getElementById('referralLink').value = referralLink;
}

// Функция для копирования ссылки
function copyReferralLink() {
    const referralLink = document.getElementById('referralLink');
    referralLink.select();
    referralLink.setSelectionRange(0, 99999); // Для мобильных устройств
    document.execCommand('copy');
    alert("Ссылка скопирована!");
}

// Обновляем список рефералов
function updateReferralList(referrals) {
    const referralsContainer = document.getElementById('referralsContainer');
    referralsContainer.innerHTML = ''; // Очищаем контейнер

    referrals.forEach(referral => {
        const friendItem = document.createElement('div');
        friendItem.classList.add('friend-item');

        const name = document.createElement('p');
        name.innerText = referral.name;

        const profit = document.createElement('p');
        profit.classList.add('profit');
        profit.innerText = `Прибыль в час: +${referral.income}`;

        friendItem.appendChild(name);
        friendItem.appendChild(profit);
        referralsContainer.appendChild(friendItem);
    });
}

// Функция для начисления бонуса за рефералов
function collectReferralBonus() {
    const referralBonus = document.getElementById('referralBonus').innerText;
    balance += parseFloat(referralBonus);
    document.getElementById('referralBonus').innerText = '0.00';
    updateUI();
    alert('Бонус собран!');
}
