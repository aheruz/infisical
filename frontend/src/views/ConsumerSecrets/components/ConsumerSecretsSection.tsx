import Head from "next/head";

import { createNotification } from "@app/components/notifications";
import { DeleteActionModal } from "@app/components/v2";
import { usePopUp } from "@app/hooks";
import { useDeleteConsumerSecret } from "@app/hooks/api/consumerSecrets";

import { AddConsumerSecretModal } from "./AddConsumerSecretModal";
import AddConsumerSecretButton from "./AddConsumerSecretButton";
import { ConsumerSecretsTable } from "./ConsumerSecretsTable";

type DeleteModalData = { name: string; id: string };

export const ConsumerSecretsSection = () => {
  const deleteConsumerSecret = useDeleteConsumerSecret();
  const { popUp, handlePopUpToggle, handlePopUpClose, handlePopUpOpen } = usePopUp([
    "weblogin",
    "creditcard",
    "securenote",
    "deleteConsumerSecretConfirmation",
    "editConsumerSecret"
  ] as const);

  const onDeleteApproved = async () => {
    try {
      deleteConsumerSecret.mutateAsync({
        id: (popUp?.deleteConsumerSecretConfirmation?.data as DeleteModalData)?.id
      });
      createNotification({
        text: "Successfully deleted shared secret",
        type: "success"
      });

      handlePopUpClose("deleteConsumerSecretConfirmation");
    } catch (err) {
      console.error(err);
      createNotification({
        text: "Failed to delete shared secret",
        type: "error"
      });
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-mineshaft-600 bg-mineshaft-900 p-4">
      <Head>
        <title>Secret Sharing</title>
        <link rel="icon" href="/infisical.ico" />
        <meta property="og:image" content="/images/message.png" />
      </Head>
      <div className="mb-2 flex justify-between">
        <p className="text-xl font-semibold text-mineshaft-100">Organizational Consumer Secrets</p>

        <AddConsumerSecretButton handlePopUpOpen={handlePopUpOpen} />
      </div>
      <ConsumerSecretsTable handlePopUpOpen={handlePopUpOpen} />
      <AddConsumerSecretModal
        popUp={popUp}
        handlePopUpToggle={handlePopUpToggle}
      />
      <DeleteActionModal
        isOpen={popUp.deleteConsumerSecretConfirmation.isOpen}
        title={`Delete ${
          (popUp?.deleteConsumerSecretConfirmation?.data as DeleteModalData)?.name || " "
        } consumer secret?`}
        onChange={(isOpen) => handlePopUpToggle("deleteConsumerSecretConfirmation", isOpen)}
        deleteKey={(popUp?.deleteConsumerSecretConfirmation?.data as DeleteModalData)?.name}
        onClose={() => handlePopUpClose("deleteConsumerSecretConfirmation")}
        onDeleteApproved={onDeleteApproved}
      />
    </div>
  );
};