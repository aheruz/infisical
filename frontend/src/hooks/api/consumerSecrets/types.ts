import type { UserWsKeyPair } from "../keys/types";
import type { WsTag } from "../tags/types";

export enum ConsumerSecretType {
  Weblogin = "weblogin",
  CreditCard = "creditcard",
  SecureNote = "securenote",
}

export type EncryptedConsumerSecret = {
  id: string;
  version: number;
  workspace: string;
  type: ConsumerSecretType;
  environment: string;
  secretKeyCiphertext: string;
  secretKeyIV: string;
  secretKeyTag: string;
  secretValueCiphertext: string;
  secretValueIV: string;
  secretValueTag: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
  skipMultilineEncoding?: boolean;
  secretCommentCiphertext: string;
  secretCommentIV: string;
  secretCommentTag: string;
  secretReminderRepeatDays?: number | null;
  secretReminderNote?: string | null;
  tags: WsTag[];
};

export type TDecryptedConsumerSecret = {
  id: string;
  orgId: string;
  type: ConsumerSecretType;
  title: string;
  comment: string;
  data: string;
  userId: string;
};

export type EncryptedConsumerSecretVersion = {
  id: string;
  secretId: string;
  version: number;
  workspace: string;
  type: ConsumerSecretType;
  isDeleted: boolean;
  envId: string;
  secretKeyCiphertext: string;
  secretKeyIV: string;
  secretKeyTag: string;
  secretValueCiphertext: string;
  secretValueIV: string;
  secretValueTag: string;
  tags: WsTag[];
  __v: number;
  skipMultilineEncoding?: boolean;
  createdAt: string;
  updatedAt: string;
};

// dto
export type TGetConsumerSecretsKey = {
  workspaceId: string;
  environment: string;
  secretPath?: string;
};

export type TGetConsumerSecretsDTO = {
  decryptFileKey: UserWsKeyPair;
} & TGetConsumerSecretsKey;

export type TGetConsumerSecretsAllEnvDTO = {
  workspaceId: string;
  envs: string[];
  decryptFileKey: UserWsKeyPair;
  folderId?: string;
  secretPath?: string;
  isPaused?: boolean;
};

export type GetConsumerSecretVersionsDTO = {
  secretId: string;
  limit: number;
  offset: number;
  decryptFileKey: UserWsKeyPair;
};

export type TCreateConsumerSecretsDTO = {
  latestFileKey: UserWsKeyPair;
  secretName: string;
  secretValue: string;
  secretComment: string;
  skipMultilineEncoding?: boolean;
  secretPath: string;
  workspaceId: string;
  environment: string;
  type: ConsumerSecretType;
};

export type TUpdateConsumerSecretsDTO = {
  latestFileKey: UserWsKeyPair;
  workspaceId: string;
  environment: string;
  type: ConsumerSecretType;
  secretPath: string;
  skipMultilineEncoding?: boolean;
  newSecretName?: string;
  secretName: string;
  secretId?: string;
  secretValue: string;
  secretComment?: string;
  secretReminderRepeatDays?: number | null;
  secretReminderNote?: string | null;
  tags?: string[];
};

export type TDeleteConsumerSecretsDTO = {
  workspaceId: string;
  environment: string;
  type: ConsumerSecretType;
  secretPath: string;
  secretName: string;
  secretId?: string;
};

export type CreateConsumerSecretDTO = {
  workspaceId: string;
  environment: string;
  type: ConsumerSecretType;
  secretKey: string;
  secretKeyCiphertext: string;
  secretKeyIV: string;
  secretKeyTag: string;
  secretValueCiphertext: string;
  secretValueIV: string;
  secretValueTag: string;
  secretCommentCiphertext: string;
  secretCommentIV: string;
  secretCommentTag: string;
  secretPath: string;
  metadata?: {
    source?: string;
  };
};