// Переменные
let balance = parseInt(localStorage.getItem('balance')) || 10000;  // Начальный баланс с сохранением прогресса
let energy = parseInt(localStorage.getItem('energy')) || 1000;     // Энергия с сохранением прогресса
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
        calculateOfflineEarnings();
        restoreEnergy();  // Восстановление энергии при загрузке
    }, 2000);
}

// Расчет дохода в оффлайне
function calculateOfflineEarnings() {
    const currentVisit = new Date();
    const offlineTime = (currentVisit - lastVisit) / (1000 * 60 * 60); // Время в часах
    const totalIncomePerHour = buildings.reduce((sum, building) => sum + building.income, 0);
    const offlineEarnings = Math.floor(totalIncomePerHour * offlineTime);  // Доход за время оффлайна

    if (offlineEarnings > 0 && totalIncomePerHour > 0) {
        document.getElementById('profitAmount').innerText = `${offlineEarnings}`;
        document.getElementById('profitValue').innerText = `${offlineEarnings}`;
        document.getElementById('profit-popup').style.display = 'block';
    }

    localStorage.setItem('lastVisit', currentVisit);
}

// Обработчик получения прибыли в оффлайне
function collectProfit() {
    const profitAmount = parseInt(document.getElementById('profitAmount').innerText);
    balance += profitAmount;
    localStorage.setItem('balance', balance);
    updateUI();
    document.getElementById('profit-popup').style.display = 'none';
}

// Обновление данных на странице
function updateUI() {
    document.getElementById('tokenBalance').innerText = Math.floor(balance);
    document.getElementById('balance').innerText = Math.floor(balance);
    document.getElementById('energyStatus').innerText = `${energy} / 1000 энергии`;

    const totalIncomePerHour = buildings.reduce((sum, building) => sum + building.income, 0);
    document.getElementById('hourlyIncome').innerText = `${totalIncomePerHour} доход / час`;
}

// Восстановление энергии
function restoreEnergy() {
    const now = new Date();
    const timePassed = (now - lastEnergyRestore) / (1000 * 60);  // Время в минутах
    const energyRestored = Math.floor(timePassed / 0.06);  // Восстанавливается 1000 энергии за 60 минут

    energy = Math.min(energy + energyRestored, 1000);
    lastEnergyRestore = new Date();

    localStorage.setItem('energy', energy);
    localStorage.setItem('lastEnergyRestore', lastEnergyRestore);
    updateUI();
}

// Обновление баланса и дохода каждую секунду
setInterval(function () {
    const totalIncomePerSecond = buildings.reduce((sum, building) => sum + (building.income / 3600), 0);
    accumulatedIncome += totalIncomePerSecond;

    if (accumulatedIncome >= 1) {
        balance += Math.floor(accumulatedIncome);  // Добавляем только целое число к балансу
        accumulatedIncome = accumulatedIncome % 1;  // Оставляем остаток для следующего шага
        localStorage.setItem('balance', Math.floor(balance));  // Обновляем баланс
        updateUI();
    }

    restoreEnergy();  // Восстанавливаем энергию каждую минуту
}, 1000);

// Анимация чеканки мяча
document.getElementById('character').addEventListener('click', function () {
    if (energy > 0) {
        energy -= 1;
        const character = document.getElementById('character');
        const ball = document.getElementById('ball');

        // Добавляем доход от тапа
        balance += 1;
        updateUI();

        // Анимация падающего мяча
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
});

// Функция для показа вкладки заработка
function showEarningsTab() {
    document.getElementById('earningsTab').style.display = 'block';
    document.querySelector('.top-bar').style.display = 'none';
    document.querySelector('.balance-section').style.display = 'none';
    document.querySelector('.main-character').style.display = 'none';
    document.querySelector('.energy-section').style.display = 'none';
    document.querySelector('.bottom-menu').style.display = 'none';

    generateBuildingCards();
}

// Функция для возвращения на главный экран
function goBackToMain() {
    document.getElementById('earningsTab').style.display = 'none';
    document.querySelector('.top-bar').style.display = 'flex';
    document.querySelector('.balance-section').style.display = 'block';
    document.querySelector('.main-character').style.display = 'block';
    document.querySelector('.energy-section').style.display = 'block';
    document.querySelector('.bottom-menu').style.display = 'flex';
}

// Обработчик для кнопки "Заработок"
document.getElementById('openEarnings').addEventListener('click', function () {
    showEarningsTab();
});

// Функция для генерации карточек зданий
function generateBuildingCards() {
    const container = document.getElementById('earningsContainer');
    container.innerHTML = '';  // Очищаем контейнер перед обновлением карточек

    buildings.forEach((building, index) => {
        const card = document.createElement('div');
        card.classList.add('card');

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
        upgradeButton.onclick = () => upgradeBuilding(index);

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
        generateBuildingCards();
    } else {
        alert('Недостаточно средств или максимальный уровень достигнут!');
    }
}

// Добавляем стили для анимации
const style = document.createElement('style');
style.innerHTML = `
@keyframes kick {
    0% { transform: rotate(0); }
    50% { transform: rotate(-10deg); }
    100% { transform: rotate(0); }
}

@keyframes fall {
    0% { top: -40px; }
    100% { top: 50px; }
}

@keyframes bounce {
    0% { top: 50px; }
    50% { top: -20px; }
    100% { top: -40px; }
}

.character.kick {
    animation: kick 0.5s ease-in-out;
}

.ball.fall {
    animation: fall 0.5s ease-in-out forwards;
}

.ball.bounce {
    animation: bounce 0.5s ease-in-out forwards;
}
`;
document.head.appendChild(style);
