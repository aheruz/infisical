import { SecretKeyEncoding, TConsumerSecrets } from "@app/db/schemas";
import { decryptSymmetric128BitHexKeyUTF8, encryptSymmetric128BitHexKeyUTF8 } from "@app/lib/crypto";
import { infisicalSymmetricDecrypt } from "@app/lib/crypto/encryption";
import { BadRequestError } from "@app/lib/errors";
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

  const decryptSecretFields = async (secret: TConsumerSecrets, key: Buffer) => ({
    title: await decryptFieldWithSymmetricKey(secret.titleCiphertext, secret.titleIV, secret.titleTag, key),
    type: await decryptFieldWithSymmetricKey(secret.typeCiphertext, secret.typeIV, secret.typeTag, key),
    data: await decryptFieldWithSymmetricKey(secret.dataCiphertext, secret.dataIV, secret.dataTag, key),
    comment: await decryptFieldWithSymmetricKey(secret.commentCiphertext, secret.commentIV, secret.commentTag, key)
  });

  const findConsumerSecretById = async (id: string, orgId: string) => {
    const key = await getOrgBotKey(orgId);
    const secret = await consumerSecretsDAL.findConsumerSecretById(id);
    return {
      id: secret.id,
      ...(await decryptSecretFields(secret, key))
    };
  };

  const findAllOrganizationCustomerSecrets = async (orgId: string, userId: string) => {
    const secrets = await consumerSecretsDAL.findAllOrganizationCustomerSecrets(orgId, userId);
    const encryptionKey = await getOrgBotKey(orgId);
    return Promise.all(
      secrets.map(async (secret) => ({
        id: secret.id,
        userId: secret.userId,
        orgId: secret.orgId,
        title: await decryptFieldWithSymmetricKey(
          secret.titleCiphertext,
          secret.titleIV,
          secret.titleTag,
          encryptionKey
        ),
        type: await decryptFieldWithSymmetricKey(secret.typeCiphertext, secret.typeIV, secret.typeTag, encryptionKey),
        data: await decryptFieldWithSymmetricKey(secret.dataCiphertext, secret.dataIV, secret.dataTag, encryptionKey),
        comment: await decryptFieldWithSymmetricKey(
          secret.commentCiphertext,
          secret.commentIV,
          secret.commentTag,
          encryptionKey
        )
      }))
    );
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

  const updateConsumerSecrets = async ({ id, title, type, data, comment, orgId }: TUpdateConsumerSecretDTO) => {
    // check if the secret exists
    const secret = await consumerSecretsDAL.findConsumerSecretById(id);
    if (!secret) throw new BadRequestError({ message: "Secret not found", name: "SecretNotFound" });

    if (!title && !type && !data && !comment) {
      throw new BadRequestError({ message: "At least one field must be provided", name: "NoFieldsProvided" });
    }

    const encryptionKey = await getOrgBotKey(orgId);

    const titleEncrypted = title ? encryptSymmetric128BitHexKeyUTF8(title, encryptionKey) : null;
    const typeEncrypted = type ? encryptSymmetric128BitHexKeyUTF8(type, encryptionKey) : null;
    const dataEncrypted = data ? encryptSymmetric128BitHexKeyUTF8(data, encryptionKey) : null;
    const commentEncrypted = comment ? encryptSymmetric128BitHexKeyUTF8(comment, encryptionKey) : null;

    const encryptedData = {
      ...(titleEncrypted && {
        titleCiphertext: titleEncrypted.ciphertext,
        titleIV: titleEncrypted.iv,
        titleTag: titleEncrypted.tag
      }),
      ...(typeEncrypted && {
        typeCiphertext: typeEncrypted.ciphertext,
        typeIV: typeEncrypted.iv,
        typeTag: typeEncrypted.tag
      }),
      ...(dataEncrypted && {
        dataCiphertext: dataEncrypted.ciphertext,
        dataIV: dataEncrypted.iv,
        dataTag: dataEncrypted.tag
      }),
      ...(commentEncrypted && {
        commentCiphertext: commentEncrypted.ciphertext,
        commentIV: commentEncrypted.iv,
        commentTag: commentEncrypted.tag
      })
    };

    return consumerSecretsDAL.updateConsumerSecrets(id, encryptedData);
  };

  const deleteConsumerSecret = async (id: string) => {
    return consumerSecretsDAL.deleteConsumerSecret(id);
  };

  return {
    findConsumerSecretById,
    findAllOrganizationCustomerSecrets,
    createConsumerSecret,
    updateConsumerSecrets,
    deleteConsumerSecret
  };
};
