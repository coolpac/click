// Переменные
let balance = parseInt(localStorage.getItem('balance')) || 10000;  // Начальный баланс с сохранением прогресса
let energy = parseInt(localStorage.getItem('energy')) || 1000;     // Энергия с сохранением прогресса
let maxEnergy = 1000;
let lastEnergyRestore = localStorage.getItem('lastEnergyRestore') ? new Date(localStorage.getItem('lastEnergyRestore')) : new Date();  // Время последнего восстановления энергии

let buildings = JSON.parse(localStorage.getItem('buildings')) || [
    { name: "Ивент агентство", level: 0, cost: 1000, income: 0 },  // У новых пользователей уровень = 0, доход = 0
    { name: "Лидер мнений", level: 0, cost: 2000, income: 0 },
    { name: "Торговый центр", level: 0, cost: 3000, income: 0 },
];

let accumulatedIncome = 0;  // Накопленный доход для расчета до целого числа

// Закрытие экрана загрузки
window.onload = function () {
    setTimeout(function () {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('bottom-menu').style.display = 'flex'; // Показать меню после загрузки
        calculateOfflineEarnings();
        restoreEnergy();  // Восстановление энергии при загрузке
        generateBuildingCards(); // Генерация карточек при загрузке
        startIncomeCalculation(); // Начало расчета дохода
        updateUI();  // Обновление UI
    }, 2000);
}

// Обновление нижнего меню при смене вкладки
document.getElementById('earningsMenu').addEventListener('click', function () {
    hideAllTabs();
    showEarningsTab();
    activateMenuTab('earningsMenu');
});
document.getElementById('homeMenu').addEventListener('click', function () {
    hideAllTabs();
    showMainElements();
    activateMenuTab('homeMenu');
});
document.getElementById('friendsMenu').addEventListener('click', function () {
    hideAllTabs();
    showFriendsTab();
    activateMenuTab('friendsMenu');
});

