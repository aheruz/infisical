import { z } from "zod";

import { CONSUMER_SECRETS } from "@app/lib/api-docs";
import { readLimit, writeLimit } from "@app/server/config/rateLimiter";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";

export const registerConsumerSecretsRouter = async (server: FastifyZodProvider) => {
  server.route({
    method: "GET",
    url: "/",
    config: {
      rateLimit: readLimit
    },
    schema: {
      description: "Retrieve the list of saved consumer secrets",
      response: {
        200: z.array(
          z.object({
            id: z.string().describe(CONSUMER_SECRETS.GET.id),
            userId: z.string().describe(CONSUMER_SECRETS.GET.userId),
            orgId: z.string().describe(CONSUMER_SECRETS.GET.orgId),
            title: z.string().describe(CONSUMER_SECRETS.GET.title),
            type: z.string().describe(CONSUMER_SECRETS.GET.type),
            data: z.string().describe(CONSUMER_SECRETS.GET.data),
            comment: z.string().optional().describe(CONSUMER_SECRETS.GET.comment)
          })
        )
      }
    },
    onRequest: verifyAuth([AuthMode.JWT, AuthMode.API_KEY, AuthMode.SERVICE_TOKEN, AuthMode.IDENTITY_ACCESS_TOKEN]),
    handler: async (req) => {
      return await server.services.consumerSecrets.findAllOrganizationCustomerSecrets(
        req.permission.orgId,
        req.permission.id
      );
    }
  });

  server.route({
    method: "POST",
    url: "/",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      description: "Add a new set of consumer secrets",
      security: [
        {
          bearerAuth: []
        }
      ],
      body: z.object({
        title: z.string().describe(CONSUMER_SECRETS.POST.title),
        type: z.string().describe(CONSUMER_SECRETS.POST.type),
        data: z.string().describe(CONSUMER_SECRETS.POST.data),
        comment: z.string().optional().describe(CONSUMER_SECRETS.POST.comment)
      }),
      response: {
        200: z.object({
          id: z.string().describe(CONSUMER_SECRETS.POST.id)
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT, AuthMode.API_KEY, AuthMode.SERVICE_TOKEN, AuthMode.IDENTITY_ACCESS_TOKEN], ),
    handler: async (req) => {
      const { title, type, data, comment } = req.body;
      const newSecret = await server.services.consumerSecrets.createConsumerSecret({
        title,
        type,
        data,
        comment,
        orgId: req.permission.orgId,
        userId: req.permission.id
      });

      return { id: newSecret.id };
    }
  });

  server.route({
    method: "PUT",
    url: "/:id",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      description: "Modify existing consumer secrets",
      params: z.object({
        id: z.string().describe(CONSUMER_SECRETS.PUT.id)
      }),
      body: z.object({
        title: z.string().optional().describe(CONSUMER_SECRETS.PUT.title),
        type: z.string().optional().describe(CONSUMER_SECRETS.PUT.type),
        data: z.string().optional().describe(CONSUMER_SECRETS.PUT.data),
        comment: z.string().optional().describe(CONSUMER_SECRETS.PUT.comment)
      }),
      response: {
        200: z.object({
          id: z.string().describe(CONSUMER_SECRETS.PUT.id)
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT, AuthMode.API_KEY, AuthMode.SERVICE_TOKEN, AuthMode.IDENTITY_ACCESS_TOKEN]),
    handler: async (req) => {
      const { id } = req.params;
      const { title, type, data, comment } = req.body;
      const updates = { id, title, type, data, comment };

      const updatedSecret = await server.services.consumerSecrets.updateConsumerSecrets(
        updates,
        req.permission.orgId,
        req.permission.id
      );

      return { id: updatedSecret.id };
    }
  });

  server.route({
    method: "DELETE",
    url: "/:id",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      description: "Remove consumer secrets",
      params: z.object({
        id: z.string().describe(CONSUMER_SECRETS.DELETE.id)
      }),
      response: {
        200: z.object({
          id: z.string().describe(CONSUMER_SECRETS.DELETE.id)
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT, AuthMode.API_KEY, AuthMode.SERVICE_TOKEN, AuthMode.IDENTITY_ACCESS_TOKEN]),
    handler: async (req) => {
      const { id } = req.params;
      await server.services.consumerSecrets.deleteConsumerSecret(id);
      return { id };
    }
  });
};
