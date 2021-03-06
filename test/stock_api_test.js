const { describe, it } = require('mocha');
const { expect } = require('chai');

const https = require('https');
const fetch = require('node-fetch');
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const endpoint = 'https://117.50.17.54';
// const endpoint = 'http://127.0.0.1:5003';
const ca = `-----BEGIN CERTIFICATE-----
MIICfDCCAWQCCQCy2gskHG0ZMDANBgkqhkiG9w0BAQsFADAAMB4XDTIwMTEwOTA5
MDU0NloXDTMwMTEwNzA5MDU0NlowADCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC
AQoCggEBAMijg+igd6ibIuvFiClB65d6sz0RPTW7CM7Ph9dImQe2cYbpy/vO9/rw
S2LfAB7X1Hb24MhrUSFG7kwQcWQYbQ3MqZLZ/ahbrg85unHpNoPc1UhHil+7rh3K
oQ0/cmwfwxz5duLQFUVwEs6IHhS3Ti5dCHY594c650UtrKiEae9RbNBEC017GxSy
dgerVsSzWf7bj5SdyerxFD11ftubqCh7/cjkZ8ZcmYDQw6jTkuAHJmolKCFSUIZu
oLBHYG0+Y4M9SKXeui+T+6mOGiEOCS0AXs2R41fxRvq/8r4VN5+n5dyR+P3/xU8Q
0p1K+texzbYdVcb5vena9DLgCmnntO8CAwEAATANBgkqhkiG9w0BAQsFAAOCAQEA
r5ypFeVvP1yJ7/YpEiz1dHJZkbIwyi1BFxBu/TNj1xyXw879ElVIx/f5yOG+oQZA
bCMEmXYdIj4I0yYMm2DY3iMVpMJoxtzPfGmI7ldzmpKZaEACfgtZhW6o4t4xbuUx
34K9AumcCO34ouTw6Uh5Jaiib6OX96THESmRyPc2ku9RUgRZwBucftIedMk9c07B
rpLBBdydpwTiU86d4VmT99ff9KcP3CIgrRDQU3UcMAmmQM0kLLwDXTwlm8Gz+I8v
96CSGP4CX3ZNJSGZTrPEPzawTzaPqEYJeRrn/G8pcWmxfD7k8/8YCOZKzSiZfY1E
zCyIBb9EgD0s6Om4tNdjaA==
-----END CERTIFICATE-----
`;


const agent = new https.Agent({
  ca,
  keepAlive: true,
  checkServerIdentity: (host, cert) => { },
  // enableTrace: true,
})

const url = (path) => {
  return `https://dev_a534e4b154:d8d1197a6720aa2cfe40bf472221@117.50.17.54${path}`;
}

// axios 基础配置
const base = {
  agent,
}

const jsonHeaders = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
}

// util
async function fileSha1(file) {
  sha1 = crypto.createHash('sha1');
  sha1.setEncoding('hex');
  let stream = fs.createReadStream(file, { flags: 'r', highWaterMark: 1024 * 64, autoClose: true, start: 0 })
  stream.pipe(sha1);
  return await new Promise((resolve, reject) => {
    stream.on('end', () => {
      sha1.end();
      resolve(sha1.read());
    });
    stream.on('error', reject);
  })
}

