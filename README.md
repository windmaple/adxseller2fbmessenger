# adxseller2fbmessenger
A simple Facebook Messenger bot that pull Google Adexchange Seller performance data for you. It uses standard Google OAuth/Adexchange Seller API and remixz/messenger-bot. Botkit should be even better since there is a basic conversation going on.

# Instructions:
1. clone this repository
2. set up your Facebook page (you can refer to botkit's instructions: https://github.com/howdyai/botkit/blob/master/readme-facebook.md#getting-started)
3. set up your Google API access
4. standard Node stuff: npm install 
5. node adxseller2fbmessenger.js

# Notes:
Facebook Messenger seems to batch message, which means messages are not 'first sent, first arrive'. This sometimes creates weird debug situation.

Since FB only accepts HTTPS verification, you have to use either 'localtunnel' or 'ngrok' to debug. 'localtunnel' crashes all the time and the maintainer doesn't seem to have time to look into it.

If you see any strange behavior, make sure you do 'curl -X POST "https://graph.facebook.c_apps?access_token={your_token}', which seems to clear thing up for me.
