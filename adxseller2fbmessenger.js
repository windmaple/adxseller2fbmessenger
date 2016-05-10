const http = require('http');
const Bot = require('messenger-bot');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2('your Google client ID', 'your Google client secret', 'urn:ietf:wg:oauth:2.0:oob');
var ad_client_id = '';
var end_date_str = '';


let bot = new Bot({
    // facebook app credentials
    token: 'your facebook app token',
    verify: 'your facebook messenger subscription verification token'
});


bot.on('error', (err) => {
    console.log(err.message)
});

bot.on('message', (payload, reply) => {
    let text = payload.message.text;

    if (text.search(/^ *query ca-pub-.* 201\d-\d\d-\d\d *$/i) != -1) {
        ad_client_id = text.split(' ')[1].replace(' ', '');
        end_date_str = text.split(' ')[2].replace(' ', '');

        google.options({ auth: oauth2Client });
        let url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/adexchange.seller.readonly'
        });

        let say = 'Please grant me access to your AdX Seller account by:\n' +
              '1. visiting the authorization URL \n' +
              '2. sending me the verification code by typing \'verify: [code]\''
        reply({ text:say }, (err) => {
            if (err) throw err;
        })

        reply({ text:url }, (err) => {
            if (err) throw err;
        })

    }
    else if (text.search(/verify:/i) != -1) {
        code = text.split(':')[1].replace(' ','');

        oauth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log(err)
            }

            oauth2Client.setCredentials(tokens)
            let adxseller = google.adexchangeseller('v2.0')

            account_id = ad_client_id.replace('ca-pub-', 'pub-')
            let end_date = new Date(end_date_str);
            let start_date = end_date;
            start_date.setDate(start_date.getDate() - 7);
            let start_date_str = start_date.toISOString().slice(0,10);
            report_json = adxseller.accounts.reports.generate({
                auth: oauth2Client,
                accountId: account_id,
                startDate: start_date_str,
                endDate: end_date_str,
                dimension: 'DATE',
                metric: ['AD_REQUESTS', 'AD_REQUESTS_COVERAGE',
                    'COST_PER_CLICK', 'AD_REQUESTS_RPM', 'EARNINGS'],
            }, (err, result) => {
                if (err) throw err;
                let say = ''
                // each FB msg can't be > 320 characters
                for (let header of result.headers) say = say + header.name + '  '
                reply({text: say}, (err) => {
                    if (err) console.error(err);
                })
                for (let row of result.rows) {
                    say = ''
                    for (let col of row) say = say + col + '  ';
                    reply({text: say}, (err) => {
                        if (err) console.error(err);
                    })
                }
            })

        })
    }
    else {
        let say = "Sorry but I didn't follow you there.\n" +
                  "To query 7-day AdX seller account performance, use the following:\n" +
                  "query pubshlierID endDate\n" +
                  "i.e.,\n" +
                  "query ca-pub-XXXXXXXXX YYYY-MM-DD\n" +
                  "example:\n" +
                  "query ca-pub-999999999 2016-05-10";
        reply({ text: say }, (err) => {

            if (err) throw err;

            console.log('I did not understand the request!')
        })

    }
});

http.createServer(bot.middleware()).listen(3000);
console.log('Adx Seller bot server running at port 3000.');
