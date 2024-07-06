import { Knex } from "knex";

import { SecretEncryptionAlgo, SecretKeyEncoding, TableName } from "../schemas";
import { createOnUpdateTrigger, dropOnUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TableName.ConsumerSecrets))) {
        await knex.schema.createTable(TableName.ConsumerSecrets, (table) => {
            table.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
            table.uuid("userId").notNullable();
            table.uuid("orgId").notNullable();
            // encrypted fields
            table.text("titleCiphertext").notNullable();
            table.text("titleIV").notNullable();
            table.text("titleTag").notNullable();
            table.text("typeCiphertext").notNullable();
            table.text("typeIV").notNullable();
            table.text("typeTag").notNullable();
            table.text("dataCiphertext").notNullable();
            table.text("dataIV").notNullable();
            table.text("dataTag").notNullable();
            table.text("commentCiphertext").notNullable();
            table.text("commentIV").notNullable();
            table.text("commentTag").notNullable();
            // encryption settings
            table.string("algorithm").notNullable().defaultTo(SecretEncryptionAlgo.AES_256_GCM);
            table.string("keyEncoding").notNullable().defaultTo(SecretKeyEncoding.UTF8);
            table.timestamps(true, true);
            // foreign keys
            table.foreign("userId").references("id").inTable(TableName.Users).onDelete("CASCADE");
            table.foreign("orgId").references("id").inTable(TableName.Organization).onDelete("CASCADE");
        });
    }

    await createOnUpdateTrigger(knex, TableName.ConsumerSecrets);
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(TableName.ConsumerSecrets);
    await dropOnUpdateTrigger(knex, TableName.ConsumerSecrets);
}

