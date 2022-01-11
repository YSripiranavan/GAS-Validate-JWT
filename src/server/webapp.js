import rsaPublicKeyPem from './rsaPublicKeyPem';

const doGet = () => {
  return Response().json({
    message: 'Hello, World!',
  });
};

global.doGet = doGet;

const deCodeJWT = (token) => {
  const parts = token.split('.');
  const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'));
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
  const signature = parts[2];

  return {
    header,
    payload,
    signature,
  };
};

const doPost = (request) => {
  const params = request.parameters;
  if (params.token !== undefined) {
    const token = params.token[0];
    // check the token is valid
    if (token.split('.').length === 3) {
      const { header, payload, signature } = deCodeJWT(token);
      if (header.alg === 'RS256' && header.kid !== undefined) {
        const { kid } = header;

        const openIdConfig = JSON.parse(
          UrlFetchApp.fetch('https://accounts.google.com/.well-known/openid-configuration').getContentText()
        );

        const jwks = JSON.parse(UrlFetchApp.fetch(openIdConfig.jwks_uri).getContentText()).keys;

        const jwk = jwks.filter((res) => res.kid === kid);
        const modulus = jwk[0].n;
        const exponent = jwk[0].e;

        const publicKey = rsaPublicKeyPem(modulus, exponent);

        return Response().json({
          publicKey,
          payload,
          signature,
        });
      }
      return Response().json({
        message: 'Invalid token',
      });
    }
    return Response().json({
      message: 'invalid token',
    });
  }
  return Response().json({
    message: 'No token',
  });
};

global.doPost = doPost;
