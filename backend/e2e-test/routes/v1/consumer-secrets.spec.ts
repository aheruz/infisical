import { seedData1 } from "@app/db/seed-data";

const createConsumerSecret = async (dto: { title: string; type: string; data: string; comment?: string }) => {
  const res = await testServer.inject({
    method: "POST",
    url: `/api/v1/consumer-secrets`,
    headers: {
      authorization: `Bearer ${jwtAuthToken}`
    },
    body: {
      title: dto.title,
      type: dto.type,
      data: dto.data,
      comment: dto.comment  
    }
  });
  expect(res.statusCode).toBe(200);
  return res.json().id;
};

// const deleteConsumerSecret = async (id: string) => {
//   const res = await testServer.inject({
//     method: "DELETE",
//     url: `/api/v1/consumer-secrets/${id}`,
//     headers: {
//       authorization: `Bearer ${jwtAuthToken}`
//     }
//   });
//   expect(res.statusCode).toBe(200);
//   return res.json().id;
// };

describe("Consumer Secrets Router", async () => {
  test.each([
    { title: "secret1", type: "type1", data: "data1" },
    { title: "secret2", type: "type2", data: "data2", comment: "comment2" }
  ])("Create consumer secret $title", async ({ title, type, data, comment }) => {
    const createdSecretId = await createConsumerSecret({ title, type, data, comment });
    expect(createdSecretId).toEqual(expect.any(String));
    // await deleteConsumerSecret(createdSecretId);
  });
});

//   test("Get consumer secrets", async () => {
//     const createdSecretIds = await Promise.all([
//       createConsumerSecret({ title: "secret1", type: "type1", data: "data1" }),
//       createConsumerSecret({ title: "secret2", type: "type2", data: "data2", comment: "comment2" })
//     ]);

//     const res = await testServer.inject({
//       method: "GET",
//       url: `/api/v1/consumer-secrets`,
//       headers: {
//         authorization: `Bearer ${jwtAuthToken}`
//       },
//       query: {
//         orgId: seedData1.project.id
//       }
//     });

//     expect(res.statusCode).toBe(200);
//     const payload = JSON.parse(res.payload);
//     expect(payload).toHaveProperty("secrets");
//     expect(payload.secrets.length).toBeGreaterThanOrEqual(2);

//     await Promise.all(createdSecretIds.map(id => deleteConsumerSecret(id)));
//   });

//   test("Update a consumer secret", async () => {
//     const createdSecretId = await createConsumerSecret({ title: "secret-to-update", type: "type1", data: "data1" });

//     const res = await testServer.inject({
//       method: "PUT",
//       url: `/api/v1/consumer-secrets/${createdSecretId}`,
//       headers: {
//         authorization: `Bearer ${jwtAuthToken}`
//       },
//       body: {
//         title: "updated-secret",
//         type: "updated-type",
//         data: "updated-data"
//       }
//     });

//     expect(res.statusCode).toBe(200);
//     const updatedSecretId = res.json().id;
//     expect(updatedSecretId).toEqual(createdSecretId);

//     await deleteConsumerSecret(updatedSecretId);
//   });

//   test("Delete a consumer secret", async () => {
//     const createdSecretId = await createConsumerSecret({ title: "secret-to-delete", type: "type1", data: "data1" });

//     const res = await testServer.inject({
//       method: "DELETE",
//       url: `/api/v1/consumer-secrets/${createdSecretId}`,
//       headers: {
//         authorization: `Bearer ${jwtAuthToken}`
//       }
//     });

//     expect(res.statusCode).toBe(200);
//     const deletedSecretId = res.json().id;
//     expect(deletedSecretId).toEqual(createdSecretId);
//   });
// });
