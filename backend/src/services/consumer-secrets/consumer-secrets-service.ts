import { v4 as uuidv4 } from "uuid";

import { SecretKeyEncoding, TConsumerSecrets, TConsumerSecretsInsert } from "@app/db/schemas";
import { decryptSymmetric128BitHexKeyUTF8, encryptSymmetric128BitHexKeyUTF8 } from "@app/lib/crypto";
import { infisicalSymmetricDecrypt } from "@app/lib/crypto/encryption";
import { BadRequestError, UnauthorizedError } from "@app/lib/errors";
import { TOrgBotDALFactory } from "@app/services/org/org-bot-dal";

import { TConsumerSecretsDALFactory } from "./consumer-secrets-dal";
import { TCreateConsumerSecretDTO, TUpdateConsumerSecretDTO } from "./consumer-secrets-types";

type TConsumerSecretsServiceFactoryDep = {
  consumerSecretsDAL: TConsumerSecretsDALFactory;
  orgBotDAL: Pick<TOrgBotDALFactory, "findOne">;
};

export type TConsumerSecretsServiceFactory = ReturnType<typeof consumerSecretsServiceFactory>;
export const consumerSecretsServiceFactory = ({ consumerSecretsDAL, orgBotDAL }: TConsumerSecretsServiceFactoryDep) => {
  const getOrgBotKey = async (orgId: string): Promise<Buffer> => {
    const orgBot = await orgBotDAL.findOne({ orgId });
    if (!orgBot) {
      throw new BadRequestError({ message: "Org bot not found", name: "OrgBotNotFound" });
    }

    const encryptionKey = infisicalSymmetricDecrypt({
      ciphertext: orgBot.encryptedSymmetricKey,
      iv: orgBot.symmetricKeyIV,
      tag: orgBot.symmetricKeyTag,
      keyEncoding: orgBot.symmetricKeyKeyEncoding as SecretKeyEncoding
    });

    return Buffer.from(encryptionKey, SecretKeyEncoding.BASE64);
  };

  const decryptFieldWithSymmetricKey = async (ciphertext: string, iv: string, tag: string, key: Buffer) => {
    return decryptSymmetric128BitHexKeyUTF8({ ciphertext, iv, tag, key });
  };

  const decryptSecretFields = (secret: TConsumerSecrets, key: Buffer) => ({
    title: decryptFieldWithSymmetricKey(secret.titleCiphertext, secret.titleIV, secret.titleTag, key),
    type: decryptFieldWithSymmetricKey(secret.typeCiphertext, secret.typeIV, secret.typeTag, key),
    data: decryptFieldWithSymmetricKey(secret.dataCiphertext, secret.dataIV, secret.dataTag, key),
    comment: decryptFieldWithSymmetricKey(secret.commentCiphertext, secret.commentIV, secret.commentTag, key)
  });

  const findCustomerSecretById = async (id: string, orgId: string) => {
    const key = await getOrgBotKey(orgId);
    const secret = await consumerSecretsDAL.findCustomerSecretById(id);
    return {
      ...secret,
      ...decryptSecretFields(secret, key)
    };
  };

  const findAllOrganizationCustomerSecrets = async (orgId: string, userId: string) => {
    const secrets = await consumerSecretsDAL.findAllOrganizationCustomerSecrets(orgId, userId);
    const encryptionKey = await getOrgBotKey(orgId);
    return Promise.all(secrets.map(async (secret) => ({
      id: secret.id,
      userId: secret.userId,
      orgId: secret.orgId,
      title: await decryptFieldWithSymmetricKey(secret.titleCiphertext, secret.titleIV, secret.titleTag, encryptionKey),
      type: await decryptFieldWithSymmetricKey(secret.typeCiphertext, secret.typeIV, secret.typeTag, encryptionKey),
      data: await decryptFieldWithSymmetricKey(secret.dataCiphertext, secret.dataIV, secret.dataTag, encryptionKey),
      comment: await decryptFieldWithSymmetricKey(secret.commentCiphertext, secret.commentIV, secret.commentTag, encryptionKey)
    })));
  };

  const createConsumerSecret = async ({ title, type, data, comment, orgId, userId }: TCreateConsumerSecretDTO) => {
    const encryptionKey = await getOrgBotKey(orgId);
    const titleEncrypted = encryptSymmetric128BitHexKeyUTF8(title, encryptionKey);
    const typeEncrypted = encryptSymmetric128BitHexKeyUTF8(type, encryptionKey);
    const dataEncrypted = encryptSymmetric128BitHexKeyUTF8(data, encryptionKey);
    const commentEncrypted = encryptSymmetric128BitHexKeyUTF8(comment || "", encryptionKey);

    const encryptedData = {
      userId,
      orgId,
      titleCiphertext: titleEncrypted.ciphertext,
      titleIV: titleEncrypted.iv,
      titleTag: titleEncrypted.tag,
      typeCiphertext: typeEncrypted.ciphertext,
      typeIV: typeEncrypted.iv,
      typeTag: typeEncrypted.tag,
      dataCiphertext: dataEncrypted.ciphertext,
      dataIV: dataEncrypted.iv,
      dataTag: dataEncrypted.tag,
      commentCiphertext: commentEncrypted.ciphertext,
      commentIV: commentEncrypted.iv,
      commentTag: commentEncrypted.tag
    };

    return consumerSecretsDAL.createConsumerSecret(encryptedData);
  };

  const updateConsumerSecrets = async ({ id, title, type, data, comment, orgId, userId }: TUpdateConsumerSecretDTO) => {
    const encryptionKey = await getOrgBotKey(orgId);

    const titleEncrypted = encryptSymmetric128BitHexKeyUTF8(title, encryptionKey);
    const typeEncrypted = encryptSymmetric128BitHexKeyUTF8(type, encryptionKey);
    const dataEncrypted = encryptSymmetric128BitHexKeyUTF8(data, encryptionKey);
    const commentEncrypted = encryptSymmetric128BitHexKeyUTF8(comment || "", encryptionKey);

    const encryptedData = {
      id: uuidv4(),
      userId,
      titleCiphertext: titleEncrypted.ciphertext,
      titleIV: titleEncrypted.iv,
      titleTag: titleEncrypted.tag,
      typeCiphertext: typeEncrypted.ciphertext,
      typeIV: typeEncrypted.iv,
      typeTag: typeEncrypted.tag,
      dataCiphertext: dataEncrypted.ciphertext,
      dataIV: dataEncrypted.iv,
      dataTag: dataEncrypted.tag,
      commentCiphertext: commentEncrypted.ciphertext,
      commentIV: commentEncrypted.iv,
      commentTag: commentEncrypted.tag
    };
    return consumerSecretsDAL.upsertConsumerSecrets(encryptedData);
  };

  const deleteConsumerSecret = async (id: string) => {
    return consumerSecretsDAL.deleteConsumerSecret(id);
  };

  return {
    findCustomerSecretById,
    findAllOrganizationCustomerSecrets,
    createConsumerSecret,
    updateConsumerSecrets,
    deleteConsumerSecret
  };
};
