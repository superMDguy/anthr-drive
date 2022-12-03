const { google } = require("googleapis");
const fs = require("fs");

const credentialFilename = "key.json";
const scopes = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/documents.readonly",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
];

const auth = new google.auth.GoogleAuth({
  keyFile: credentialFilename,
  scopes: scopes,
});
const drive = google.drive({ version: "v3", auth });
const docs = google.docs({ version: "v1", auth });

function getFieldNoteFiles() {
  return new Promise((resolve, reject) => {
    drive.files.list(
      {
        pageSize: 1000,
        fields: "nextPageToken, files(id, name)",
      },
      (err, res) => {
        if (err) return reject("The API returned an error: " + err);
        if (res.data.nextPageToken) return reject("Too many!");
        resolve(
          res.data.files.filter((file) => {
            const name = file.name.toLowerCase();
            return name.includes("field") && name.includes("notes");
          })
        );
      }
    );
  });
}

async function extractHighlights(docId) {
  const { data } = await docs.documents.get({ documentId: docId });
  return data.body.content
    .filter((segment) => segment.paragraph?.elements)
    .flatMap((segment) => segment?.paragraph?.elements)
    .filter(
      (element) => element?.textRun?.textStyle?.backgroundColor?.color?.rgbColor
    )
    .map(({ textRun }) => ({
      text: textRun.content,
      color: simplifyColor(textRun.textStyle.backgroundColor.color.rgbColor),
    }));
}

function simplifyColor(color) {
  const fixRange = (x) => Math.floor((x || 0) * 255);
  return `rgb(${fixRange(color.red)}, ${fixRange(color.green)}, ${fixRange(
    color.blue
  )})`;
}

async function main() {
  console.log("Listing files...");
  const fieldNotes = await getFieldNoteFiles();

  const allHighlights = [];
  for (const fieldNote of fieldNotes) {
    try {
      console.log("Scanning", fieldNote.name);
      allHighlights.push({
        docId: fieldNote.id,
        docName: fieldNote.name,
        highlights: await extractHighlights(fieldNote.id),
      });
    } catch (e) {
      console.error("Failed on ", fieldNote.id, e);
    }
  }

  fs.writeFileSync("highlights.json", JSON.stringify(allHighlights, null, 2));
}
main();
