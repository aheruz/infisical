import { MutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@app/config/request";
import { consumerSecretKeys } from "./queries";
import {
  CreateConsumerSecretDTO,
  TUpdateConsumerSecretsDTO,
  TDeleteConsumerSecretsDTO
} from "./types";

export const useCreateConsumerSecret = ({
  options
}: {
  options?: Omit<MutationOptions<{}, {}, CreateConsumerSecretDTO>, "mutationFn">;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation<{}, {}, CreateConsumerSecretDTO>({
    mutationFn: async (dto) => {
      const { data } = await apiRequest.post("/api/v1/consumer-secrets", dto);
      return data;
    },
    onSuccess: (_, { workspaceId, environment, secretPath }) => {
      queryClient.invalidateQueries(
        consumerSecretKeys.getConsumerSecret({ workspaceId, environment, secretPath })
      );
    },
    ...options
  });
};

export const useUpdateConsumerSecret = ({
  options
}: {
  options?: Omit<MutationOptions<{}, {}, TUpdateConsumerSecretsDTO>, "mutationFn">;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation<{}, {}, TUpdateConsumerSecretsDTO>({
    mutationFn: async (dto) => {
      const { data } = await apiRequest.put(`/api/v1/consumer-secrets/${dto.id}`, dto);
      return data;
    },
    onSuccess: (_, { workspaceId, environment, secretPath }) => {
      queryClient.invalidateQueries(
        consumerSecretKeys.getConsumerSecret({ workspaceId, environment, secretPath })
      );
    },
    ...options
  });
};

export const useDeleteConsumerSecret = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, { message: string }, { id: string }>({
    mutationFn: async ({ id }: { id: string }) => {
      const { data } = await apiRequest.delete(`/api/v1/consumer-secrets/${id}`);
      return data;
    },
    onSuccess: (_, { workspaceId, environment, secretPath }) => {
      queryClient.invalidateQueries(
        consumerSecretKeys.getConsumerSecret({ workspaceId, environment, secretPath })
      );
    }
  });
};