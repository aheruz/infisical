import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Modal, ModalContent } from "@app/components/v2";
import { useTimedReset } from "@app/hooks";
import { UsePopUpState } from "@app/hooks/usePopUp";
import { AddConsumerSecretForm } from "./AddConsumerSecretForm";
import { credentialConfig } from "./CredentialConfig";
import { ConsumerSecretType } from "./types";

type Props = {
  popUp: UsePopUpState<ConsumerSecretType[]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<ConsumerSecretType[]>,
    state?: boolean
  ) => void;
  isPublic: boolean;
  inModal: boolean;
};

export const AddConsumerSecretModal = ({ popUp, handlePopUpToggle, isPublic, inModal }: Props) => {

  const openPopUpKey = Object.keys(popUp).find(
    (key): key is keyof UsePopUpState<ConsumerSecretType[]> => popUp[key as keyof UsePopUpState<ConsumerSecretType[]>].isOpen
  );

  const getConfigAndSchema = (key: keyof UsePopUpState<ConsumerSecretType[]>) => {
    const config = credentialConfig[key as keyof typeof credentialConfig];
    const schema = "schema" in config ? config.schema : null;
    return { config, schema };
  };

  // validate required data
  if (!openPopUpKey) return null;
  const { config, schema } = getConfigAndSchema(openPopUpKey);
  if (!schema) return null;

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const [isSecretInputDisabled, setIsSecretInputDisabled] = useState(false);

  useEffect(() => {
    const currentModalType = openPopUpKey as keyof UsePopUpState<ConsumerSecretType[]>;
    if (popUp[currentModalType].data) {
      const data = popUp[currentModalType].data as { name: string; username: string; password: string };
      setValue("name", data.name);
      setValue("username", data.username);
      setValue("password", data.password);
      setIsSecretInputDisabled(true);
    }
  }, [popUp[openPopUpKey as keyof UsePopUpState<ConsumerSecretType[]>].data]);

  const onSubmit = async () => {
    handlePopUpToggle(openPopUpKey, false);
  };

  return (
    <Modal
      isOpen={popUp[openPopUpKey]?.isOpen}
      onOpenChange={(open) => {
        handlePopUpToggle(openPopUpKey, open);
        reset();
      }}
    >
      <ModalContent
        title={config.title}
        subTitle={config.description}
      >
        <AddConsumerSecretForm
          control={control}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isInputDisabled={isSecretInputDisabled}
          onSubmit={onSubmit}
          fields={config.fields}
        />
      </ModalContent>
    </Modal>
  );
};
