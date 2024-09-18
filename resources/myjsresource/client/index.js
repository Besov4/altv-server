const alt = require('alt-client');

alt.on("keyup", (key) => {
    if (key === 0x54) { // Если нажата клавиша T
        alt.log("Клавиша T была нажата."); // Проверка на нажатие клавиши
        let input = prompt("Введите команду:"); // Открывается поле для ввода чата
        if (input !== null && input !== "") {
            alt.emitServer("chatMessage", input); // Отправляем сообщение на сервер
            alt.log("Сообщение отправлено на сервер: " + input); // Проверка отправки на сервер
        }
    }
});


const alt = require('alt-client');

// Пример для тестовой регистрации при нажатии клавиши 'R'
alt.on('keyup', (key) => {
    if (key === 0x52) { // Клавиша 'R'
        const username = 'TestUser';   // Пример имени пользователя
        const email = 'testuser@example.com';  // Пример email
        const password = 'testpassword';  // Пример пароля
        const discordId = 'test_discord_id';  // Пример Discord ID
        const rockstarId = 'test_rockstar_id';  // Пример Rockstar ID

        alt.emitServer('register', username, email, password, discordId, rockstarId);
    }
});

alt.on("chatMessage", (message) => {
    console.log(message); // Сообщение от сервера будет выводиться в консоль
});
alt.log("Клиентский скрипт загружен.");
