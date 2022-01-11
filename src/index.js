import './server/webapp';

function Response() {
  return {
    json: (data) => {
      return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
    },
  };
}
global.Response = Response;