// 简单测试搬运接口
describe('stock banjia basic tests', function () {
  // 测试接口可用
  it('api works', async function () {
    const response = await fetch(url('/stock/transport/'), { ...base });
    expect(response.status).to.eq(200);
    const body = await response.text();
    expect(body).to.eq('api works');
  });

  // 获取平台资源领取码
  it('get exchange code', async function () {
    const response = await fetch(url('/stock/transport/acquire-exchange-code'), {
      ...base,
      ...jsonHeaders,
      method: 'POST',
      body: JSON.stringify({
        'identity': '1',
        'nickname': '张三',
      })
    });
    expect(response.status).to.eq(200);
    const body = await response.json();
    expect(body).to.be.an('object');
    expect(body.status).to.eq(0);
    expect(body.message).to.eq('OK');
    console.log(body.data);
  });

  // 创建或更新素材元数据
  it('create or update stock', async function () {
    const response = await fetch(url('/stock/transport/stock'), {
      ...base,
      ...jsonHeaders,
      method: 'POST',
      body: JSON.stringify({
        identity: '1',
        stockType: 'footage',
        stockIdentity: '100',
        title: '卡通生气',
        price: 100000,
        category: ['全部', 'AE模板', '其他AE模板', '卡通生气'],
        tag: ['卡通', '生气', '表情包', '可爱', '卡哇伊'],
        content: '卡通生气',
        resolutionRatio: '1920x1080',
        minAeVersion: 'After Effects CC2017',
        modifyRange: '全部是分层内容'
      })
    })
    expect(response.status).to.eq(200);
    const body = await response.json();
    expect(body).to.be.an('object');
    expect(body.status).to.eq(0);
    expect(body.message).to.eq('OK');
    console.log(body);
  });

  // 获取素材文件上传 token
  const file = './assets/demo.mp4';
  const stat = fs.statSync(file);
  const mimeType = mime.lookup(file);
  const chunkSize = stat.size > 1024 * 1024 * 5 ? 1024 * 1024 * 5 : 1024 * 200; // 分片大小
  let resourceIdentity = '';

  let upload = {};

  it('get upload token', async function () {
    resourceIdentity = await fileSha1(file);
    const response = await fetch(url('/stock/transport/upload-token'), {
      ...base,
      ...jsonHeaders,
      method: 'POST',
      body: JSON.stringify({
        identity: '1',
        stockType: 'footage',
        stockIdentity: '100',
        resourceType: 'footage_source',
        resourceIdentity, // 用文件的 sha1 作为标识
        fileSize: stat.size,
        filePartSize: chunkSize,
        fileMimeType: mimeType,
        fileName: path.basename(file),
      })
    })
    expect(response.status).to.eq(200);
    const body = await response.json();
    expect(body).to.be.an('object');
    expect(body.status).to.eq(0);
    expect(body.message).to.eq('OK');
    console.log(JSON.stringify(body));
    upload = body.data; // 获取上传 token 信息，后面要用到
  });

  // 分片上传文件
  it('upload data', async function () {
    const signature = upload.original.signature;
    const accessKeyId = upload.original.accessKeyId;
    const uploadId = upload.original.uploadId;

    const uploadTasks = [];
    let partNumber = 1;
    let finishXml = '<CompleteMultipartUpload>';
    for (let pos = 0; pos < stat.size; pos += chunkSize) {
      const sign = signature[partNumber - 1];
      const uploadUrl = `${upload.original.uploadDomain}/${upload.original.key}?partNumber=${partNumber}&uploadId=${uploadId}`;
      const start = pos;
      let end = pos + chunkSize - 1;
      if (end > stat.size) {
        end = stat.size - 1;
      }
      const stream = fs.createReadStream(file, { flags: 'r', autoClose: true, start, end });
      uploadTasks.push(fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Authorization': `KSS ${accessKeyId}:${sign}`,
          'Content-Length': end - start + 1,
        },
        body: stream,
      }));
      finishXml += `<Part><PartNumber>${partNumber}</PartNumber><ETag>null</ETag></Part>`
      partNumber++;
    }
    finishXml += '</CompleteMultipartUpload>';
    const uploadResults = await Promise.all(uploadTasks);
    for (let it of uploadResults) {
      expect(it.status).to.eq(200);
    }
    console.log('upload done');

    // upload finish
    const response = await fetch(url('/stock/transport/upload-finish'), {
      ...base,
      ...jsonHeaders,
      method: 'POST',
      body: JSON.stringify({
        identity: '1',
        uploadNo: upload.uploadNo,
        stockIdentity: '100',
        resourceIdentity: resourceIdentity,
        data: {
          uploadId,
          contentType: 'application/json',
          body: finishXml,
        }
      })
    })
    console.log(response);
    expect(response.status).to.eq(200);
    const body = await response.json();
    console.log(body);
    expect(body).to.be.an('object');
    expect(body.status).to.eq(0);
    expect(body.message).to.eq('OK');
    console.log(JSON.stringify(body));
  })
})
