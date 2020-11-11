const {describe, it} = require('mocha');
const {expect} = require('chai');

const https = require('https');
const axios = require('axios');

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

// axios 基础配置
const baseOptions = {
  httpsAgent: new https.Agent({
    ca,
    keepAlive: true,
    checkServerIdentity: (host, cert) => {},
    // enableTrace: true,
  }),
  auth: {
    username: 'dev_a534e4b154',
    password: 'd8d1197a6720aa2cfe40bf472221'
  },
  method: 'GET',
  baseURL: endpoint,
  timeout: 5000,
}

// 简单测试搬运接口
describe('stock banjia basic tests', function() {
  this.timeout(10000);
  
  // 测试接口可用
  it('api works', async function() {
    const response = await axios({
      ...baseOptions,
      url: '/stock/transport/',
    });
    expect(response.status).to.eq(200);
    expect(response.data).to.eq('api works');
  });

  // 获取平台资源领取码
  it('get exchange code', async function() {
    const response = await axios({
      ...baseOptions,
      method: 'POST',
      url: '/stock/transport/acquire-exchange-code',
      data: {
        'identity': '1',
        'nickname': '张三',
      },
    });
    expect(response.status).to.eq(200);
    expect(response.data).to.be.an('object');
    expect(response.data.status).to.eq(0);
    expect(response.data.message).to.eq('OK');
    console.log(response.data.data);
  });

  // 创建或更新素材元数据
  it('create or update stock', async function() {
    const response = await axios({
      ...baseOptions,
      method: 'POST',
      url: '/stock/transport/stock',
      data: {
        identity: '1',
        stockType: 'ae',
        stockIdentity: '5056795',
        title: '卡通生气',
        price: 100000,
        category: ['全部','AE模板','其他AE模板','卡通生气'],
        tag: ['卡通','生气','表情包','可爱','卡哇伊'],
        content: '卡通生气',
        resolutionRatio: '1920x1080',
        minAeVersion: 'After Effects CC2017',
        modifyRange: '全部是分层内容'
      },
    });
    expect(response.status).to.eq(200);
    expect(response.data).to.be.an('object');
    expect(response.data.status).to.eq(0);
    expect(response.data.message).to.eq('OK');
    console.log(response.data);
  });

  // 获取素材文件上传 token
  it('get upload token', async function() {
    const response = await axios({
      ...baseOptions,
      method: 'POST',
      url: '/stock/transport/upload-token',
      data: {
        identity: '1',
        stockType: 'ae',
        stockIdentity: '5056795',
        resourceType: 'ae_source',
        resourceIdentity: 'd6e4dbf14a8cd08a09f61bfb29ca9441',
        fileSize: 1024 * 200 * 5,
        filePartSize: 1024 * 200,
        fileMimeType: 'application/zip',
        fileName: '22d86f0cf4e.zip',
      },
    });
    expect(response.status).to.eq(200);
    expect(response.data).to.be.an('object');
    expect(response.data.status).to.eq(0);
    expect(response.data.message).to.eq('OK');
    console.log(JSON.stringify(response.data.data));
  });
})
