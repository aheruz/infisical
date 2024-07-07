import { Knex } from "knex";

import { TDbClient } from "@app/db";
import { TableName, TConsumerSecrets, TConsumerSecretsInsert, TConsumerSecretsUpdate } from "@app/db/schemas";
import { DatabaseError } from "@app/lib/errors";
import { ormify, selectAllTableCols } from "@app/lib/knex";

export type TConsumerSecretsDALFactory = ReturnType<typeof consumerSecretsDALFactory>;

export const consumerSecretsDALFactory = (db: TDbClient) => {
  const consumerSecretsOrm = ormify(db, TableName.ConsumerSecrets);

  const findConsumerSecretById = async (id: string, tx?: Knex): Promise<TConsumerSecrets> => {
    try {
      const secret = await (tx || db.replicaNode())(TableName.ConsumerSecrets).where({ id }).first();
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

  const createConsumerSecret = async (data: TConsumerSecretsInsert, tx?: Knex) => {
    try {
      const [secret] = await (tx || db)(TableName.ConsumerSecrets).insert(data).returning("*");
      return secret;
    } catch (error) {
      throw new DatabaseError({ error, name: "CreateConsumerSecret" });
    }
  };

  const updateConsumerSecrets = async (id: string, data: TConsumerSecretsUpdate, tx?: Knex) => {
    try {
      const [secret] = await (tx || db)(TableName.ConsumerSecrets).where({ id }).update(data).returning("*");
      return secret;
    } catch (error) {
      throw new DatabaseError({ error, name: "UpsertConsumerSecrets" });
    }
  };

  const deleteConsumerSecret = async (id: string, tx?: Knex) => {
    try {
      const [secret] = await (tx || db)(TableName.ConsumerSecrets).where({ id }).delete().returning("*");
      return secret;
    } catch (error) {
      throw new DatabaseError({ error, name: "DeleteConsumerSecret" });
    }
  };

  return {
    ...consumerSecretsOrm,
    createConsumerSecret,
    findConsumerSecretById,
    findAllOrganizationCustomerSecrets,
    updateConsumerSecrets,
    deleteConsumerSecret
  };
};
