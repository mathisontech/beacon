const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  parents?: string[];
}

interface DriveListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function listFiles(
  token: string,
  folderId?: string,
  pageToken?: string,
  query?: string
): Promise<DriveListResponse> {
  const q = query
    ? query
    : folderId
      ? `'${folderId}' in parents and trashed = false`
      : 'trashed = false';

  const params = new URLSearchParams({
    q,
    fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink,parents)',
    orderBy: 'folder,name',
    pageSize: '50',
  });
  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(`${DRIVE_API}/files?${params}`, { headers: headers(token) });
  return res.json();
}

export async function searchFiles(token: string, searchTerm: string): Promise<DriveListResponse> {
  const q = `name contains '${searchTerm.replace(/'/g, "\\'")}' and trashed = false`;
  return listFiles(token, undefined, undefined, q);
}

export async function createFolder(token: string, name: string, parentId?: string) {
  const body: Record<string, unknown> = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) body.parents = [parentId];

  const res = await fetch(`${DRIVE_API}/files`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function uploadFile(
  token: string,
  file: Buffer,
  name: string,
  mimeType: string,
  folderId?: string
) {
  const metadata: Record<string, unknown> = { name };
  if (folderId) metadata.parents = [folderId];

  const boundary = '----BeaconUpload';
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    `Content-Type: ${mimeType}`,
    'Content-Transfer-Encoding: base64',
    '',
    file.toString('base64'),
    `--${boundary}--`,
  ].join('\r\n');

  const res = await fetch(`${UPLOAD_API}/files?uploadType=multipart`, {
    method: 'POST',
    headers: {
      ...headers(token),
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  return res.json();
}

export async function deleteFile(token: string, fileId: string) {
  const res = await fetch(`${DRIVE_API}/files/${fileId}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  return res.ok;
}

export async function getUserInfo(token: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: headers(token),
  });
  return res.json();
}
