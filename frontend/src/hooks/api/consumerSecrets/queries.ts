import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { apiRequest } from "@app/config/request";
import { UserWsKeyPair } from "../keys/types";
import {
  TDecryptedConsumerSecret,
  EncryptedConsumerSecret,
} from "./types";

import { Buffer } from "buffer";
import Aes256Gcm from "@app/components/utilities/cryptography/aes-256-gcm";

export const consumerSecretKeys = {
  getConsumerSecret: () =>
    ["consumer-secrets"] as const,
  getConsumerSecretVersion: (secretId: string) => [{ secretId }, "consumer-secret-versions"] as const
};

export const fetchConsumerSecrets = async () => {
  const { data } = await apiRequest.get<{ secrets: EncryptedConsumerSecret[] }>("/api/v1/consumer-secrets");
  return data;
};

export const decryptConsumerSecrets = (data) => {
    const privateKeyHex = localStorage.getItem("PRIVATE_KEY");
    if (!privateKeyHex) throw new Error("Private key not found in localStorage");

    const privateKeyBuffer = Buffer.from(privateKeyHex, "base64");

    return data.map((object) => {
        const decryptedObject = {};
        for (const [key, value] of Object.entries(object)) {
            if (["title", "type", "comment", "data"].includes(key)) {
                const { ciphertext, iv, tag } = JSON.parse(value);
                decryptedObject[key] = Aes256Gcm.decrypt({ ciphertext, iv, tag, secret: privateKeyBuffer });
            } else {
                decryptedObject[key] = value;
            }
        }
        return decryptedObject;
    });
};

export const useGetConsumerSecrets = () =>
  useQuery({
    queryKey: consumerSecretKeys.getConsumerSecret(),
    queryFn: async () => fetchConsumerSecrets(),
    select: (secrets) => decryptConsumerSecrets(secrets)
  });
