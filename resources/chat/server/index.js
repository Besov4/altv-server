const alt = require('alt-server');
import { CHAT_MESSAGE_EVENT } from "../shared/index.js";

// Подключение к базе данных
const mysql = require('mysql2/promise');
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Never0665338464ivaN',
    database: 'gta_rp_server'
});

let cmdHandlers = {};
let mutedPlayers = new Map();

function invokeCmd(player, cmd, args) {
    cmd = cmd.toLowerCase();
    const callback = cmdHandlers[cmd];

    if (callback) {
        callback(player, args);
    } else {
        send(player, `{FF0000} Unknown command /${cmd}`);
    }
}

alt.onClient(CHAT_MESSAGE_EVENT, (player, msg) => {
    if (msg[0] === "/") {
        msg = msg.trim().slice(1);

        if (msg.length > 0) {
            alt.log("[chat:cmd] " + player.name + ": /" + msg);

            let args = msg.split(" ");
            let cmd = args.shift();

            invokeCmd(player, cmd, args);
        }
    } else {
        if (mutedPlayers.has(player) && mutedPlayers.get(player)) {
            send(player, "{FF0000} You are currently muted.");
            return;
        }

        msg = msg.trim();

        if (msg.length > 0) {
            alt.log("[chat:msg] " + player.name + ": " + msg);

            alt.emitAllClients(CHAT_MESSAGE_EVENT, player.name, msg);
        }
    }
});

export function send(player, msg) {
    if (!player) {
        alt.logError("[chat.send] player parameter should not be null, use chat.broadcast instead.");
        return;
    }

    alt.emitClient(player, CHAT_MESSAGE_EVENT, null, msg);
}

export function broadcast(msg) {
    alt.emitAllClients(CHAT_MESSAGE_EVENT, null, msg);
}

export function registerCmd(cmd, callback) {
    cmd = cmd.toLowerCase();

    if (cmdHandlers[cmd] !== undefined) {
        alt.logError(`Failed to register command /${cmd}, already registered`);
    } else {
        cmdHandlers[cmd] = callback;
    }
}

registerCmd('register', async (player, args) => {
    alt.log("Команда /register вызвана с аргументами: " + JSON.stringify(args));

    if (args.length < 5) {
        send(player, 'Используйте команду: /register <имя> <email> <пароль> <discordId> <rockstarId>');
        return;
    }

    const [username, email, password, discordId, rockstarId] = args;

    alt.log(`Попытка регистрации: ${username}, ${email}, ${password}, ${discordId}, ${rockstarId}`);

    const result = await registerPlayer(username, email, password, discordId, rockstarId);

    if (result.success) {
        alt.log("Регистрация успешна для " + username);
        send(player, 'Регистрация прошла успешно. Войдите в игру.');
    } else {
        alt.log("Регистрация не удалась: " + result.message);
        send(player, result.message);
    }
});

async function registerPlayer(username, email, password, discordId, rockstarId) {
    try {
        const [rows] = await connection.execute('SELECT * FROM accounts WHERE email = ?', [email]);
        if (rows.length > 0) {
            return { success: false, message: 'Email уже зарегистрирован.' };
        }

        await connection.execute(
            'INSERT INTO accounts (username, email, password_hash, discord_id, rockstar_id, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, password, discordId, rockstarId, 'user']
        );

        alt.log('Регистрация прошла успешно для пользователя: ' + username);
        return { success: true };
    } catch (error) {
        alt.logError("Ошибка при регистрации: " + error.message);
        return { success: false, message: 'Ошибка регистрации.' };
    }
}
