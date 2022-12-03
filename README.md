# Field Notes Scanner

Uses google docs api to extract highlighted text from a list of files shared with a service account. A poor man's version of something like [MAXQDA](https://www.maxqda.com/).


## Using

1. Create a [Google Cloud Project](https://console.cloud.google.com)
2. Create a [service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts) and download the key to `key.json` 
3. [Enable](https://support.google.com/googleapi/answer/6158841?hl=en) the Google Docs and Google Drive APIs in your project
4. Clone this repository; run `npm install`
5. Run `node .` to download highlight data to a JSON file
