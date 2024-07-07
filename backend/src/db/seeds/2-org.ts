import { Knex } from "knex";

import { OrgMembershipRole, OrgMembershipStatus, TableName } from "../schemas";
import { generateOrgBotSrpKeys, seedData1 } from "../seed-data";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex(TableName.Organization).del();
  await knex(TableName.OrgMembership).del();
  await knex(TableName.OrgBot).del();

  const user = await knex(TableName.Users).where({ email: seedData1.email }).first();
  if (!user) throw new Error("User not found");
  // Inserts seed entries
  const [org] = await knex(TableName.Organization)
    .insert([
      {
        // eslint-disable-next-line
        // @ts-ignore
        id: seedData1.organization.id,
        name: "infisical",
        slug: "infisical",
        customerId: null
      }
    ])
    .returning("*");

  await knex(TableName.OrgMembership).insert([
    {
      role: OrgMembershipRole.Admin,
      orgId: org.id,
      status: OrgMembershipStatus.Accepted,
      userId: user.id
    }
  ]);

  const {
    publicKey,
    encryptedPrivateKey,
    privateKeyIV,
    privateKeyTag,
    privateKeyEncoding,
    privateKeyAlgorithm,
    encryptedPublicKey,
    publicKeyIV,
    publicKeyTag,
    publicKeyEncoding,
    publicKeyAlgorithm
  } = await generateOrgBotSrpKeys();

  await knex(TableName.OrgBot).insert({
    name: org.name,
    orgId: org.id,
    publicKey,
    encryptedSymmetricKey: encryptedPublicKey,
    symmetricKeyIV: publicKeyIV,
    symmetricKeyTag: publicKeyTag,
    symmetricKeyAlgorithm: publicKeyAlgorithm,
    symmetricKeyKeyEncoding: publicKeyEncoding,
    encryptedPrivateKey,
    privateKeyIV,
    privateKeyTag,
    privateKeyAlgorithm,
    privateKeyKeyEncoding: privateKeyEncoding
  });
}
