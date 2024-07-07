export type TCreateConsumerSecretDTO = {
  title: string;
  type: string;
  data: string;
  orgId: string;
  userId: string;
  comment?: string;
};

export type TUpdateConsumerSecret = {
  id: string;
  title?: string;
  type?: string;
  data?: string;
  comment?: string;
};
