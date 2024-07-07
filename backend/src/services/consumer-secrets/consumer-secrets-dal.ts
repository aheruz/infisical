import { Knex } from "knex";
import { TDbClient } from "@app/db";
import { TableName, TConsumerSecretsInsert } from "@app/db/schemas";
import { DatabaseError } from "@app/lib/errors";
import { ormify, selectAllTableCols } from "@app/lib/knex";

export type TConsumerSecretsDALFactory = ReturnType<typeof consumerSecretsDALFactory>;

export const consumerSecretsDALFactory = (db: TDbClient) => {
  const consumerSecretsOrm = ormify(db, TableName.ConsumerSecrets);

  const findCustomerSecretById = async (id: string, tx?: Knex) => {
    try {
      const secret = await (tx || db.replicaNode())(TableName.ConsumerSecrets)
        .where({ id })
        .first();
      return secret;
    } catch (error) {
      throw new DatabaseError({ error, name: "FindCustomerSecretById" });
    }
  };

  const findAllOrganizationCustomerSecrets = async (orgId: string, userId: string, tx?: Knex) => {
    try {
      const secrets = await (tx || db.replicaNode())(TableName.ConsumerSecrets)
        .where({ orgId, userId })
        // not empty
        .whereNotNull("dataCiphertext")
        .select(selectAllTableCols(TableName.ConsumerSecrets));
      return secrets;
    } catch (error) {
      throw new DatabaseError({ error, name: "FindAllOrganizationCustomerSecrets" });
    }
  };

  const upsertConsumerSecrets = async (data: TConsumerSecretsInsert, tx?: Knex) => {
    try {
      const [secret] = await (tx || db)(TableName.ConsumerSecrets)
        .insert(data)
        .onConflict('id') // check for conflicts
        .merge() // update the existing row on conflict
        .returning("*");
      return secret;
    } catch (error) {
      throw new DatabaseError({ error, name: "UpsertConsumerSecrets" });
    }
  };

  const deleteConsumerSecret = async (id: string, tx?: Knex) => {
    try {
      const [secret] = await (tx || db)(TableName.ConsumerSecrets)
        .where({ id })
        .delete()
        .returning("*");
      return secret;
    } catch (error) {
      throw new DatabaseError({ error, name: "DeleteConsumerSecret" });
    }
  };

  return {
    ...consumerSecretsOrm,
    findCustomerSecretById,
    findAllOrganizationCustomerSecrets,
    upsertConsumerSecrets,
    deleteConsumerSecret
  };
};
