import { S3Client, ListObjectVersionsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayProxyHandler } from "aws-lambda";

const s3 = new S3Client({});
const BUCKET = process.env.BUCKET_NAME as string;
const PREFIX = "";

export const handler: APIGatewayProxyHandler = async (event, context) => {
  const resp = await s3.send(
    new ListObjectVersionsCommand({
      Bucket: BUCKET,
      Prefix: PREFIX,
    })
  );

  const versions = resp.Versions || [];

  if (versions.length === 0) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: "<html><body><h1>No files found</h1></body></html>",
    };
  }

  // Sort newest-first
  versions.sort(
    (a, b) =>
      new Date(b.LastModified as Date).getTime() -
      new Date(a.LastModified as Date).getTime()
  );

  // The single latest across all objects
  const globalLatest = versions[0];
  const latestKey = globalLatest.Key;
  const latestVid = globalLatest.VersionId;

  // Build HTML
  let html = `
<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <title>Download Builds</title>
 <style>
  body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; }
  h1 { color: #333; }
  .version-item { background: #f5f5f5; padding: 12px 14px; margin: 10px 0; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
  .latest { background: #d4edda; border: 2px solid #28a745; }
  .info { flex-grow: 1; }
  .file-name { font-weight: bold; color: #333; }
  .file-date { color: #666; font-size: 13px; margin-top: 4px; }
  .badge { background: #28a745; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; margin-left: 8px; }
  a.button { text-decoration: none; }
  button { padding: 9px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
  button:hover { background: #0056b3; }
 </style>
</head>
<body>
 <h1>📦 Download Builds</h1>
 <p>All versions sorted by date (newest first)</p>
`;

  for (const v of versions) {
    const key = v.Key!;
    const vid = v.VersionId!;
    const dt =
      new Date(v.LastModified as Date)
        .toISOString()
        .replace("T", " ")
        .slice(0, 16) + " UTC";

    const isGlobalLatest = key === latestKey && vid === latestVid;

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
        VersionId: vid,
      }),
      { expiresIn: 7 * 24 * 60 * 60 }
    );

    const css = isGlobalLatest ? "version-item latest" : "version-item";
    const badge = isGlobalLatest ? `<span class="badge">LATEST</span>` : "";
    const shortVid =
      vid && vid.length > 13 ? vid.slice(0, 10) + "..." : vid || "";

    html += `
  <div class="${css}">
   <div class="info">
    <div class="file-name">${key}${badge}</div>
    <div class="file-date">📅 ${dt} | Version: ${shortVid}</div>
   </div>
   <a class="button" href="${url}">
    <button>⬇️ Download</button>
   </a>
  </div>
`;
  }

  html += `
 <p style="color: gray; margin-top: 30px; text-align: center;">
 All download links are valid for 7 days
 </p>
</body>
</html>
`;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: html,
  };
};
