const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const token = "5739655819:AAHcb5UhXFSKt26mrGTY_nGjpPL24sY6dYc";
const webAppUrl = "https://tourmaline-stardust-0dfef9.netlify.app";

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on("message", async (msg) => {
	const chatId = msg.chat.id;
	const text = msg.text;

	if (text === "/start") {
		// await bot.sendMessage(chatId, "Бот временно не работает");
		await bot.sendMessage(chatId, "Ниже появится кнопка, заполни форму", {
			reply_markup: {
				keyboard: [
					[{ text: "Заполнить форму", web_app: { url: webAppUrl + "/form" } }],
				],
			},
		});
		await bot.sendMessage(chatId, "Перейти в магазин ", {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Заполнить форму", web_app: { url: webAppUrl } }],
				],
			},
		});
	}
	if (msg?.web_app_data?.data) {
		try {
			const data = JSON.parse(msg?.web_app_data?.data);
			await bot.sendMessage(chatId, "Спасибо за обратную связь");
			await bot.sendMessage(chatId, "Ваша страна: " + data?.country);
			await bot.sendMessage(chatId, "Ваша улица: " + data?.street);

			setTimeout(async () => {
				await bot.sendMessage(chatId, "Всю информацию вы получите в этом чате");
			}, 3000);
		} catch (e) {
			console.log(e);
		}
	}
});

app.post("/web-data", async (req, res) => {
	const { queryId, product, total } = req.body;
	try {
		await bot.answerWebAppQuery(queryId, {
			type: "article",
			id: queryId,
			title: "succes",
			input_message_content: {
				message_text: `Поздровляем с покупокй ${product}! \n Сумма покупки ${total}`,
			},
		});
		return res.status(200);
	} catch (error) {
		await bot.answerWebAppQuery(queryId, {
			type: "article",
			id: queryId,
			title: "Не удалось приобрести товар",
			input_message_content: {
				message_text: `К сожалению на данный момент покупка "${product}" невозможна`,
			},
		});
		return res.status(500).json({});
	}
});

const PORT = 8000;
app.listen(PORT, () => {
	console.log(`server started at port ${PORT}`);
});
