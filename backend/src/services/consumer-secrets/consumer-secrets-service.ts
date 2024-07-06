import { TConsumerSecretsDALFactory } from "./consumer-secrets-dal";
import { TConsumerSecretsInsert } from "@app/db/schemas";
import { encryptSymmetric128BitHexKeyUTF8, decryptSymmetric128BitHexKeyUTF8 } from "@app/lib/crypto";
import { TOrgBotDALFactory } from "@app/services/org/org-bot-dal";
import { SecretKeyEncoding } from "@app/db/schemas";
import { BadRequestError } from "@app/lib/errors";
import { infisicalSymmetricDecrypt } from "@app/lib/crypto/encryption";
import { TCreateConsumerSecret } from "./consumer-secrets-types";

type TConsumerSecretsServiceFactoryDep = {
  consumerSecretsDAL: TConsumerSecretsDALFactory;
  orgBotDAL: Pick<TOrgBotDALFactory, "findOne">;
};

export type TConsumerSecretsServiceFactory = ReturnType<typeof consumerSecretsServiceFactory>;

export const consumerSecretsServiceFactory = ({ consumerSecretsDAL, orgBotDAL }: TConsumerSecretsServiceFactoryDep) => {
  const getOrgBotKey = async (orgId: string) => {
    const orgBot = await orgBotDAL.findOne({ orgId });
    if (!orgBot) {
      throw new BadRequestError({ message: "Org bot not found", name: "OrgBotNotFound" });
    }

    return infisicalSymmetricDecrypt({
      ciphertext: orgBot.encryptedSymmetricKey,
      iv: orgBot.symmetricKeyIV,
      tag: orgBot.symmetricKeyTag,
      keyEncoding: orgBot.symmetricKeyKeyEncoding as SecretKeyEncoding
    });
  };

  const decryptFieldWithSymmetricKey = async (ciphertext: string, iv: string, tag: string, key: string) => {
    return decryptSymmetric128BitHexKeyUTF8({ ciphertext, iv, tag, key });
  };

  const findCustomerSecretById = async (id: string, orgId: string) => {
    const encryptionKey = await getOrgBotKey(orgId);
    const secret = await consumerSecretsDAL.findCustomerSecretById(id);
    return {
      ...secret,
      title: decryptFieldWithSymmetricKey(secret.titleCiphertext, secret.titleIV, secret.titleTag, encryptionKey),
      type: decryptFieldWithSymmetricKey(secret.typeCiphertext, secret.typeIV, secret.typeTag, encryptionKey),
      data: decryptFieldWithSymmetricKey(secret.dataCiphertext, secret.dataIV, secret.dataTag, encryptionKey),
      comment: decryptFieldWithSymmetricKey(secret.commentCiphertext, secret.commentIV, secret.commentTag, encryptionKey)
    };
  };

  const findAllOrganizationCustomerSecrets = async (orgId: string, userId: string) => {
    const secrets = await consumerSecretsDAL.findAllOrganizationCustomerSecrets(orgId, userId);
    const encryptionKey = await getOrgBotKey(orgId);
    return secrets.map(secret => ({
      ...secret,
      title: decryptFieldWithSymmetricKey(secret.titleCiphertext, secret.titleIV, secret.titleTag, encryptionKey),
      type: decryptFieldWithSymmetricKey(secret.typeCiphertext, secret.typeIV, secret.typeTag, encryptionKey),
      data: decryptFieldWithSymmetricKey(secret.dataCiphertext, secret.dataIV, secret.dataTag, encryptionKey),
      comment: decryptFieldWithSymmetricKey(secret.commentCiphertext, secret.commentIV, secret.commentTag, encryptionKey)
    }));
  };

  const createConsumerSecret = async ({
    title,
    type,
    data,
    comment,
    orgId,
    userId
  }: TCreateConsumerSecret) => {
    const encryptionKey = await getOrgBotKey(orgId);

    const titleEncrypted = encryptSymmetric128BitHexKeyUTF8(title, encryptionKey);
    const typeEncrypted = encryptSymmetric128BitHexKeyUTF8(type, encryptionKey);
    const dataEncrypted = encryptSymmetric128BitHexKeyUTF8(JSON.stringify(data), encryptionKey);
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

    return consumerSecretsDAL.upsertConsumerSecrets(encryptedData);
  };

  const upsertConsumerSecrets = async (data: TConsumerSecretsInsert, orgId: string, userId: string) => {
    const encryptionKey = await getOrgBotKey(orgId);

    const titleEncrypted = encryptSymmetric128BitHexKeyUTF8(data.title, encryptionKey);
    const typeEncrypted = encryptSymmetric128BitHexKeyUTF8(data.type, encryptionKey);
    const dataEncrypted = encryptSymmetric128BitHexKeyUTF8(data.data, encryptionKey);
    const commentEncrypted = encryptSymmetric128BitHexKeyUTF8(data.comment || "", encryptionKey);

    const encryptedData = {
      ...data,
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
    upsertConsumerSecrets,
    deleteConsumerSecret
  };
};
