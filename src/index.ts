import { Elysia, t } from "elysia";
import Logger from "./Logger";
import config from "./config";
import axios from "axios";

process.on('unhandledRejection', (reason, promise) => Logger.error(`Unhandled rejection at: "${promise}". Reason: "${reason}"`));
process.on('uncaughtException', (error) => Logger.error(`Unhandled exception: "${error}"`));

new Elysia()
.onStart(() => Logger.info(`Elysia listening on port ${config.port}!`))
.onError(({ code, set, error: { message: error } }) => {
    if(code == 'VALIDATION') {
        set.status = 400;
        return { error };
    } else if(code == 'NOT_FOUND') {
        set.status = 404;
        return { error: `Not found` };
    } else {
        set.status = 500;
        Logger.error(error);
        return { error: `An unknown error ocurred!` };
    }
})
.post(`/blitzer`, async ({ body: { x, y, z, gebiet, geschwindigkeit } }) => {
    await axios({
        method: 'post',
        url: config.webhook,
        data: {
            username: "Blitzer Warner",
            embeds: [{
                title: "Es wurde ein neuer Blitzer gemeldet!",
                color: parseInt('ff0000', 16),
                fields: [
                    {
                        name: 'X',
                        value: `\`\`\`${x}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Y',
                        value: `\`\`\`${y}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Z',
                        value: `\`\`\`${z}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Gebiet',
                        value: `\`\`\`${gebiet}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Geschwindigkeit',
                        value: `\`\`\`${geschwindigkeit}\`\`\``,
                        inline: true
                    }
                ]
            }]
        }
    });
}, {
    body: t.Object({
        x: t.Number({ error: 'Field "x" needs to be of type number!' }),
        y: t.Number({ error: 'Field "y" needs to be of type number!' }),
        z: t.Number({ error: 'Field "z" needs to be of type number!' }),
        gebiet: t.String({ error: 'Field "gebiet" needs to be of type string!' }),
        geschwindigkeit: t.Number({ error: 'Field "geschwindigkeit" needs to be of type number!' }),
    }, { error: 'Body needs to be a json object!', additionalProperties: true })
})
.listen(config.port);