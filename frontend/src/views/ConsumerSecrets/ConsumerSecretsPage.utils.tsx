import { Buffer } from "buffer";
import Aes256Gcm from "@app/components/utilities/cryptography/aes-256-gcm";

export const encryptData = (data: any) => {
  const privateKeyHex = localStorage.getItem("PRIVATE_KEY");
  if (!privateKeyHex) throw new Error("Private key not found in localStorage");

  const privateKeyBuffer = Buffer.from(privateKeyHex, "base64");

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      JSON.stringify(
        Aes256Gcm.encrypt({
          text: value as string,
          secret: privateKeyBuffer,
        })
      ),
    ])
  );
};
