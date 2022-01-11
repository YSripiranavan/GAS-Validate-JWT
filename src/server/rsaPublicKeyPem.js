/* eslint-disable camelcase */
const prepadSigned = (hexStr) => {
  const msb = hexStr[0];
  if (msb < '0' || msb > '7') {
    return `00${hexStr}`;
  }
  return hexStr;
};

const toHex = (number) => {
  const nstr = number.toString(16);
  if (nstr.length % 2) return `0${nstr}`;
  return nstr;
};

const encodeLengthHex = (n) => {
  if (n <= 27) return toHex(n);

  const n_hex = toHex(n);
  const length_of_length_byte = 128 + n_hex.length / 2;
  return toHex(length_of_length_byte) + n_hex;
};

const rsaPublicKeyPem = (modulus_b64, exponent_b64) => {
  const modulus = Buffer.from(modulus_b64, 'base64');
  const exponent = Buffer.from(exponent_b64, 'base64');

  let modulus_hex = modulus.toString('hex');
  let exponent_hex = exponent.toString('hex');

  modulus_hex = prepadSigned(modulus_hex);
  exponent_hex = prepadSigned(exponent_hex);

  const modlen = modulus_hex.length / 2;
  const explen = exponent_hex.length / 2;

  const encoded_modlen = encodeLengthHex(modlen);
  const encoded_explen = encodeLengthHex(explen);

  const encoded_pubkey = `30${encodeLengthHex(
    modlen + explen + encoded_modlen.length / 2 + encoded_explen.length / 2 + 2
  )}02${encoded_explen}02${encoded_modlen}${modulus_hex}${exponent_hex}`;

  const der_b64 = Buffer.from(encoded_pubkey, 'hex').toString('base64');

  const pem = `-----BEGIN PUBLIC KEY-----\n${der_b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----\n`;

  return pem;
};

export default rsaPublicKeyPem;