// Активируем вкладку в меню
function activateMenuTab(activeId) {
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach(button => button.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

// Универсальные функции для скрытия всех элементов
function hideAllTabs() {
    document.getElementById('earningsTab').style.display = 'none';
    document.getElementById('friendsTab').style.display = 'none';
    hideMainElements();
}

// Скрываем элементы главной страницы
function hideMainElements() {
    document.querySelector('.top-bar').style.display = 'none';
    document.querySelector('.balance-section').style.display = 'none';
    document.querySelector('.main-character').style.display = 'none';
    document.querySelector('.energy-section').style.display = 'none';
}

// Показываем элементы главной страницы
function showMainElements() {
    document.querySelector('.top-bar').style.display = 'flex';
    document.querySelector('.balance-section').style.display = 'block';
    document.querySelector('.main-character').style.display = 'block';
    document.querySelector('.energy-section').style.display = 'block';
    updateUI();  // Обновляем данные на главной странице
}

// Функция для показа вкладки заработка
function showEarningsTab() {
    document.getElementById('earningsTab').style.display = 'block'; // Показываем вкладку заработка
    generateBuildingCards();  // Генерация карточек при переходе во вкладку заработка
    updateUI();  // Обновляем данные в интерфейсе
}

// Функция для показа вкладки друзей
function showFriendsTab() {
    document.getElementById('friendsTab').style.display = 'block'; // Показываем вкладку друзей
}

// Функция для генерации карточек зданий
function generateBuildingCards() {
    const container = document.getElementById('earningsContainer');
    container.innerHTML = '';  // Очищаем контейнер перед обновлением карточек

    buildings.forEach((building, index) => {
        const card = document.createElement('div');
        card.classList.add('card');

        const image = document.createElement('img');
        image.src = 'building-icon.png';  // Иконка здания

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('info');
        const buildingName = document.createElement('h3');
        buildingName.innerText = building.name;
        const buildingLevel = document.createElement('p');
        buildingLevel.classList.add('level');
        buildingLevel.innerText = `Уровень: ${building.level}`;
        const buildingIncome = document.createElement('p');
        buildingIncome.classList.add('income');
        buildingIncome.innerText = `Доход: ${building.income} в час`;

        infoDiv.appendChild(buildingName);
        infoDiv.appendChild(buildingLevel);
        infoDiv.appendChild(buildingIncome);

        const upgradeButton = document.createElement('button');
        upgradeButton.innerText = `Улучшить (${building.cost})`;
        upgradeButton.classList.add('upgrade-button');
        upgradeButton.onclick = () => upgradeBuilding(index);

        card.appendChild(image);
        card.appendChild(infoDiv);
        card.appendChild(upgradeButton);
        container.appendChild(card);
    });
}

// Улучшение здания
function upgradeBuilding(index) {
    const building = buildings[index];

    if (balance >= building.cost && building.level < 20) {
        balance -= building.cost;
        building.level += 1;
        building.income += 50;
        building.cost = Math.round(building.cost * 1.5);
        localStorage.setItem('balance', balance);
        localStorage.setItem('buildings', JSON.stringify(buildings));
        updateUI();
        generateBuildingCards();  // Перегенерируем карточки после улучшения
    } else {
        alert('Недостаточно средств или максимальный уровень достигнут!');
    }
}

// Обновление данных на странице
function updateUI() {
    document.getElementById('tokenBalance').innerText = Math.floor(balance);
    document.getElementById('balance').innerText = Math.floor(balance);
    const totalIncomePerHour = buildings.reduce((sum, building) => sum + building.income, 0);
    document.getElementById('hourlyIncome').innerText = `${totalIncomePerHour} доход / час`;
    document.getElementById('hourlyIncomeEarnings').innerText = `${totalIncomePerHour} доход / час`; // Обновление во вкладке заработка

    // Обновляем энергию
    document.getElementById('energyStatus').innerText = `${energy} / ${maxEnergy} энергии`;
}

// Анимация чеканки мяча
function handleTap() {
    if (energy > 0) {
        energy -= 1;
        const ball = document.getElementById('ball');

        // Добавляем доход от тапа
        balance += 1;
        updateUI();

        // Анимация мяча: падение с руки на ногу, отскок обратно
        ball.classList.add('fall');
        setTimeout(() => {
            ball.classList.remove('fall');
            ball.classList.add('bounce');  // Отбивание мяча
        }, 500);

        setTimeout(() => {
            ball.classList.remove('bounce');  // Возвращение мяча на место
        }, 1000);

        localStorage.setItem('energy', energy);
        localStorage.setItem('balance', balance);
        updateUI();
    } else {
        alert("Энергия закончилась! Подождите, пока она восстановится.");
    }
}

// Делать тап по мальчику или по мячу
document.getElementById('character').addEventListener('click', handleTap);
document.getElementById('ball').addEventListener('click', handleTap);

// Анимации для мяча
const style = document.createElement('style');
style.innerHTML = `
@keyframes fall {
    0% { top: 40px; }
    100% { top: 100px; }
}

@keyframes bounce {
    0% { top: 100px; }
    50% { top: 40px; }
    100% { top: 40px; }
}

.ball.fall {
    animation: fall 0.5s ease-in-out forwards;
}

.ball.bounce {
    animation: bounce 0.5s ease-in-out forwards;
}
`;
document.head.appendChild(style);

// Рассчитываем и начисляем оффлайн доход
function calculateOfflineEarnings() {
    const currentTime = new Date();
    const offlineTime = Math.floor((currentTime - lastEnergyRestore) / 1000 / 60); // Время оффлайн в минутах
    const totalIncomePerHour = buildings.reduce((sum, building) => sum + building.income, 0);
    const offlineIncome = (totalIncomePerHour / 60) * offlineTime;  // Рассчитываем доход за оффлайн

    if (offlineIncome > 0) {
        balance += Math.floor(offlineIncome);
        localStorage.setItem('balance', balance);
        lastEnergyRestore = new Date();
        localStorage.setItem('lastEnergyRestore', lastEnergyRestore);
        updateUI();
    }
}

// Восстановление энергии
function restoreEnergy() {
    const currentTime = new Date();
    const minutesPassed = Math.floor((currentTime - lastEnergyRestore) / 1000 / 60); // Время оффлайн в минутах
    const energyToRestore = Math.min(maxEnergy, energy + minutesPassed);  // Максимум 1000 энергии

    energy = energyToRestore;
    localStorage.setItem('energy', energy);
    lastEnergyRestore = new Date();
    localStorage.setItem('lastEnergyRestore', lastEnergyRestore);
    updateUI(); // Обновление UI с новой энергией
}

// Запуск восстановления энергии каждую минуту
setInterval(() => {
    restoreEnergy();
}, 60000); // Восстановление энергии каждые 60 секунд

// Начисление дохода за карточки каждую секунду
function startIncomeCalculation() {
    setInterval(() => {
        const totalIncomePerSecond = buildings.reduce((sum, building) => sum + (building.income / 3600), 0);
        accumulatedIncome += totalIncomePerSecond;

        if (accumulatedIncome >= 1) {
            balance += Math.floor(accumulatedIncome);
            accumulatedIncome -= Math.floor(accumulatedIncome);
            localStorage.setItem('balance', balance);
            updateUI();
        }
    }, 1000); // Каждую секунду проверяем начисления
}
// Предположим, что у каждого пользователя есть свой уникальный идентификатор
const userId = 'USER_ID'; // Здесь должно быть ID текущего пользователя, замените это на реальный ID

// Функция для генерации реферальной ссылки
function generateReferralLink() {
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
