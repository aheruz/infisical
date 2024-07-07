export type TCreateConsumerSecretDTO = {
  title: string;
  type: string;
  data: string;
  orgId: string;
  userId: string;
  comment?: string;
};

export type TUpdateConsumerSecretDTO = {
  id: string;
  title?: string;
  type?: string;
  data?: string;
  comment?: string;
  orgId: string;
};
