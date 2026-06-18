import 'dotenv/config';
import { corsair } from "./corsair";

const main = async () => {
    // const res = await corsair.withTenant('pushkar').gmail.db.threads.list({})
    // console.log(res)

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const res = await corsair.withTenant('pushkar').googlecalendar.api.events.create({
        event: {
            summary: 'Test Event from Corsair',
            start: {
                dateTime: now.toISOString(),
            },
            end: {
                dateTime: oneHourLater.toISOString(),
            }
        }
    });
    console.log(res);
}

void main();

