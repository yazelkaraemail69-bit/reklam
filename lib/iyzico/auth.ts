import { createHmac, randomBytes } from "crypto";

/**
 * Iyzico IYZWSv2 Authorization header üretir.
 * Formül: HMACSHA256(randomKey + uriPath + requestBody, secretKey)
 * sonra base64("apiKey:"+apiKey+"&randomKey:"+randomKey+"&signature:"+hex)
 *
 * @see https://docs.iyzico.com/en/getting-started/preliminaries/authentication/hmacsha256-auth
 */
export function buildIyzicoAuthorizationHeader(options: {
  apiKey: string;
  secretKey: string;
  uriPath: string;
  /** JSON string veya boş (GET için) */
  body: string;
}): { authorization: string; randomKey: string } {
  const randomKey = `${Date.now()}${randomBytes(8).toString("hex")}`;
  const payload = options.body
    ? `${randomKey}${options.uriPath}${options.body}`
    : `${randomKey}${options.uriPath}`;

  const signature = createHmac("sha256", options.secretKey).update(payload, "utf8").digest("hex");

  const authorizationString = `apiKey:${options.apiKey}&randomKey:${randomKey}&signature:${signature}`;
  const base64Encoded = Buffer.from(authorizationString, "utf8").toString("base64");

  return {
    authorization: `IYZWSv2 ${base64Encoded}`,
    randomKey,
  };
}
