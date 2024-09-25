// Переменные
let energy = 1000; // Максимальная энергия
let balance = 10000;  // Начальный баланс
const balanceDisplay = document.getElementById('balance');

// Здания и их параметры
const buildings = [
    {
        name: "Ивент агентство",
        level: 1,
        cost: 1000,
        income: 50
    },
    {
        name: "Лидер мнений",
        level: 1,
        cost: 2000,
        income: 100
    },
    {
        name: "Торговый центр",
        level: 1,
        cost: 3000,
        income: 150
    },
];

// Показать загрузочный экран
window.onload = function() {
    setTimeout(function() {
        document.getElementById('loading-screen').style.display = 'none';
        showProfitPopup();
    }, 2000); // Показываем главный экран через 2 секунды
}

// Функция для показа всплывающего окна с прибылью
function showProfitPopup() {
    const profitPopup = document.getElementById('profit-popup');
    profitPopup.style.display = 'block';
}

// Обработчик получения прибыли
function collectProfit() {
    alert("Прибыль собрана!");
    document.getElementById('profit-popup').style.display = 'none';
}

// Функция для анимации чеканки мяча
document.getElementById('character').addEventListener('click', function () {
    if (energy > 0) {
        energy -= 1; // Уменьшаем энергию за клик

        // Анимация персонажа и мяча
        let character = document.getElementById('character');
        let ball = document.getElementById('ball');

        character.classList.add('kick');
        ball.classList.add('bounce');

        // Убираем анимацию через 0.5 секунды
        setTimeout(function () {
            character.classList.remove('kick');
            ball.classList.remove('bounce');
        }, 500);
    } else {
        alert("У вас закончилась энергия!");
    }
});

// Добавляем CSS для анимации через JS
const style = document.createElement('style');
style.innerHTML = `
    @keyframes kick {
        0% { transform: rotate(0); }
        50% { transform: rotate(-10deg); }
        100% { transform: rotate(0); }
    }

    @keyframes bounce {
        0% { transform: translateY(0); }
        50% { transform: translateY(-50px); }
        100% { transform: translateY(0); }
    }

    .character.kick {
        animation: kick 0.5s ease-in-out;
    }

    .ball.bounce {
        animation: bounce 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);

// Функция для показа вкладки заработка
function showEarningsTab() {
    const earningsTab = document.getElementById('earningsTab');
    const mainMenu = document.querySelector('body > .top-bar');  // Основное меню
    const balanceSection = document.querySelector('.balance-section');
    const energySection = document.querySelector('.energy-section');
    const bottomMenu = document.querySelector('.bottom-menu');

    // Скрываем главное меню и показываем вкладку заработка
    mainMenu.style.display = 'none';
    balanceSection.style.display = 'none';
    energySection.style.display = 'none';
    bottomMenu.style.display = 'none';
    earningsTab.style.display = 'block';

    generateBuildingCards();  // Генерируем карточки для улучшений
}

// Функция для возвращения на главный экран
function goBackToMain() {
    const earningsTab = document.getElementById('earningsTab');
    const mainMenu = document.querySelector('body > .top-bar');  // Основное меню
    const balanceSection = document.querySelector('.balance-section');
    const energySection = document.querySelector('.energy-section');
    const bottomMenu = document.querySelector('.bottom-menu');

    // Скрываем вкладку заработка и показываем главное меню
    earningsTab.style.display = 'none';
    mainMenu.style.display = 'flex';
    balanceSection.style.display = 'block';
    energySection.style.display = 'block';
    bottomMenu.style.display = 'flex';
}

// Обработчик для кнопки "Заработок"
document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        if (this.innerText === "Заработок") {
            showEarningsTab();
        }
    });
});

// Функция для генерации карточек зданий
function generateBuildingCards() {
    const container = document.getElementById('earningsContainer');
    container.innerHTML = '';  // Очищаем контейнер перед обновлением карточек

    buildings.forEach((building, index) => {
        const card = document.createElement('div');
        card.classList.add('card');

        // Информация о здании
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

        // Кнопка улучшения
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
        balanceDisplay.innerText = balance;

        // Механика увеличения стоимости и дохода
        if (building.level <= 5) {
            building.cost = Math.round(building.cost * 1.5);  // До 5 уровня увеличение на 50%
        } else {
            const incrementPercentage = 52 + (building.level - 6) * 2;  // Увеличение стоимости: 52% для 6 уровня и далее
            building.cost = Math.round(building.cost * (1 + incrementPercentage / 100));
        }

        building.income = Math.round(building.income * 1.4);  // Доход увеличивается на 40%

        generateBuildingCards();
    } else {
        alert('Недостаточно средств или максимальный уровень достигнут!');
    }
}

// Функция для начисления прибыли каждый час
function addIncome() {
    buildings.forEach(building => {
        balance += building.income;
    });
    balanceDisplay.innerText = balance;
}

// Запуск начисления дохода раз в час
setInterval(addIncome, 3600000);  // 3600000 мс = 1 час

// Инициализация карточек при загрузке
generateBuildingCards();
